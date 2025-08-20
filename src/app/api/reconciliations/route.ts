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

const reconciliationSchema = z.object({
  bankAccountId: z.string().min(1, 'Bank account is required'),
  statementDate: z.string().min(1, 'Statement date is required'),
  statementBalance: z.number().positive('Statement balance must be positive'),
  systemBalance: z.number().positive('System balance must be positive'),
  description: z.string().optional(),
});

const discrepancySchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['MISSING_TRANSACTION', 'DUPLICATE_TRANSACTION', 'AMOUNT_DIFFERENCE', 'DATE_DIFFERENCE', 'OTHER']),
  description: z.string().min(1, 'Description is required'),
  resolution: z.string().optional(),
});

// Helper function to calculate difference
const calculateDifference = (statementBalance: number, systemBalance: number) => {
  return statementBalance - systemBalance;
};

// GET all reconciliations
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const bankAccountId = searchParams.get('bankAccountId');
    const search = searchParams.get('search');

    let filteredReconciliations = reconciliations.map(rec => {
      const bankAccount = bankAccounts.find(acc => acc.id === rec.bankAccountId);
      return {
        ...rec,
        bankName: bankAccount?.bankName || '',
        branchName: bankAccount?.branchName || '',
      };
    });

    if (status) {
      filteredReconciliations = filteredReconciliations.filter(rec => rec.status === status);
    }

    if (bankAccountId) {
      filteredReconciliations = filteredReconciliations.filter(rec => rec.bankAccountId === bankAccountId);
    }

    if (search) {
      filteredReconciliations = filteredReconciliations.filter(rec =>
        rec.bankName.includes(search) ||
        rec.accountNumber.includes(search) ||
        rec.description?.includes(search)
      );
    }

    // Sort by creation date (newest first)
    filteredReconciliations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filteredReconciliations);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reconciliations' },
      { status: 500 }
    );
  }
}

// POST create new reconciliation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = reconciliationSchema.parse(body);

    // Validate bank account exists
    const bankAccount = bankAccounts.find(acc => acc.id === validatedData.bankAccountId);
    if (!bankAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 400 }
      );
    }

    // Calculate difference
    const difference = calculateDifference(validatedData.statementBalance, validatedData.systemBalance);

    const newReconciliation = {
      id: Date.now().toString(),
      ...validatedData,
      bankName: bankAccount.bankName,
      accountNumber: bankAccount.accountNumber,
      difference,
      status: 'PENDING',
      discrepancies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    reconciliations.push(newReconciliation);

    return NextResponse.json(newReconciliation, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create reconciliation' },
      { status: 500 }
    );
  }
}