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

const checkSchema = z.object({
  number: z.string().min(1, 'Check number is required'),
  amount: z.number().positive('Amount must be positive'),
  date: z.string().min(1, 'Issue date is required'),
  dueDate: z.string().min(1, 'Due date is required'),
  type: z.enum(['RECEIPT', 'PAYMENT']),
  relatedParty: z.string().min(1, 'Related party is required'),
  bankAccountId: z.string().min(1, 'Bank account is required'),
  description: z.string().optional(),
});

const settlementSchema = z.object({
  settlementDate: z.string().min(1, 'Settlement date is required'),
  settlementAmount: z.number().positive('Settlement amount must be positive'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['CLEARED', 'BOUNCED']),
});

const batchSettlementSchema = z.object({
  checkIds: z.array(z.string()).min(1, 'At least one check is required'),
  settlementDate: z.string().min(1, 'Settlement date is required'),
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

// GET all checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const search = searchParams.get('search');
    const bankAccountId = searchParams.get('bankAccountId');

    let filteredChecks = checks.map(check => {
      const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
      const statusInfo = calculateCheckStatus(check);
      
      return {
        ...check,
        bankName: bankAccount?.bankName || '',
        branchName: bankAccount?.branchName || '',
        ...statusInfo,
      };
    });

    if (status) {
      filteredChecks = filteredChecks.filter(check => check.status === status);
    }

    if (type) {
      filteredChecks = filteredChecks.filter(check => check.type === type);
    }

    if (bankAccountId) {
      filteredChecks = filteredChecks.filter(check => check.bankAccountId === bankAccountId);
    }

    if (search) {
      filteredChecks = filteredChecks.filter(check =>
        check.number.includes(search) ||
        check.relatedParty.includes(search) ||
        check.description?.includes(search)
      );
    }

    // Sort by creation date (newest first)
    filteredChecks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(filteredChecks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch checks' },
      { status: 500 }
    );
  }
}

// POST create new check
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = checkSchema.parse(body);

    // Validate that due date is after issue date
    const issueDate = new Date(validatedData.date);
    const dueDate = new Date(validatedData.dueDate);

    if (dueDate <= issueDate) {
      return NextResponse.json(
        { error: 'Due date must be after issue date' },
        { status: 400 }
      );
    }

    // Check if check number already exists
    const existingCheck = checks.find(check => check.number === validatedData.number);
    if (existingCheck) {
      return NextResponse.json(
        { error: 'Check number already exists' },
        { status: 400 }
      );
    }

    // Validate bank account exists
    const bankAccount = bankAccounts.find(acc => acc.id === validatedData.bankAccountId);
    if (!bankAccount) {
      return NextResponse.json(
        { error: 'Bank account not found' },
        { status: 400 }
      );
    }

    const newCheck = {
      id: Date.now().toString(),
      ...validatedData,
      status: 'PENDING',
      settlementDate: null,
      settlementAmount: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    checks.push(newCheck);

    // Add bank account info to response
    const statusInfo = calculateCheckStatus(newCheck);
    const responseCheck = {
      ...newCheck,
      bankName: bankAccount.bankName,
      branchName: bankAccount.branchName,
      ...statusInfo,
    };

    return NextResponse.json(responseCheck, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create check' },
      { status: 500 }
    );
  }
}

// POST batch settlement
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = batchSettlementSchema.parse(body);

    const { checkIds, settlementDate, description, status } = validatedData;

    // Find all checks
    const checksToSettle = checks.filter(check => checkIds.includes(check.id));
    
    if (checksToSettle.length === 0) {
      return NextResponse.json(
        { error: 'No valid checks found' },
        { status: 400 }
      );
    }

    // Validate all checks are pending
    const nonPendingChecks = checksToSettle.filter(check => check.status !== 'PENDING');
    if (nonPendingChecks.length > 0) {
      return NextResponse.json(
        { error: 'Only pending checks can be settled' },
        { status: 400 }
      );
    }

    // Process settlement
    const settledChecks = checksToSettle.map(check => {
      const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
      
      // Update check
      Object.assign(check, {
        status,
        settlementDate,
        settlementAmount: status === 'CLEARED' ? check.amount : 0,
        updatedAt: new Date().toISOString(),
      });

      const statusInfo = calculateCheckStatus(check);
      
      return {
        ...check,
        bankName: bankAccount?.bankName || '',
        branchName: bankAccount?.branchName || '',
        ...statusInfo,
      };
    });

    return NextResponse.json({
      message: `${settledChecks.length} checks settled successfully`,
      settledChecks,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to settle checks' },
      { status: 500 }
    );
  }
}