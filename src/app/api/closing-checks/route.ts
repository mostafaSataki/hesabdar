import { NextRequest, NextResponse } from 'next/server';

// Mock comprehensive closing checks
const CLOSING_CHECKS = [
  {
    id: '1',
    name: 'تراز حساب‌ها',
    description: 'بررسی تراز تمام حساب‌های دفتر کل',
    category: 'ACCOUNT_BALANCE',
    required: true,
  },
  {
    id: '2',
    name: 'تسویه حساب‌های موقت',
    description: 'انتقال مانده حساب‌های موقت به حساب‌های دائم',
    category: 'TEMPORARY_ACCOUNTS',
    required: true,
  },
  {
    id: '3',
    name: 'بررسی اسناد مالی',
    description: 'تأیید ثبت تمام اسناد مالی در دوره',
    category: 'FINANCIAL_DOCUMENTS',
    required: true,
  },
  {
    id: '4',
    name: 'مغایرت بانکی',
    description: 'بررسی مغایرت‌های بانکی و حل آنها',
    category: 'BANK_RECONCILIATION',
    required: true,
  },
  {
    id: '5',
    name: 'انطباق موجودی انبار',
    description: 'بررسی انطباق موجودی انبار با سوابق',
    category: 'INVENTORY',
    required: true,
  },
  {
    id: '6',
    name: 'محاسبات مالیاتی',
    description: 'محاسبه و بررسی مالیات‌های دوره',
    category: 'TAX_CALCULATION',
    required: true,
  },
  {
    id: '7',
    name: 'بررسی حساب‌های دریافتنی',
    description: 'تحلیل و بررسی حساب‌های دریافتنی',
    category: 'ACCOUNTS_RECEIVABLE',
    required: false,
  },
  {
    id: '8',
    name: 'بررسی حساب‌های پرداختنی',
    description: 'تحلیل و بررسی حساب‌های پرداختنی',
    category: 'ACCOUNTS_PAYABLE',
    required: false,
  },
];

// Simulate running a specific check
const runCheck = async (check: any, periodId: string) => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));

  // Simulate different outcomes based on check type
  let status = 'COMPLETED';
  let errorMessage = null;

  // Simulate some random failures for demonstration
  if (Math.random() < 0.15) {
    status = 'FAILED';
    errorMessage = generateErrorMessage(check.category);
  }

  return {
    ...check,
    status,
    errorMessage,
    executedAt: new Date().toISOString(),
    periodId,
  };
};

const generateErrorMessage = (category: string) => {
  const errorMessages = {
    ACCOUNT_BALANCE: 'تراز برخی حساب‌ها با هم مطابقت ندارد',
    TEMPORARY_ACCOUNTS: 'خطا در انتقال مانده حساب‌های موقت',
    FINANCIAL_DOCUMENTS: 'برخی اسناد مالی ثبت نشده‌اند',
    BANK_RECONCILIATION: 'مغایرت‌های بانکی حل نشده باقی مانده‌اند',
    INVENTORY: 'موجودی انبار با سوابق مالی منطبق نیست',
    TAX_CALCULATION: 'خطا در محاسبات مالیاتی',
    ACCOUNTS_RECEIVABLE: 'برخی حساب‌های دریافتنی نیاز به بررسی دارند',
    ACCOUNTS_PAYABLE: 'برخی حساب‌های پرداختنی نیاز به بررسی دارند',
  };

  return errorMessages[category as keyof typeof errorMessages] || 'خطای نامشخص در بررسی';
};

// GET all closing checks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const required = searchParams.get('required');

    let filteredChecks = CLOSING_CHECKS;

    if (category) {
      filteredChecks = filteredChecks.filter(check => check.category === category);
    }

    if (required !== null) {
      const requiredFilter = required === 'true';
      filteredChecks = filteredChecks.filter(check => check.required === requiredFilter);
    }

    return NextResponse.json(filteredChecks);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch closing checks' },
      { status: 500 }
    );
  }
}

// POST run closing checks for a period
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { periodId, checkIds } = body;

    if (!periodId) {
      return NextResponse.json(
        { error: 'Period ID is required' },
        { status: 400 }
      );
    }

    // Get checks to run (specific ones or all)
    const checksToRun = checkIds 
      ? CLOSING_CHECKS.filter(check => checkIds.includes(check.id))
      : CLOSING_CHECKS;

    if (checksToRun.length === 0) {
      return NextResponse.json(
        { error: 'No checks to run' },
        { status: 400 }
      );
    }

    // Run all checks in parallel
    const checkPromises = checksToRun.map(check => runCheck(check, periodId));
    const results = await Promise.all(checkPromises);

    // Calculate summary
    const completed = results.filter(r => r.status === 'COMPLETED').length;
    const failed = results.filter(r => r.status === 'FAILED').length;
    const total = results.length;

    const summary = {
      total,
      completed,
      failed,
      successRate: Math.round((completed / total) * 100),
      canClose: failed === 0,
    };

    return NextResponse.json({
      results,
      summary,
      periodId,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to run closing checks' },
      { status: 500 }
    );
  }
}