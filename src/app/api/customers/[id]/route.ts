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

// GET single customer
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customer = customers.find(c => c.id === params.id);
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(customer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

// PUT update customer
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = customerSchema.parse(body);

    const customerIndex = customers.findIndex(c => c.id === params.id);
    
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const updatedCustomer = {
      ...customers[customerIndex],
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    customers[customerIndex] = updatedCustomer;

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE customer
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerIndex = customers.findIndex(c => c.id === params.id);
    
    if (customerIndex === -1) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    customers.splice(customerIndex, 1);

    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}