"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customers_controller_1 = require("./customers.controller");
const validate_1 = require("../../middleware/validate");
const auth_1 = require("../../middleware/auth");
const customers_schema_1 = require("./customers.schema");
const router = (0, express_1.Router)();
// All customer routes require authentication
router.use(auth_1.authenticate);
// Read access is open to all authenticated roles
router.get('/', customers_controller_1.listCustomers);
router.get('/:id', customers_controller_1.getCustomerDetails);
// Write access is restricted to ADMIN and SALES roles
router.post('/', (0, auth_1.authorize)('ADMIN', 'SALES'), (0, validate_1.validateRequest)(customers_schema_1.createCustomerSchema), customers_controller_1.createCustomer);
router.put('/:id', (0, auth_1.authorize)('ADMIN', 'SALES'), (0, validate_1.validateRequest)(customers_schema_1.updateCustomerSchema), customers_controller_1.updateCustomer);
router.post('/:id/notes', (0, auth_1.authorize)('ADMIN', 'SALES'), (0, validate_1.validateRequest)(customers_schema_1.createCustomerNoteSchema), customers_controller_1.addCustomerNote);
exports.default = router;
