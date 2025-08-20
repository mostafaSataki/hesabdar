import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for payment
const paymentSchema = z.object({
  number: z.string().min(1, "شماره پرداخت الزامی است"),
  date: z.string().min(1, "تاریخ پرداخت الزامی است"),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است"),
  amount: z.string().min(1, "مبلغ الزامی است"),
  type: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "ONLINE", "MONEY_ORDER"]),
  description: z.string().optional(),
  bankAccountId: z.string().optional(),
  checkNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  purchaseInvoiceId: z.string().optional(),
});

// Mock data for demonstration
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
  {
    id: "4",
    number: "پ-004",
    date: "1403-12-04",
    supplierId: "1",
    supplierName: "شرکت واردات الف",
    amount: 3000000,
    type: "ONLINE",
    description: "پرداخت آنلاین",
    referenceNumber: "ONL-001",
    status: "COMPLETED",
    purchaseInvoiceId: "2",
    purchaseInvoiceNumber: "خ-002",
    createdById: "1",
    createdByName: "علی رضایی",
    createdAt: "2024-12-04T14:00:00Z",
    updatedAt: "2024-12-04T14:00:00Z",
  },
];

// Mock suppliers for reference
const mockSuppliers = [
  { id: "1", name: "شرکت واردات الف" },
  { id: "2", name: "فروشگاه عمده ب" },
  { id: "3", name: "تولید کننده ج" },
  { id: "4", name: "تأمین‌کننده د" },
];

// Mock bank accounts for reference
const mockBankAccounts = [
  { id: "1", name: "بانک ملت", accountNumber: "1234-5678-9012-3456" },
  { id: "2", name: "بانک ملی", accountNumber: "9876-5432-1098-7654" },
];

// Mock purchase invoices for reference
const mockPurchaseInvoices = [
  { id: "1", number: "خ-001", supplierId: "1", amount: 25000000 },
  { id: "2", number: "خ-002", supplierId: "1", amount: 3000000 },
];

const paymentTypes = [
  { value: "CASH", label: "نقدی" },
  { value: "CHECK", label: "چک" },
  { value: "BANK_TRANSFER", label: "انتقال بانکی" },
  { value: "ONLINE", label: "آنلاین" },
  { value: "MONEY_ORDER", label: "حواله" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const supplierId = searchParams.get('supplierId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let filteredPayments = [...mockPayments];

    // Apply filters
    if (supplierId) {
      filteredPayments = filteredPayments.filter(payment => payment.supplierId === supplierId);
    }

    if (type) {
      filteredPayments = filteredPayments.filter(payment => payment.type === type);
    }

    if (status) {
      filteredPayments = filteredPayments.filter(payment => payment.status === status);
    }

    if (startDate) {
      filteredPayments = filteredPayments.filter(payment => payment.date >= startDate);
    }

    if (endDate) {
      filteredPayments = filteredPayments.filter(payment => payment.date <= endDate);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredPayments = filteredPayments.filter(payment => 
        payment.number.toLowerCase().includes(searchLower) ||
        payment.description.toLowerCase().includes(searchLower) ||
        payment.supplierName.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedPayments,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredPayments.length / limit),
        totalItems: filteredPayments.length,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست پرداخت‌ها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = paymentSchema.parse(body);

    const amount = parseFloat(validatedData.amount);
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "مبلغ باید عدد مثبت باشد" },
        { status: 400 }
      );
    }

    const supplier = mockSuppliers.find(s => s.id === validatedData.supplierId);
    const bankAccount = validatedData.bankAccountId ? 
      mockBankAccounts.find(b => b.id === validatedData.bankAccountId) : null;
    const purchaseInvoice = validatedData.purchaseInvoiceId ? 
      mockPurchaseInvoices.find(i => i.id === validatedData.purchaseInvoiceId) : null;

    const newPayment = {
      id: `payment-${Date.now()}`,
      number: validatedData.number,
      date: validatedData.date,
      supplierId: validatedData.supplierId,
      supplierName: supplier?.name || "نامشخص",
      amount,
      type: validatedData.type,
      description: validatedData.description,
      bankAccountId: validatedData.bankAccountId,
      bankAccountName: bankAccount?.name,
      checkNumber: validatedData.checkNumber,
      referenceNumber: validatedData.referenceNumber,
      status: "PENDING",
      purchaseInvoiceId: validatedData.purchaseInvoiceId,
      purchaseInvoiceNumber: purchaseInvoice?.number,
      createdById: "1", // In real app, get from auth context
      createdByName: "کاربر فعلی", // In real app, get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPayments.unshift(newPayment);

    return NextResponse.json({
      success: true,
      data: newPayment,
      message: "پرداخت با موفقیت ثبت شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ثبت پرداخت" },
      { status: 500 }
    );
  }
}