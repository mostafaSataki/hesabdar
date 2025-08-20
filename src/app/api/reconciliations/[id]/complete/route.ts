import { NextRequest, NextResponse } from 'next/server';

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

// POST complete reconciliation
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
        { error: 'Only pending reconciliations can be completed' },
        { status: 400 }
      );
    }

    // Check if all discrepancies are resolved
    const openDiscrepancies = reconciliation.discrepancies.filter(d => d.status === 'OPEN');
    if (openDiscrepancies.length > 0) {
      return NextResponse.json(
        { error: 'Cannot complete reconciliation with open discrepancies' },
        { status: 400 }
      );
    }

    // Complete reconciliation
    Object.assign(reconciliation, {
      status: 'COMPLETED',
      reconciledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      reconciliation,
      message: 'Reconciliation completed successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to complete reconciliation' },
      { status: 500 }
    );
  }
}