import { NextRequest, NextResponse } from 'next/server';

// Mock data - in real app, use database
const checks = [
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

const bankAccounts = [
  { id: '1', accountNumber: '1234-5678-9012-3456', bankName: 'بانک ملت', branchName: 'شعبه مرکزی', balance: 50000000 },
  { id: '2', accountNumber: '9876-5432-1098-7654', bankName: 'بانک ملی', branchName: 'شعبه ولیعصر', balance: 30000000 },
  { id: '3', accountNumber: '5555-6666-7777-8888', bankName: 'بانک تجارت', branchName: 'شعبه آزادی', balance: 20000000 },
];

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

// Generate check summary report
const generateSummaryReport = () => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const checksWithStatus = checks.map(check => {
    const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
    const statusInfo = calculateCheckStatus(check);
    
    return {
      ...check,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
      ...statusInfo,
    };
  });

  const summary = {
    totalChecks: checksWithStatus.length,
    byStatus: {
      PENDING: checksWithStatus.filter(c => c.status === 'PENDING').length,
      CLEARED: checksWithStatus.filter(c => c.status === 'CLEARED').length,
      BOUNCED: checksWithStatus.filter(c => c.status === 'BOUNCED').length,
      CANCELLED: checksWithStatus.filter(c => c.status === 'CANCELLED').length,
    },
    byType: {
      RECEIPT: checksWithStatus.filter(c => c.type === 'RECEIPT').length,
      PAYMENT: checksWithStatus.filter(c => c.type === 'PAYMENT').length,
    },
    byBank: bankAccounts.map(account => ({
      bankName: account.bankName,
      totalChecks: checksWithStatus.filter(c => c.bankAccountId === account.id).length,
      pendingAmount: checksWithStatus
        .filter(c => c.bankAccountId === account.id && c.status === 'PENDING')
        .reduce((sum, c) => sum + c.amount, 0),
    })),
    overdueChecks: checksWithStatus.filter(c => c.isOverdue && c.status === 'PENDING'),
    monthlyStats: {
      currentMonth: {
        total: checksWithStatus.filter(c => {
          const checkDate = new Date(c.date);
          return checkDate.getMonth() === currentMonth && checkDate.getFullYear() === currentYear;
        }).length,
        cleared: checksWithStatus.filter(c => {
          const checkDate = new Date(c.date);
          return checkDate.getMonth() === currentMonth && 
                 checkDate.getFullYear() === currentYear && 
                 c.status === 'CLEARED';
        }).length,
      },
    },
  };

  return summary;
};

// Generate aging report
const generateAgingReport = () => {
  const today = new Date();
  const checksWithStatus = checks.map(check => {
    const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
    const statusInfo = calculateCheckStatus(check);
    
    return {
      ...check,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
      ...statusInfo,
    };
  });

  const pendingChecks = checksWithStatus.filter(c => c.status === 'PENDING');

  const agingBuckets = {
    current: pendingChecks.filter(c => c.daysUntilDue >= 0),
    days1_30: pendingChecks.filter(c => c.daysUntilDue < 0 && c.daysUntilDue >= -30),
    days31_60: pendingChecks.filter(c => c.daysUntilDue < -30 && c.daysUntilDue >= -60),
    days61_90: pendingChecks.filter(c => c.daysUntilDue < -60 && c.daysUntilDue >= -90),
    over90: pendingChecks.filter(c => c.daysUntilDue < -90),
  };

  const agingReport = {
    totalPending: pendingChecks.length,
    totalPendingAmount: pendingChecks.reduce((sum, c) => sum + c.amount, 0),
    buckets: {
      current: {
        count: agingBuckets.current.length,
        amount: agingBuckets.current.reduce((sum, c) => sum + c.amount, 0),
        checks: agingBuckets.current,
      },
      days1_30: {
        count: agingBuckets.days1_30.length,
        amount: agingBuckets.days1_30.reduce((sum, c) => sum + c.amount, 0),
        checks: agingBuckets.days1_30,
      },
      days31_60: {
        count: agingBuckets.days31_60.length,
        amount: agingBuckets.days31_60.reduce((sum, c) => sum + c.amount, 0),
        checks: agingBuckets.days31_60,
      },
      days61_90: {
        count: agingBuckets.days61_90.length,
        amount: agingBuckets.days61_90.reduce((sum, c) => sum + c.amount, 0),
        checks: agingBuckets.days61_90,
      },
      over90: {
        count: agingBuckets.over90.length,
        amount: agingBuckets.over90.reduce((sum, c) => sum + c.amount, 0),
        checks: agingBuckets.over90,
      },
    },
  };

  return agingReport;
};

// Generate cash flow forecast
const generateCashFlowForecast = () => {
  const today = new Date();
  const checksWithStatus = checks.map(check => {
    const bankAccount = bankAccounts.find(acc => acc.id === check.bankAccountId);
    const statusInfo = calculateCheckStatus(check);
    
    return {
      ...check,
      bankName: bankAccount?.bankName || '',
      branchName: bankAccount?.branchName || '',
      ...statusInfo,
    };
  });

  const pendingChecks = checksWithStatus.filter(c => c.status === 'PENDING');
  
  // Group by week for next 12 weeks
  const weeklyForecast = [];
  for (let i = 0; i < 12; i++) {
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekChecks = pendingChecks.filter(check => {
      const dueDate = new Date(check.dueDate);
      return dueDate >= weekStart && dueDate <= weekEnd;
    });

    weeklyForecast.push({
      weekNumber: i + 1,
      startDate: weekStart.toISOString().split('T')[0],
      endDate: weekEnd.toISOString().split('T')[0],
      receipts: weekChecks.filter(c => c.type === 'RECEIPT'),
      payments: weekChecks.filter(c => c.type === 'PAYMENT'),
      totalReceipts: weekChecks.filter(c => c.type === 'RECEIPT').reduce((sum, c) => sum + c.amount, 0),
      totalPayments: weekChecks.filter(c => c.type === 'PAYMENT').reduce((sum, c) => sum + c.amount, 0),
      netFlow: weekChecks.filter(c => c.type === 'RECEIPT').reduce((sum, c) => sum + c.amount, 0) -
               weekChecks.filter(c => c.type === 'PAYMENT').reduce((sum, c) => sum + c.amount, 0),
    });
  }

  return {
    forecast: weeklyForecast,
    summary: {
      totalExpectedReceipts: weeklyForecast.reduce((sum, week) => sum + week.totalReceipts, 0),
      totalExpectedPayments: weeklyForecast.reduce((sum, week) => sum + week.totalPayments, 0),
      netCashFlow: weeklyForecast.reduce((sum, week) => sum + week.netFlow, 0),
    },
  };
};

// GET check reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type') || 'summary';

    let report;

    switch (reportType) {
      case 'summary':
        report = generateSummaryReport();
        break;
      case 'aging':
        report = generateAgingReport();
        break;
      case 'cashflow':
        report = generateCashFlowForecast();
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      type: reportType,
      data: report,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}