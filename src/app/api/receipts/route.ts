import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for receipt
const receiptSchema = z.object({
  number: z.string().min(1, "شماره رسید الزامی است"),
  date: z.string().min(1, "تاریخ رسید الزامی است"),
  customerId: z.string().min(1, "مشتری الزامی است"),
  amount: z.string().min(1, "مبلغ الزامی است"),
  type: z.enum(["CASH", "CHECK", "BANK_TRANSFER", "POS", "MONEY_ORDER"]),
  description: z.string().optional(),
  bankAccountId: z.string().optional(),
  checkNumber: z.string().optional(),
  referenceNumber: z.string().optional(),
  salesInvoiceId: z.string().optional(),
});

// Mock data for demonstration
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
  {
    id: "4",
    number: "د-004",
    date: "1403-12-04",
    customerId: "1",
    customerName: "شرکت الف",
    amount: 8000000,
    type: "POS",
    description: "دریافت وجه از طریق دستگاه کارتخوان",
    referenceNumber: "POS-001",
    status: "COMPLETED",
    salesInvoiceId: "2",
    salesInvoiceNumber: "ف-002",
    createdById: "1",
    createdByName: "علی رضایی",
    createdAt: "2024-12-04T14:00:00Z",
    updatedAt: "2024-12-04T14:00:00Z",
  },
];

// Mock customers for reference
const mockCustomers = [
  { id: "1", name: "شرکت الف" },
  { id: "2", name: "فروشگاه ب" },
  { id: "3", name: "مشتری ج" },
  { id: "4", name: "مشتری د" },
];

// Mock bank accounts for reference
const mockBankAccounts = [
  { id: "1", name: "بانک ملت", accountNumber: "1234-5678-9012-3456" },
  { id: "2", name: "بانک ملی", accountNumber: "9876-5432-1098-7654" },
];

// Mock sales invoices for reference
const mockSalesInvoices = [
  { id: "1", number: "ف-001", customerId: "1", amount: 35000000 },
  { id: "2", number: "ف-002", customerId: "1", amount: 8000000 },
];

const receiptTypes = [
  { value: "CASH", label: "نقدی" },
  { value: "CHECK", label: "چک" },
  { value: "BANK_TRANSFER", label: "انتقال بانکی" },
  { value: "POS", label: "کارتخوان" },
  { value: "MONEY_ORDER", label: "حواله" },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const customerId = searchParams.get('customerId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let filteredReceipts = [...mockReceipts];

    // Apply filters
    if (customerId) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.customerId === customerId);
    }

    if (type) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.type === type);
    }

    if (status) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.status === status);
    }

    if (startDate) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.date >= startDate);
    }

    if (endDate) {
      filteredReceipts = filteredReceipts.filter(receipt => receipt.date <= endDate);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredReceipts = filteredReceipts.filter(receipt => 
        receipt.number.toLowerCase().includes(searchLower) ||
        receipt.description.toLowerCase().includes(searchLower) ||
        receipt.customerName.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReceipts = filteredReceipts.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedReceipts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredReceipts.length / limit),
        totalItems: filteredReceipts.length,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست رسیدها" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = receiptSchema.parse(body);

    const amount = parseFloat(validatedData.amount);
    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "مبلغ باید عدد مثبت باشد" },
        { status: 400 }
      );
    }

    const customer = mockCustomers.find(c => c.id === validatedData.customerId);
    const bankAccount = validatedData.bankAccountId ? 
      mockBankAccounts.find(b => b.id === validatedData.bankAccountId) : null;
    const salesInvoice = validatedData.salesInvoiceId ? 
      mockSalesInvoices.find(i => i.id === validatedData.salesInvoiceId) : null;

    const newReceipt = {
      id: `receipt-${Date.now()}`,
      number: validatedData.number,
      date: validatedData.date,
      customerId: validatedData.customerId,
      customerName: customer?.name || "نامشخص",
      amount,
      type: validatedData.type,
      description: validatedData.description,
      bankAccountId: validatedData.bankAccountId,
      bankAccountName: bankAccount?.name,
      checkNumber: validatedData.checkNumber,
      referenceNumber: validatedData.referenceNumber,
      status: "PENDING",
      salesInvoiceId: validatedData.salesInvoiceId,
      salesInvoiceNumber: salesInvoice?.number,
      createdById: "1", // In real app, get from auth context
      createdByName: "کاربر فعلی", // In real app, get from auth context
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockReceipts.unshift(newReceipt);

    return NextResponse.json({
      success: true,
      data: newReceipt,
      message: "رسید با موفقیت ثبت شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ثبت رسید" },
      { status: 500 }
    );
  }
}