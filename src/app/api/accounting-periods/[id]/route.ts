import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let accountingPeriods = [
  {
    id: '1',
    name: 'دی ماه ۱۴۰۳',
    startDate: '2024-12-21',
    endDate: '2025-01-19',
    isClosed: false,
    totalRevenue: 125000000,
    totalExpenses: 95000000,
    netIncome: 30000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'بهمن ماه ۱۴۰۳',
    startDate: '2024-11-21',
    endDate: '2024-12-20',
    isClosed: true,
    closedAt: '2024-12-25T10:30:00Z',
    closedBy: 'admin',
    totalRevenue: 110000000,
    totalExpenses: 88000000,
    netIncome: 22000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'آبان ماه ۱۴۰۳',
    startDate: '2024-10-22',
    endDate: '2024-11-20',
    isClosed: true,
    closedAt: '2024-11-25T14:15:00Z',
    closedBy: 'admin',
    totalRevenue: 98000000,
    totalExpenses: 76000000,
    netIncome: 22000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const closingSchema = z.object({
  closingDate: z.string().min(1, 'Closing date is required'),
  description: z.string().min(1, 'Description is required'),
});

// Mock closing checks
const runClosingChecks = async (periodId: string) => {
  // Simulate comprehensive closing checks
  const checks = [
    {
      name: 'تراز حساب‌ها',
      description: 'بررسی تراز تمام حساب‌های دفتر کل',
      status: 'COMPLETED',
      errorMessage: null,
    },
    {
      name: 'تسویه حساب‌های موقت',
      description: 'انتقال مانده حساب‌های موقت به حساب‌های دائم',
      status: 'COMPLETED',
      errorMessage: null,
    },
    {
      name: 'بررسی اسناد مالی',
      description: 'تأیید ثبت تمام اسناد مالی در دوره',
      status: 'COMPLETED',
      errorMessage: null,
    },
    {
      name: 'مغایرت بانکی',
      description: 'بررسی مغایرت‌های بانکی و حل آنها',
      status: Math.random() > 0.2 ? 'COMPLETED' : 'FAILED',
      errorMessage: Math.random() > 0.2 ? null : 'برخی مغایرت‌های بانکی حل نشده‌اند',
    },
    {
      name: 'انطباق موجودی انبار',
      description: 'بررسی انطباق موجودی انبار با سوابق',
      status: Math.random() > 0.2 ? 'COMPLETED' : 'FAILED',
      errorMessage: Math.random() > 0.2 ? null : 'موجودی انبار با سوابق منطبق نیست',
    },
  ];

  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  return checks;
};

// GET single accounting period
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const period = accountingPeriods.find(p => p.id === params.id);
    
    if (!period) {
      return NextResponse.json(
        { error: 'Accounting period not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(period);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accounting period' },
      { status: 500 }
    );
  }
}

// PUT update accounting period
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const period = accountingPeriods.find(p => p.id === params.id);
    
    if (!period) {
      return NextResponse.json(
        { error: 'Accounting period not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    
    // Update period
    Object.assign(period, {
      ...body,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json(period);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update accounting period' },
      { status: 500 }
    );
  }
}

// POST close accounting period
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const period = accountingPeriods.find(p => p.id === params.id);
    
    if (!period) {
      return NextResponse.json(
        { error: 'Accounting period not found' },
        { status: 404 }
      );
    }

    if (period.isClosed) {
      return NextResponse.json(
        { error: 'Period is already closed' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = closingSchema.parse(body);

    // Run closing checks
    const closingChecks = await runClosingChecks(params.id);
    
    const failedChecks = closingChecks.filter(check => check.status === 'FAILED');
    
    if (failedChecks.length > 0) {
      return NextResponse.json({
        error: 'Closing checks failed',
        failedChecks,
        allChecks: closingChecks,
      }, { status: 400 });
    }

    // Close the period
    period.isClosed = true;
    period.closedAt = new Date().toISOString();
    period.closedBy = 'current-user'; // In real app, get from auth
    period.updatedAt = new Date().toISOString();

    return NextResponse.json({
      period,
      closingChecks,
      message: 'Accounting period closed successfully',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to close accounting period' },
      { status: 500 }
    );
  }
}

// DELETE accounting period
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const periodIndex = accountingPeriods.findIndex(p => p.id === params.id);
    
    if (periodIndex === -1) {
      return NextResponse.json(
        { error: 'Accounting period not found' },
        { status: 404 }
      );
    }

    const period = accountingPeriods[periodIndex];

    if (period.isClosed) {
      return NextResponse.json(
        { error: 'Cannot delete a closed period' },
        { status: 400 }
      );
    }

    accountingPeriods.splice(periodIndex, 1);

    return NextResponse.json({ message: 'Accounting period deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete accounting period' },
      { status: 500 }
    );
  }
}