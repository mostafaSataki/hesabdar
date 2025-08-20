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

// GET single supplier
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = suppliers.find(s => s.id === params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const responseSupplier = {
      ...supplier,
      status: getSupplierStatus(supplier),
    };

    return NextResponse.json(responseSupplier);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch supplier' },
      { status: 500 }
    );
  }
}

// PUT update supplier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = suppliers.find(s => s.id === params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = supplierSchema.parse(body);

    // Check if supplier code already exists (excluding current supplier)
    if (supplierCodeExists(validatedData.code, params.id)) {
      return NextResponse.json(
        { error: 'Supplier code already exists' },
        { status: 400 }
      );
    }

    // Update supplier
    Object.assign(supplier, {
      ...validatedData,
      updatedAt: new Date().toISOString(),
    });

    const responseSupplier = {
      ...supplier,
      status: getSupplierStatus(supplier),
    };

    return NextResponse.json(responseSupplier);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update supplier' },
      { status: 500 }
    );
  }
}

// DELETE supplier
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplierIndex = suppliers.findIndex(s => s.id === params.id);
    
    if (supplierIndex === -1) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const supplier = suppliers[supplierIndex];

    // Check if supplier has active purchases
    if (supplier.totalPurchases > 0) {
      return NextResponse.json(
        { error: 'Cannot delete supplier with active purchases' },
        { status: 400 }
      );
    }

    suppliers.splice(supplierIndex, 1);

    return NextResponse.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete supplier' },
      { status: 500 }
    );
  }
}

// PATCH update supplier purchase info
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supplier = suppliers.find(s => s.id === params.id);
    
    if (!supplier) {
      return NextResponse.json(
        { error: 'Supplier not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, purchaseDate } = body;

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid purchase amount' },
        { status: 400 }
      );
    }

    if (!purchaseDate) {
      return NextResponse.json(
        { error: 'Purchase date is required' },
        { status: 400 }
      );
    }

    // Update supplier purchase info
    const oldTotalPurchases = supplier.totalPurchases;
    supplier.totalPurchases += amount;
    supplier.lastPurchaseDate = purchaseDate;
    supplier.updatedAt = new Date().toISOString();

    const responseSupplier = {
      ...supplier,
      status: getSupplierStatus(supplier),
    };

    return NextResponse.json({
      supplier: responseSupplier,
      purchase: {
        amount,
        purchaseDate,
        oldTotalPurchases,
        newTotalPurchases: supplier.totalPurchases,
      },
      message: 'Supplier purchase info updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update supplier purchase info' },
      { status: 500 }
    );
  }
}