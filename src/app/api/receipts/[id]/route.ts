import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data (shared with main route)
let mockReceipts = [
  {
    id: "1",
    number: "د-001",
    date: "1403-12-01",
    customerId: "1",
    customerName: "شرکت الف",
    amount: 35000000,
    type: "BANK_TRANSFER",
    description: "دریافت وجه فاکتور فروش لپتاپ",
    bankAccountId: "1",
    bankAccountName: "بانک ملت",
    referenceNumber: "REF-001",
    status: "COMPLETED",
    salesInvoiceId: "1",
    salesInvoiceNumber: "ف-001",
    createdById: "1",
    createdByName: "علی رضایی",
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    number: "د-002",
    date: "1403-12-02",
    customerId: "2",
    customerName: "فروشگاه ب",
    amount: 1500000,
    type: "CASH",
    description: "دریافت وجه نقد",
    status: "COMPLETED",
    createdById: "1",
    createdByName: "علی رضایی",
    createdAt: "2024-12-02T11:00:00Z",
    updatedAt: "2024-12-02T11:00:00Z",
  },
  {
    id: "3",
    number: "د-003",
    date: "1403-12-03",
    customerId: "3",
    customerName: "مشتری ج",
    amount: 5000000,
    type: "CHECK",
    description: "دریافت چک از مشتری",
    checkNumber: "چ-1234",
    bankAccountId: "1",
    bankAccountName: "بانک ملت",
    status: "PENDING",
    createdById: "2",
    createdByName: "مریم احمدی",
    createdAt: "2024-12-03T09:30:00Z",
    updatedAt: "2024-12-03T09:30:00Z",
  },
];

// Validation schema for update
const updateReceiptSchema = z.object({
  number: z.string().min(1, "شماره رسید الزامی است").optional(),
  date: z.string().min(1, "تاریخ رسید الزامی است").optional(),
  customerId: z.string().min(1, "مشتری الزامی است").optional(),
  amount: z.string().min(1, "مبلغ الزامی است").optional(),
  type: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "POS", "MONEY_ORDER"]).optional(),
  description: z.string().optional(),
  bankAccountId: z.string().optional(),
  checkNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED", "BOUNCED"]).optional(),
  salesInvoiceId: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receipt = mockReceipts.find(rec => rec.id === params.id);

    if (!receipt) {
      return NextResponse.json(
        { success: false, error: "رسید یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: receipt,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات رسید" },
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
    const validatedData = updateReceiptSchema.parse(body);

    const receiptIndex = mockReceipts.findIndex(rec => rec.id === params.id);

    if (receiptIndex === -1) {
      return NextResponse.json(
        { success: false, error: "رسید یافت نشد" },
        { status: 404 }
      );
    }

    const receipt = mockReceipts[receiptIndex];

    // Update receipt fields
    const updatedReceipt = {
      ...receipt,
      ...validatedData,
      amount: validatedData.amount ? parseFloat(validatedData.amount) : receipt.amount,
      updatedAt: new Date().toISOString(),
    };

    mockReceipts[receiptIndex] = updatedReceipt;

    return NextResponse.json({
      success: true,
      data: updatedReceipt,
      message: "رسید با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی رسید" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptIndex = mockReceipts.findIndex(rec => rec.id === params.id);

    if (receiptIndex === -1) {
      return NextResponse.json(
        { success: false, error: "رسید یافت نشد" },
        { status: 404 }
      );
    }

    const receipt = mockReceipts[receiptIndex];

    // Check if receipt can be deleted (only PENDING status can be deleted)
    if (receipt.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "فقط رسیدهای در انتظار قابل حذف هستند" },
        { status: 400 }
      );
    }

    mockReceipts.splice(receiptIndex, 1);

    return NextResponse.json({
      success: true,
      message: "رسید با موفقیت حذف شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در حذف رسید" },
      { status: 500 }
    );
  }
}

// Additional endpoint for confirming (completing) receipts
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const receiptIndex = mockReceipts.findIndex(rec => rec.id === params.id);

    if (receiptIndex === -1) {
      return NextResponse.json(
        { success: false, error: "رسید یافت نشد" },
        { status: 404 }
      );
    }

    const receipt = mockReceipts[receiptIndex];

    // Check if receipt can be confirmed (only PENDING status can be confirmed)
    if (receipt.status !== "PENDING") {
      return NextResponse.json(
        { success: false, error: "فقط رسیدهای در انتظار قابل تأیید هستند" },
        { status: 400 }
      );
    }

    // Update receipt status to COMPLETED
    mockReceipts[receiptIndex] = {
      ...receipt,
      status: "COMPLETED",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockReceipts[receiptIndex],
      message: "رسید با موفقیت تأیید شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در تأیید رسید" },
      { status: 500 }
    );
  }
}