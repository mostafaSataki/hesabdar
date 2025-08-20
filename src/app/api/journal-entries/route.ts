import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for journal entry
const journalEntrySchema = z.object({
  number: z.string().min(1, "شماره سند الزامی است"),
  date: z.string().min(1, "تاریخ سند الزامی است"),
  description: z.string().min(1, "توضیحات سند الزامی است"),
  periodId: z.string().min(1, "دوره مالی الزامی است"),
  items: z.array(z.object({
    accountId: z.string().min(1, "حساب الزامی است"),
    debit: z.string().min(0, "بدهکار باید عدد مثبت باشد"),
    credit: z.string().min(0, "بستانکار باید عدد مثبت باشد"),
    description: z.string().optional(),
  })).min(2, "حداقل دو آیتم الزامی است"),
});

// Mock data for demonstration
let mockJournalEntries = [
  {
    id: "1",
    number: "س-001",
    date: "1403-12-01",
    description: "ثبت فروش لپتاپ به شرکت الف",
    periodId: "1",
    periodName: "دی 1403",
    status: "POSTED",
    totalDebit: 35000000,
    totalCredit: 35000000,
    createdById: "1",
    createdByName: "علی رضایی",
    items: [
      {
        id: "1",
        accountId: "1201",
        accountName: "حسابهای دریافتنی",
        accountCode: "1201",
        debit: 35000000,
        credit: 0,
        description: "فروش لپتاپ",
      },
      {
        id: "2",
        accountId: "4101",
        accountName: "فروش کالا",
        accountCode: "4101",
        debit: 0,
        credit: 35000000,
        description: "فروش لپتاپ",
      },
    ],
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    number: "س-002",
    date: "1403-12-02",
    description: "ثبت خرید لوازم اداری از فروشگاه ب",
    periodId: "1",
    periodName: "دی 1403",
    status: "POSTED",
    totalDebit: 950000,
    totalCredit: 950000,
    createdById: "1",
    createdByName: "علی رضایی",
    items: [
      {
        id: "3",
        accountId: "2101",
        accountName: "حسابهای پرداختنی",
        accountCode: "2101",
        debit: 0,
        credit: 950000,
        description: "خرید لوازم اداری",
      },
      {
        id: "4",
        accountId: "5101",
        accountName: "خرید کالا",
        accountCode: "5101",
        debit: 950000,
        credit: 0,
        description: "خرید لوازم اداری",
      },
    ],
    createdAt: "2024-12-02T11:00:00Z",
    updatedAt: "2024-12-02T11:00:00Z",
  },
  {
    id: "3",
    number: "س-003",
    date: "1403-12-03",
    description: "ثبت دریافت چک از مشتری",
    periodId: "1",
    periodName: "دی 1403",
    status: "DRAFT",
    totalDebit: 5000000,
    totalCredit: 5000000,
    createdById: "2",
    createdByName: "مریم احمدی",
    items: [
      {
        id: "5",
        accountId: "1101",
        accountName: "چکهای دریافتنی",
        accountCode: "1101",
        debit: 5000000,
        credit: 0,
        description: "دریافت چک",
      },
      {
        id: "6",
        accountId: "1201",
        accountName: "حسابهای دریافتنی",
        accountCode: "1201",
        debit: 0,
        credit: 5000000,
        description: "دریافت چک",
      },
    ],
    createdAt: "2024-12-03T09:30:00Z",
    updatedAt: "2024-12-03T09:30:00Z",
  },
];

// Mock accounts for reference
const mockAccounts = [
  { id: "1101", code: "1101", name: "چکهای دریافتنی", type: "ASSET" },
  { id: "1201", code: "1201", name: "حسابهای دریافتنی", type: "ASSET" },
  { id: "2101", code: "2101", name: "حسابهای پرداختنی", type: "LIABILITY" },
  { id: "4101", code: "4101", name: "فروش کالا", type: "REVENUE" },
  { id: "5101", code: "5101", name: "خرید کالا", type: "EXPENSE" },
  { id: "3101", code: "3101", name: "صندوق", type: "ASSET" },
  { id: "3201", code: "3201", name: "بانک", type: "ASSET" },
];

// Mock periods for reference
const mockPeriods = [
  { id: "1", name: "دی 1403", startDate: "2024-12-01", endDate: "2024-12-31", isClosed: false },
  { id: "2", name: "آذر 1403", startDate: "2024-11-01", endDate: "2024-11-30", isClosed: false },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const periodId = searchParams.get('periodId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');

    let filteredEntries = [...mockJournalEntries];

    // Apply filters
    if (periodId) {
      filteredEntries = filteredEntries.filter(entry => entry.periodId === periodId);
    }

    if (status) {
      filteredEntries = filteredEntries.filter(entry => entry.status === status);
    }

    if (startDate) {
      filteredEntries = filteredEntries.filter(entry => entry.date >= startDate);
    }

    if (endDate) {
      filteredEntries = filteredEntries.filter(entry => entry.date <= endDate);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredEntries = filteredEntries.filter(entry => 
        entry.number.toLowerCase().includes(searchLower) ||
        entry.description.toLowerCase().includes(searchLower)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedEntries = filteredEntries.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedEntries,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredEntries.length / limit),
        totalItems: filteredEntries.length,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست اسناد حسابداری" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = journalEntrySchema.parse(body);

    // Validate accounting equation (Debits = Credits)
    let totalDebit = 0;
    let totalCredit = 0;
    const items = validatedData.items.map((item, index) => {
      const debit = parseFloat(item.debit) || 0;
      const credit = parseFloat(item.credit) || 0;
      totalDebit += debit;
      totalCredit += credit;

      const account = mockAccounts.find(acc => acc.id === item.accountId);

      return {
        id: `item-${Date.now()}-${index}`,
        accountId: item.accountId,
        accountName: account?.name || "نامشخص",
        accountCode: account?.code || "نامشخص",
        debit,
        credit,
        description: item.description || "",
      };
    });

    // Check if debits equal credits
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        { 
          success: false, 
          error: "مجموع بدهکار و بستانکار باید برابر باشند",
          details: { totalDebit, totalCredit, difference: Math.abs(totalDebit - totalCredit) }
        },
        { status: 400 }
      );
    }

    // Check if there's at least one debit and one credit
    const hasDebit = items.some(item => item.debit > 0);
    const hasCredit = items.some(item => item.credit > 0);
    if (!hasDebit || !hasCredit) {
      return NextResponse.json(
        { success: false, error: "حداقل یک آیتم بدهکار و یک آیتم بستانکار الزامی است" },
        { status: 400 }
      );
    }

    const period = mockPeriods.find(p => p.id === validatedData.periodId);

    const newEntry = {
      id: `entry-${Date.now()}`,
      number: validatedData.number,
      date: validatedData.date,
      description: validatedData.description,
      periodId: validatedData.periodId,
      periodName: period?.name || "نامشخص",
      status: "DRAFT",
      totalDebit,
      totalCredit,
      createdById: "1", // In real app, get from auth context
      createdByName: "کاربر فعلی", // In real app, get from auth context
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockJournalEntries.unshift(newEntry);

    return NextResponse.json({
      success: true,
      data: newEntry,
      message: "سند حسابداری با موفقیت ثبت شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ثبت سند حسابداری" },
      { status: 500 }
    );
  }
}