const API_BASE = 'http://localhost:3000';

async function request(path: string, options: any = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  return { status: res.status, body };
}

async function verifyE2E() {
  console.log('=== STARTING RUNTIME E2E VERIFICATION ===\n');

  // 1. Login to obtain JWT token
  console.log('Step 1: Logging in as admin...');
  const loginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@erp.local',
      password: 'Password123!',
    }),
  });

  const token = loginRes.body.data?.token || loginRes.body.token;
  if (!token) {
    console.error('Failed to get token:', loginRes.body);
    process.exit(1);
  }
  console.log('Login successful. JWT token acquired.\n');

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch Customers & Products
  const customersRes = await request('/customers', { headers });
  const productsRes = await request('/products', { headers });

  const customersList = customersRes.body.data || [];
  const productsList = productsRes.body.data || [];

  const customer = customersList[0];
  const lowStockProduct = productsList.find((p: any) => p.currentStock > 0 && p.currentStock < 20) || productsList[0];
  const normalProduct = productsList.find((p: any) => p.currentStock >= 20) || productsList[0];

  if (!customer || !lowStockProduct || !normalProduct) {
    console.error('Missing test entities:', { customer, lowStockProduct, normalProduct });
    process.exit(1);
  }

  console.log(`Test Subject Customer: ${customer.businessName} (ID: ${customer.id})`);
  console.log(`Test Subject Product 1 (Low Stock): ${lowStockProduct.name} - Stock: ${lowStockProduct.currentStock}`);
  console.log(`Test Subject Product 2 (Sufficient Stock): ${normalProduct.name} - Stock: ${normalProduct.currentStock}\n`);

  // ==========================================
  // TEST SCENARIO A: Over-ordering Stock Validation
  // ==========================================
  console.log('=== TEST SCENARIO A: Over-ordering Stock Validation & Transaction Rollback ===');
  const overOrderQty = lowStockProduct.currentStock + 500;
  console.log(`Attempting to create CONFIRMED challan for ${overOrderQty} units of ${lowStockProduct.name} (Available: ${lowStockProduct.currentStock})...`);

  const overOrderRes = await request('/challans', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customerId: customer.id,
      status: 'CONFIRMED',
      items: [{ productId: lowStockProduct.id, quantity: overOrderQty }],
    }),
  });

  if (overOrderRes.status === 400) {
    console.log('PASSED: Clean 400 error returned by server as expected.');
    console.log('Server Error Payload:', JSON.stringify(overOrderRes.body, null, 2));
  } else {
    console.error(`FAILED: Expected HTTP 400, got ${overOrderRes.status}`, overOrderRes.body);
    process.exit(1);
  }

  // Verify stock was NOT modified
  const verifyStockResA = await request(`/products/${lowStockProduct.id}`, { headers });
  const freshStockA = verifyStockResA.body.data?.currentStock ?? verifyStockResA.body.currentStock;
  if (freshStockA === lowStockProduct.currentStock) {
    console.log(`PASSED: Product currentStock remained untouched at ${lowStockProduct.currentStock} (No partial data written).\n`);
  } else {
    console.error(`FAILED: Stock changed to ${freshStockA}!`);
    process.exit(1);
  }

  // ==========================================
  // TEST SCENARIO B: Full Lifecycle Cycle (Draft -> Confirm -> Reduced -> Cancel -> Reverted)
  // ==========================================
  console.log('=== TEST SCENARIO B: Full Lifecycle Cycle (Draft -> Confirm -> Cancel) ===');
  
  const initialStock = normalProduct.currentStock;
  const orderQty = 5;
  console.log(`Initial stock for ${normalProduct.name}: ${initialStock}`);

  // B1. Create DRAFT Challan
  console.log(`1. Creating DRAFT challan for quantity: ${orderQty}...`);
  const draftRes = await request('/challans', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      customerId: customer.id,
      status: 'DRAFT',
      items: [{ productId: normalProduct.id, quantity: orderQty }],
    }),
  });

  if (draftRes.status !== 201) {
    console.error('FAILED to create DRAFT challan:', draftRes.body);
    process.exit(1);
  }

  const createdChallan = draftRes.body.data || draftRes.body;
  const challanId = createdChallan.id;
  const challanNum = createdChallan.challanNumber;
  console.log(`Challan created: ${challanNum} (ID: ${challanId}), Status: ${createdChallan.status}`);

  // Verify stock unchanged for DRAFT
  const checkDraftStockRes = await request(`/products/${normalProduct.id}`, { headers });
  const checkDraftStock = checkDraftStockRes.body.data?.currentStock ?? checkDraftStockRes.body.currentStock;
  if (checkDraftStock === initialStock) {
    console.log(`PASSED: Stock remains ${initialStock} during DRAFT state.`);
  } else {
    console.error(`FAILED: DRAFT state changed stock to ${checkDraftStock}!`);
    process.exit(1);
  }

  // B2. Confirm Challan
  console.log(`2. Confirming Challan #${challanNum}...`);
  const confirmRes = await request(`/challans/${challanId}/confirm`, {
    method: 'PATCH',
    headers,
  });

  if (confirmRes.status !== 200) {
    console.error('FAILED to confirm challan:', confirmRes.body);
    process.exit(1);
  }
  const confirmedChallan = confirmRes.body.data || confirmRes.body;
  console.log(`Challan status updated to: ${confirmedChallan.status}`);

  const checkConfirmedStockRes = await request(`/products/${normalProduct.id}`, { headers });
  const checkConfirmedStock = checkConfirmedStockRes.body.data?.currentStock ?? checkConfirmedStockRes.body.currentStock;
  const expectedConfirmedStock = initialStock - orderQty;
  if (checkConfirmedStock === expectedConfirmedStock) {
    console.log(`PASSED: Stock reduced correctly from ${initialStock} -> ${checkConfirmedStock}.`);
  } else {
    console.error(`FAILED: Expected stock ${expectedConfirmedStock}, got ${checkConfirmedStock}!`);
    process.exit(1);
  }

  // Verify OUT stock movement logged
  const movementsRes1 = await request(`/stock-movements?productId=${normalProduct.id}`, { headers });
  const movementsList1 = movementsRes1.body.data || [];
  const outMovement = movementsList1.find((m: any) => m.reason.includes(challanNum) && m.type === 'OUT');
  if (outMovement && outMovement.quantity === orderQty) {
    console.log(`PASSED: OUT Stock Movement logged (${outMovement.type} ${outMovement.quantity}, Reason: "${outMovement.reason}").`);
  } else {
    console.error('FAILED: OUT Stock Movement entry missing or incorrect!');
    process.exit(1);
  }

  // B3. Cancel Challan
  console.log(`3. Cancelling Challan #${challanNum}...`);
  const cancelRes = await request(`/challans/${challanId}/cancel`, {
    method: 'PATCH',
    headers,
  });

  if (cancelRes.status !== 200) {
    console.error('FAILED to cancel challan:', cancelRes.body);
    process.exit(1);
  }
  const cancelledChallan = cancelRes.body.data || cancelRes.body;
  console.log(`Challan status updated to: ${cancelledChallan.status}`);

  const checkCancelledStockRes = await request(`/products/${normalProduct.id}`, { headers });
  const checkCancelledStock = checkCancelledStockRes.body.data?.currentStock ?? checkCancelledStockRes.body.currentStock;
  if (checkCancelledStock === initialStock) {
    console.log(`PASSED: Stock reverted back to original level: ${checkCancelledStock}.`);
  } else {
    console.error(`FAILED: Expected stock ${initialStock}, got ${checkCancelledStock}!`);
    process.exit(1);
  }

  // Verify IN stock movement logged
  const movementsRes2 = await request(`/stock-movements?productId=${normalProduct.id}`, { headers });
  const movementsList2 = movementsRes2.body.data || [];
  const inMovement = movementsList2.find((m: any) => m.reason.includes(challanNum) && m.type === 'IN');
  if (inMovement && inMovement.quantity === orderQty) {
    console.log(`PASSED: IN Stock Movement logged (${inMovement.type} ${inMovement.quantity}, Reason: "${inMovement.reason}").`);
  } else {
    console.error('FAILED: IN Stock Movement entry missing or incorrect!');
    process.exit(1);
  }

  console.log('\n=========================================================');
  console.log('ALL E2E VERIFICATION TESTS PASSED SUCCESSFULLY! 100% VERIFIED');
  console.log('=========================================================\n');
}

verifyE2E().catch((err) => {
  console.error('E2E Test Failed with error:', err);
  process.exit(1);
});
