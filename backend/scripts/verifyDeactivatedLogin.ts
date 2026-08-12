import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { login } from '../src/modules/auth/auth.controller';
import { Request, Response } from 'express';

const prisma = new PrismaClient();

async function testDeactivatedLogin() {
  try {
    console.log('Creating deactivated user in DB...');
    const email = `test.deactivated.${Date.now()}@example.com`;
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Deactivated Tester',
        email,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: false, // DEACTIVATED
      }
    });
    
    console.log('User created:', user.email);

    console.log('Attempting login directly via controller...');
    
    let statusCode = 200;
    let responseData: any = null;

    const req = {
      body: { email, password }
    } as Request;

    const res = {
      status: (code: number) => {
        statusCode = code;
        return res;
      },
      json: (data: any) => {
        responseData = data;
        return res;
      }
    } as Response;

    await login(req, res);
    
    console.log('Status code:', statusCode);
    console.log('Response body:', responseData);
    
    if (statusCode === 401 && responseData.error === 'Invalid email or password') {
      console.log('SUCCESS: Deactivated user login blocked correctly with 401.');
    } else {
      console.log('FAILED: Deactivated user login behaved unexpectedly.');
    }
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDeactivatedLogin();
