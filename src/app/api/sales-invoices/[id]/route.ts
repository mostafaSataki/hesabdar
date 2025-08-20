import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data (shared with main route)
let mockSalesInvoices = [
  {
    id: "1",
    number: "ف-001",
    date: "1403-12-01",
    customerId: "1",
    customerName: "شرکت الف",
    description: "فروش لپتاپ و لوازم جانبی",
    totalAmount: 35000000,
    discount: 0,
    taxAmount: 0,
    finalAmount: 35000000,
    status: "PAID",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "لپتاپ مدل A",
        quantity: 1,
        unitPrice: 35000000,
        discount: 0,
        totalPrice: 35000000,
      },
    ],
    createdAt: "2024-12-01T10:00:00Z",
    updatedAt: "2024-12-01T10:00:00Z",
  },
  {
    id: "2",
    number: "ف-002",
    date: "1403-12-02",
    customerId: "2",
    customerName: "فروشگاه ب",
    description: "فروش لوازم اداری",
    totalAmount: 1600000,
    discount: 100000,
    taxAmount: 0,
    finalAmount: 1500000,
    status: "POSTED",
    items: [
      {
        id: "2",
        productId: "2",
        productName: "موس بی‌سیم گیمینگ",
        quantity: 2,
        unitPrice: 800000,
        discount: 50000,
        totalPrice: 1500000,
      },
    ],
    createdAt: "2024-12-02T11:00:00Z",
    updatedAt: "2024-12-02T11:00:00Z",
  },
];

// Validation schema for update
const updateInvoiceSchema = z.object({
  number: z.string().min(1, "شماره فاکتور الزامی است").optional(),
  date: z.string().min(1, "تاریخ فاکتور الزامی است").optional(),
  customerId: z.string().min(1, "مشتری الزامی است").optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "POSTED", "PAID", "CANCELLED", "RETURNED"]).optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "کالا الزامی است"),
    quantity: z.string().min(1, "تعداد الزامی است"),
    unitPrice: z.string().min(1, "قیمت واحد الزامی است"),
    discount: z.string().default("0"),
    totalPrice: z.string().min(1, "قیمت کل الزامی است"),
  })).optional(),
  discount: z.string().optional(),
  taxRate: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = mockSalesInvoices.find(inv => inv.id === params.id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "فاکتور فروش یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات فاکتور فروش" },
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
    const validatedData = updateInvoiceSchema.parse(body);

    const invoiceIndex = mockSalesInvoices.findIndex(inv => inv.id === params.id);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: "فاکتور فروش یافت نشد" },
        { status: 404 }
      );
    }

    const invoice = mockSalesInvoices[invoiceIndex];

    // Update invoice fields
    const updatedInvoice = {
      ...invoice,
      ...validatedData,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate totals if items are provided
    if (validatedData.items) {
      let totalAmount = 0;
      const items = validatedData.items.map((item, index) => {
        const quantity = parseFloat(item.quantity);
        const unitPrice = parseFloat(item.unitPrice);
        const discount = parseFloat(item.discount) || 0;
        const totalPrice = (quantity * unitPrice) - discount;
        totalAmount += totalPrice;

        return {
          id: `item-${Date.now()}-${index}`,
          productId: item.productId,
          productName: "نامشخص", // In real app, fetch from products API
          quantity,
          unitPrice,
          discount,
          totalPrice,
        };
      });

      const discount = parseFloat(validatedData.discount || invoice.discount.toString()) || 0;
      const taxRate = parseFloat(validatedData.taxRate || "0") || 0;
      const taxAmount = (totalAmount - discount) * (taxRate / 100);
      const finalAmount = totalAmount - discount + taxAmount;

      updatedInvoice.items = items;
      updatedInvoice.totalAmount = totalAmount;
      updatedInvoice.discount = discount;
      updatedInvoice.taxAmount = taxAmount;
      updatedInvoice.finalAmount = finalAmount;
    }

    mockSalesInvoices[invoiceIndex] = updatedInvoice;

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: "فاکتور فروش با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی فاکتور فروش" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceIndex = mockSalesInvoices.findIndex(inv => inv.id === params.id);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: "فاکتور فروش یافت نشد" },
        { status: 404 }
      );
    }

    const invoice = mockSalesInvoices[invoiceIndex];

    // Check if invoice can be deleted (only DRAFT status can be deleted)
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "فقط فاکتورهای پیش‌نویس قابل حذف هستند" },
        { status: 400 }
      );
    }

    mockSalesInvoices.splice(invoiceIndex, 1);

    return NextResponse.json({
      success: true,
      message: "فاکتور فروش با موفقیت حذف شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در حذف فاکتور فروش" },
      { status: 500 }
    );
  }
}