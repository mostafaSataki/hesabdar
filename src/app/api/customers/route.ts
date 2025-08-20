import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let customers = [
  {
    id: '1',
    code: '001',
    name: 'شرکت الف',
    address: 'تهران، خیابان ولیعصر',
    phone: '021-12345678',
    email: 'info@company-a.com',
    taxId: '1234567890',
    creditLimit: 100000000,
    balance: 5000000,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '002',
    name: 'فروشگاه ب',
    address: 'اصفهان، میدان نقش جهان',
    phone: '031-87654321',
    email: 'sales@shop-b.com',
    taxId: '',
    creditLimit: 50000000,
    balance: -2000000,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const customerSchema = z.object({
  code: z.string().min(1, 'Customer code is required'),
  name: z.string().min(1, 'Customer name is required'),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  taxId: z.string().optional(),
  creditLimit: z.number().min(0).optional(),
  isActive: z.boolean().default(true),
});

// GET all customers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const isActive = searchParams.get('isActive');

    let filteredCustomers = customers;

    if (search) {
      filteredCustomers = filteredCustomers.filter(customer =>
        customer.name.includes(search) ||
        customer.code.includes(search) ||
        customer.email?.includes(search)
      );
    }

    if (isActive !== null) {
      const activeFilter = isActive === 'true';
      filteredCustomers = filteredCustomers.filter(customer => customer.isActive === activeFilter);
    }

    return NextResponse.json(filteredCustomers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST create new customer
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    const newCustomer = {
      id: Date.now().toString(),
      ...validatedData,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    customers.push(newCustomer);

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}