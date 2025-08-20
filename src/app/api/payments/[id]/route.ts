import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data (shared with main route)
let mockPayments = [
  {
    id: "1",
    number: "پ-001",
    date: "1403-12-01",
    supplierId: "1",
    supplierName: "شرکت واردات الف",
    amount: 25000000,
    type: "BANK_TRANSFER",
    description: "پرداخت فاکتور خرید لپتاپ",
    bankAccountId: "1",
    bankAccountName: "بانک ملت",
    referenceNumber: "TRF-001",
    status: "COMPLETED",
    purchaseInvoiceId: "1",
    purchaseInvoiceNumber: "خ-001",
    createdById: "1",
    createdByName: "علی رضایی",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    number: "پ-002",
    date: "1403-12-02",
    supplierId: "2",
    supplierName: "فروشگاه عمده ب",
    amount: 950000,
    type: "CASH",
    description: "پرداخت وجه نقد",
    status: "COMPLETED",
    createdById: "1",
    createdByName: "علی رضایی",
    createdAt: "2024-12-02T11:00:00Z",
    updatedAt: "2024-12-02T11:00:00Z",
  },
  {
    id: "3",
    number: "پ-003",
    date: "1403-12-03",
    supplierId: "3",
    supplierName: "تولید کننده ج",
    amount: 5500000,
    type: "CHECK",
    description: "پرداخت چک به تأمین‌کننده",
    checkNumber: "چ-5678",
    bankAccountId: "2",
    bankAccountName: "بانک ملی",
    status: "PENDING",
    createdById: "2",
    createdByName: "مریم احمدی",
    createdAt: "2024-12-03T09:30:00Z",
    updatedAt: "2024-12-03T09:30:00Z",
  },
];

// Validation schema for update
const updatePaymentSchema = z.object({
  number: z.string().min(1, "شماره پرداخت الزامی است").optional(),
  date: z.string().min(1, "تاریخ پرداخت الزامی است").optional(),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است").optional(),
  amount: z.string().min(1, "مبلغ الزامی است").optional(),
  type: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "ONLINE", "MONEY_ORDER"]).optional(),
  description: z.string().optional(),
  bankAccountId: z.string().optional(),
  checkNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED", "BOUNCED"]).optional(),
  purchaseInvoiceId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = mockPayments.find(pay => pay.id === params.id);

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات پرداخت" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = updatePaymentSchema.parse(body);

    const paymentIndex = mockPayments.findIndex(pay => pay.id === params.id);

    if (paymentIndex === -1) {
      return NextResponse.json(
        { success: false, error: "پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    const payment = mockPayments[paymentIndex];

    // Update payment fields
    const updatedPayment = {
      ...payment,
      ...validatedData,
      amount: validatedData.amount ? parseFloat(validatedData.amount) : payment.amount,
      updatedAt: new Date().toISOString(),
    };

    mockPayments[paymentIndex] = updatedPayment;

    return NextResponse.json({
      success: true,
      data: updatedPayment,
      message: "پرداخت با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی پرداخت" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentIndex = mockPayments.findIndex(pay => pay.id === params.id);

    if (paymentIndex === -1) {
      return NextResponse.json(
        { success: false, error: "پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    const payment = mockPayments[paymentIndex];

    // Check if payment can be deleted (only PENDING status can be deleted)
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "فقط پرداخت‌های در انتظار قابل حذف هستند" },
        { status: 400 }
      );
    }

    mockPayments.splice(paymentIndex, 1);

    return NextResponse.json({
      success: true,
      message: "پرداخت با موفقیت حذف شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در حذف پرداخت" },
      { status: 500 }
    );
  }
}

// Additional endpoint for confirming (completing) payments
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentIndex = mockPayments.findIndex(pay => pay.id === params.id);

    if (paymentIndex === -1) {
      return NextResponse.json(
        { success: false, error: "پرداخت یافت نشد" },
        { status: 404 }
      );
    }

    const payment = mockPayments[paymentIndex];

    // Check if payment can be confirmed (only PENDING status can be confirmed)
    if (payment.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "فقط پرداخت‌های در انتظار قابل تأیید هستند" },
        { status: 400 }
      );
    }

    // Update payment status to COMPLETED
    mockPayments[paymentIndex] = {
      ...payment,
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockPayments[paymentIndex],
      message: "پرداخت با موفقیت تأیید شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در تأیید پرداخت" },
      { status: 500 }
    );
  }
}