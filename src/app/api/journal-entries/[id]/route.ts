import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data (shared with main route)
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
];

// Validation schema for update
const updateEntrySchema = z.object({
  number: z.string().min(1, "شماره سند الزامی است").optional(),
  date: z.string().min(1, "تاریخ سند الزامی است").optional(),
  description: z.string().min(1, "توضیحات سند الزامی است").optional(),
  periodId: z.string().min(1, "دوره مالی الزامی است").optional(),
  status: z.enum(["DRAFT", "POSTED", "CANCELLED"]).optional(),
  items: z.array(z.object({
    accountId: z.string().min(1, "حساب الزامی است"),
    debit: z.string().min(0, "بدهکار باید عدد مثبت باشد"),
    credit: z.string().min(0, "بستانکار باید عدد مثبت باشد"),
    description: z.string().optional(),
  })).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entry = mockJournalEntries.find(ent => ent.id === params.id);

    if (!entry) {
      return NextResponse.json(
        { success: false, error: "سند حسابداری یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: entry,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات سند حسابداری" },
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
    const validatedData = updateEntrySchema.parse(body);

    const entryIndex = mockJournalEntries.findIndex(ent => ent.id === params.id);

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: "سند حسابداری یافت نشد" },
        { status: 404 }
      );
    }

    const entry = mockJournalEntries[entryIndex];

    // Check if entry can be updated (only DRAFT status can be updated)
    if (entry.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "فقط اسناد پیش‌نویس قابل ویرایش هستند" },
        { status: 400 }
      );
    }

    // Update entry fields
    const updatedEntry = {
      ...entry,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate totals and validate if items are provided
    if (validatedData.items) {
      let totalDebit = 0;
      let totalCredit = 0;
      const items = validatedData.items.map((item, index) => {
        const debit = parseFloat(item.debit) || 0;
        const credit = parseFloat(item.credit) || 0;
        totalDebit += debit;
        totalCredit += credit;

        return {
          id: `item-${Date.now()}-${index}`,
          accountId: item.accountId,
          accountName: "نامشخص", // In real app, fetch from accounts API
          accountCode: "نامشخص",
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

      updatedEntry.items = items;
      updatedEntry.totalDebit = totalDebit;
      updatedEntry.totalCredit = totalCredit;
    }

    mockJournalEntries[entryIndex] = updatedEntry;

    return NextResponse.json({
      success: true,
      data: updatedEntry,
      message: "سند حسابداری با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی سند حسابداری" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryIndex = mockJournalEntries.findIndex(ent => ent.id === params.id);

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: "سند حسابداری یافت نشد" },
        { status: 404 }
      );
    }

    const entry = mockJournalEntries[entryIndex];

    // Check if entry can be deleted (only DRAFT status can be deleted)
    if (entry.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "فقط اسناد پیش‌نویس قابل حذف هستند" },
        { status: 400 }
      );
    }

    mockJournalEntries.splice(entryIndex, 1);

    return NextResponse.json({
      success: true,
      message: "سند حسابداری با موفقیت حذف شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در حذف سند حسابداری" },
      { status: 500 }
    );
  }
}

// Additional endpoint for posting (approving) journal entries
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const entryIndex = mockJournalEntries.findIndex(ent => ent.id === params.id);

    if (entryIndex === -1) {
      return NextResponse.json(
        { success: false, error: "سند حسابداری یافت نشد" },
        { status: 404 }
      );
    }

    const entry = mockJournalEntries[entryIndex];

    // Check if entry can be posted (only DRAFT status can be posted)
    if (entry.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "فقط اسناد پیش‌نویس قابل ثبت نهایی هستند" },
        { status: 400 }
      );
    }

    // Update entry status to POSTED
    mockJournalEntries[entryIndex] = {
      ...entry,
      status: "POSTED",
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: mockJournalEntries[entryIndex],
      message: "سند حسابداری با موفقیت ثبت نهایی شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در ثبت نهایی سند حسابداری" },
      { status: 500 }
    );
  }
}