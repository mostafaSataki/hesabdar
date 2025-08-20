import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let suppliers = [
  {
    id: '1',
    code: '001',
    name: 'شرکت واردات الف',
    address: 'تهران، خیابان ولیعصر، پلاک 123',
    phone: '021-12345678',
    email: 'info@company-a.com',
    taxId: '1234567890',
    bankAccount: '1234-5678-9012-3456',
    creditLimit: 500000000,
    paymentTerms: '30 روز',
    isActive: true,
    totalPurchases: 2500000000,
    lastPurchaseDate: '2024-12-10',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '002',
    name: 'فروشگاه عمده ب',
    address: 'اصفهان، میدان نقش جهان، خیابان امام',
    phone: '031-87654321',
    email: 'sales@wholesale-b.com',
    bankAccount: '9876-5432-1098-7654',
    creditLimit: 300000000,
    paymentTerms: '15 روز',
    isActive: true,
    totalPurchases: 1200000000,
    lastPurchaseDate: '2024-12-05',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: '003',
    name: 'تولید کننده ج',
    address: 'شیراز، خیابان زند، پلاک 456',
    phone: '071-11223344',
    email: 'contact@manufacturer-j.com',
    taxId: '0987654321',
    bankAccount: '5555-6666-7777-8888',
    creditLimit: 800000000,
    paymentTerms: '60 روز',
    isActive: true,
    totalPurchases: 3800000000,
    lastPurchaseDate: '2024-12-15',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const supplierSchema = z.object({
  code: z.string().min(1, 'Supplier code is required'),
  name: z.string().min(1, 'Supplier name is required'),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().min(1, 'Phone is required'),
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  taxId: z.string().optional(),
  bankAccount: z.string().optional(),
  creditLimit: z.number().positive('Credit limit must be positive').optional(),
  paymentTerms: z.string().optional(),
});

// Helper function to check if supplier code exists
const supplierCodeExists = (code: string, excludeId?: string) => {
  return suppliers.some(s => s.code === code && s.id !== excludeId);
};

// Helper function to get supplier status
const getSupplierStatus = (supplier: any) => {
  if (!supplier.isActive) {
    return 'INACTIVE';
  }
  
  const creditUtilization = supplier.totalPurchases / (supplier.creditLimit || Infinity);
  if (creditUtilization >= 0.9) {
    return 'HIGH_CREDIT_USAGE';
  } else if (creditUtilization >= 0.7) {
    return 'MEDIUM_CREDIT_USAGE';
  } else {
    return 'ACTIVE';
  }
};

// GET all suppliers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const active = searchParams.get('active');
    const paymentTerms = searchParams.get('paymentTerms');

    let filteredSuppliers = suppliers.map(supplier => ({
      ...supplier,
      status: getSupplierStatus(supplier),
    }));

    if (search) {
      filteredSuppliers = filteredSuppliers.filter(s =>
        s.name.includes(search) ||
        s.code.includes(search) ||
        s.address.includes(search) ||
        s.email?.includes(search)
      );
    }

    if (active !== null) {
      const isActive = active === 'true';
      filteredSuppliers = filteredSuppliers.filter(s => s.isActive === isActive);
    }

    if (paymentTerms) {
      filteredSuppliers = filteredSuppliers.filter(s => s.paymentTerms === paymentTerms);
    }

    // Sort by total purchases (highest first)
    filteredSuppliers.sort((a, b) => b.totalPurchases - a.totalPurchases);

    return NextResponse.json(filteredSuppliers);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch suppliers' },
      { status: 500 }
    );
  }
}

// POST create new supplier
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = supplierSchema.parse(body);

    // Check if supplier code already exists
    if (supplierCodeExists(validatedData.code)) {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 400 }
      );
    }

    const newSupplier = {
      id: Date.now().toString(),
      ...validatedData,
      isActive: true,
      totalPurchases: 0,
      lastPurchaseDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    suppliers.push(newSupplier);

    const responseSupplier = {
      ...newSupplier,
      status: getSupplierStatus(newSupplier),
    };

    return NextResponse.json(responseSupplier, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create supplier' },
      { status: 500 }
    );
  }
}