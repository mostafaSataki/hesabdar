import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let checks = [
  {
    id: '1',
    number: 'چک-001',
    amount: 10000000,
    date: '2024-12-21',
    dueDate: '2025-01-20',
    status: 'PENDING',
    type: 'RECEIPT',
    relatedParty: 'شرکت الف',
    bankAccountId: '1',
    description: 'چک مربوط به فاکتور فروش شماره 123',
    settlementDate: null,
    settlementAmount: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    number: 'چک-002',
    amount: 5000000,
    date: '2024-12-22',
    dueDate: '2024-12-30',
    status: 'CLEARED',
    type: 'PAYMENT',
    relatedParty: 'تأمین‌کننده الف',
    bankAccountId: '2',
    description: 'پرداخت به تأمین‌کننده',
    settlementDate: '2024-12-30T10:30:00Z',
    settlementAmount: 5000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    number: 'چک-003',
    amount: 8000000,
    date: '2024-12-23',
    dueDate: '2024-12-25',
    status: 'BOUNCED',
    type: 'RECEIPT',
    relatedParty: 'فروشگاه ب',
    bankAccountId: '3',
    description: 'چک برگشتی',
    settlementDate: '2024-12-26T14:15:00Z',
    settlementAmount: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    number: 'چک-004',
    amount: 15000000,
    date: '2024-12-24',
    dueDate: '2025-02-20',
    status: 'PENDING',
    type: 'PAYMENT',
    relatedParty: 'شرکت ج',
    bankAccountId: '1',
    description: 'پرداخت قسط',
    settlementDate: null,
    settlementAmount: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let bankAccounts = [
  { id: '1', accountNumber: '1234-5678-9012-3456', bankName: 'بانک ملت', branchName: 'شعبه مرکزی', balance: 50000000 },
  { id: '2', accountNumber: '9876-5432-1098-7654', bankName: 'بانک ملی', branchName: 'شعبه ولیعصر', balance: 30000000 },
  { id: '3', accountNumber: '5555-6666-7777-8888', bankName: 'بانک تجارت', branchName: 'شعبه آزادی', balance: 20000000 },
];

const settlementSchema = z.object({
  settlementDate: z.string().min(1, 'Settlement date is required'),
  settlementAmount: z.number().positive('Settlement amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['CLEARED', 'BOUNCED']),
});

// Helper function to calculate days until due and overdue status
const calculateCheckStatus = (check: any) => {
  const today = new Date();
  const dueDate = new Date(check.dueDate);
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysUntilDue < 0 && check.status === 'PENDING';
  
  return {
    daysUntilDue,
    isOverdue,
  };
};

// GET single check
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const check = checks.find(c => c.id === params.id);
    
    if (!check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
    const statusInfo = calculateCheckStatus(check);

    const responseCheck = {
      ...check,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
      ...statusInfo,
    };

    return NextResponse.json(responseCheck);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch check' },
      { status: 500 }
    );
  }
}

// PUT update check
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const check = checks.find(c => c.id === params.id);
    
    if (!check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Update check
    Object.assign(check, {
      ...body,
      updatedAt: new Date().toISOString(),
    });

    const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
    const statusInfo = calculateCheckStatus(check);

    const responseCheck = {
      ...check,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
      ...statusInfo,
    };

    return NextResponse.json(responseCheck);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update check' },
      { status: 500 }
    );
  }
}

// POST settle check
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const check = checks.find(c => c.id === params.id);
    
    if (!check) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    if (check.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Only pending checks can be settled' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = settlementSchema.parse(body);

    // Update check
    Object.assign(check, {
      status: validatedData.status,
      settlementDate: validatedData.settlementDate,
      settlementAmount: validatedData.settlementAmount,
      updatedAt: new Date().toISOString(),
    });

    const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
    const statusInfo = calculateCheckStatus(check);

    const responseCheck = {
      ...check,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
      ...statusInfo,
    };

    return NextResponse.json({
      check: responseCheck,
      message: 'Check settled successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to settle check' },
      { status: 500 }
    );
  }
}

// DELETE check
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const checkIndex = checks.findIndex(c => c.id === params.id);
    
    if (checkIndex === -1) {
      return NextResponse.json(
        { error: 'Check not found' },
        { status: 404 }
      );
    }

    const check = checks[checkIndex];

    // Cannot delete settled checks
    if (check.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Cannot delete a settled check' },
        { status: 400 }
      );
    }

    checks.splice(checkIndex, 1);

    return NextResponse.json({ message: 'Check deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete check' },
      { status: 500 }
    );
  }
}