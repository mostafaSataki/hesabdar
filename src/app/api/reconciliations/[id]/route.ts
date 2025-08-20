import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let reconciliations = [
  {
    id: '1',
    bankAccountId: '1',
    bankName: 'بانک ملت',
    accountNumber: '1234-5678-9012-3456',
    statementDate: '2024-12-21',
    statementBalance: 48500000,
    systemBalance: 50000000,
    difference: -1500000,
    status: 'PENDING',
    description: 'مغایرت در تراکنش‌های روز آخر',
    discrepancies: [
      {
        id: '1',
        amount: 1000000,
        type: 'MISSING_TRANSACTION',
        description: 'تراکنش واریز به حساب در سیستم ثبت نشده',
        status: 'OPEN',
      },
      {
        id: '2',
        amount: 500000,
        type: 'AMOUNT_DIFFERENCE',
        description: 'تفاوت مبلغ در تراکنش خرید',
        status: 'OPEN',
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    bankAccountId: '2',
    bankName: 'بانک ملی',
    accountNumber: '9876-5432-1098-7654',
    statementDate: '2024-11-30',
    statementBalance: 29500000,
    systemBalance: 29500000,
    difference: 0,
    status: 'COMPLETED',
    description: 'Reconciliation موفق',
    discrepancies: [],
    reconciledAt: '2024-12-02T10:30:00Z',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

let bankAccounts = [
  { id: '1', accountNumber: '1234-5678-9012-3456', bankName: 'بانک ملت', branchName: 'شعبه مرکزی', balance: 50000000 },
  { id: '2', accountNumber: '9876-5432-1098-7654', bankName: 'بانک ملی', branchName: 'شعبه ولیعصر', balance: 30000000 },
  { id: '3', accountNumber: '5555-6666-7777-8888', bankName: 'بانک تجارت', branchName: 'شعبه آزادی', balance: 20000000 },
];

const discrepancySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['MISSING_TRANSACTION', 'DUPLICATE_TRANSACTION', 'AMOUNT_DIFFERENCE', 'DATE_DIFFERENCE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
  resolution: z.string().optional(),
});

// GET single reconciliation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reconciliation = reconciliations.find(r => r.id === params.id);
    
    if (!reconciliation) {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    const bankAccount = bankAccounts.find(acc => acc.id === reconciliation.bankAccountId);

    const responseReconciliation = {
      ...reconciliation,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
    };

    return NextResponse.json(responseReconciliation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reconciliation' },
      { status: 500 }
    );
  }
}

// PUT update reconciliation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reconciliation = reconciliations.find(r => r.id === params.id);
    
    if (!reconciliation) {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Update reconciliation
    Object.assign(reconciliation, {
      ...body,
      updatedAt: new Date().toISOString(),
    });

    const bankAccount = bankAccounts.find(acc => acc.id === reconciliation.bankAccountId);

    const responseReconciliation = {
      ...reconciliation,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
    };

    return NextResponse.json(responseReconciliation);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update reconciliation' },
      { status: 500 }
    );
  }
}

// POST add discrepancy to reconciliation
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reconciliation = reconciliations.find(r => r.id === params.id);
    
    if (!reconciliation) {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    if (reconciliation.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only add discrepancies to pending reconciliations' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = discrepancySchema.parse(body);

    const newDiscrepancy = {
      id: Date.now().toString(),
      ...validatedData,
      status: 'OPEN',
    };

    reconciliation.discrepancies.push(newDiscrepancy);
    reconciliation.updatedAt = new Date().toISOString();

    const bankAccount = bankAccounts.find(acc => acc.id === reconciliation.bankAccountId);

    const responseReconciliation = {
      ...reconciliation,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
    };

    return NextResponse.json({
      reconciliation: responseReconciliation,
      discrepancy: newDiscrepancy,
      message: 'Discrepancy added successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to add discrepancy' },
      { status: 500 }
    );
  }
}

// DELETE reconciliation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const reconciliationIndex = reconciliations.findIndex(r => r.id === params.id);
    
    if (reconciliationIndex === -1) {
      return NextResponse.json(
        { error: 'Reconciliation not found' },
        { status: 404 }
      );
    }

    const reconciliation = reconciliations[reconciliationIndex];

    // Cannot delete completed reconciliations
    if (reconciliation.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete a completed reconciliation' },
        { status: 400 }
      );
    }

    reconciliations.splice(reconciliationIndex, 1);

    return NextResponse.json({ message: 'Reconciliation deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete reconciliation' },
      { status: 500 }
    );
  }
}