import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data (shared with main route)
let mockPurchaseInvoices = [
  {
    id: "1",
    number: "خ-001",
    date: "1403-12-01",
    supplierId: "1",
    supplierName: "شرکت واردات الف",
    description: "خرید لپتاپ از تأمین‌کننده",
    totalAmount: 25000000,
    discount: 0,
    taxAmount: 0,
    finalAmount: 25000000,
    status: "PAID",
    paymentTerms: "نقدی",
    dueDate: "1403-12-01",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "لپتاپ مدل A",
        quantity: 1,
        unitPrice: 25000000,
        discount: 0,
        totalPrice: 25000000,
      },
    ],
    createdAt: "2024-12-01T09:00:00Z",
    updatedAt: "2024-12-01T09:00:00Z",
  },
  {
    id: "2",
    number: "خ-002",
    date: "1403-12-03",
    supplierId: "2",
    supplierName: "فروشگاه عمده ب",
    description: "خرید لوازم اداری",
    totalAmount: 1000000,
    discount: 50000,
    taxAmount: 0,
    finalAmount: 950000,
    status: "POSTED",
    paymentTerms: "30 روز",
    dueDate: "1404-01-03",
    items: [
      {
        id: "2",
        productId: "2",
        productName: "موس بی‌سیم گیمینگ",
        quantity: 10,
        unitPrice: 100000,
        discount: 5000,
        totalPrice: 950000,
      },
    ],
    createdAt: "2024-12-03T14:00:00Z",
    updatedAt: "2024-12-03T14:00:00Z",
  },
];

// Validation schema for update
const updateInvoiceSchema = z.object({
  number: z.string().min(1, "شماره فاکتور الزامی است").optional(),
  date: z.string().min(1, "تاریخ فاکتور الزامی است").optional(),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است").optional(),
  description: z.string().optional(),
  status: z.enum(["DRAFT", "POSTED", "PAID", "CANCELLED"]).optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "کالا الزامی است"),
    quantity: z.string().min(1, "تعداد الزامی است"),
    unitPrice: z.string().min(1, "قیمت واحد الزامی است"),
    discount: z.string().default("0"),
    totalPrice: z.string().min(1, "قیمت کل الزامی است"),
  })).optional(),
  discount: z.string().optional(),
  taxRate: z.string().optional(),
  paymentTerms: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoice = mockPurchaseInvoices.find(inv => inv.id === params.id);

    if (!invoice) {
      return NextResponse.json(
        { success: false, error: "فاکتور خرید یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: invoice,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت اطلاعات فاکتور خرید" },
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

    const invoiceIndex = mockPurchaseInvoices.findIndex(inv => inv.id === params.id);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: "فاکتور خرید یافت نشد" },
        { status: 404 }
      );
    }

    const invoice = mockPurchaseInvoices[invoiceIndex];

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

    mockPurchaseInvoices[invoiceIndex] = updatedInvoice;

    return NextResponse.json({
      success: true,
      data: updatedInvoice,
      message: "فاکتور خرید با موفقیت به‌روزرسانی شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در به‌روزرسانی فاکتور خرید" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceIndex = mockPurchaseInvoices.findIndex(inv => inv.id === params.id);

    if (invoiceIndex === -1) {
      return NextResponse.json(
        { success: false, error: "فاکتور خرید یافت نشد" },
        { status: 404 }
      );
    }

    const invoice = mockPurchaseInvoices[invoiceIndex];

    // Check if invoice can be deleted (only DRAFT status can be deleted)
    if (invoice.status !== "DRAFT") {
      return NextResponse.json(
        { success: false, error: "فقط فاکتورهای پیش‌نویس قابل حذف هستند" },
        { status: 400 }
      );
    }

    mockPurchaseInvoices.splice(invoiceIndex, 1);

    return NextResponse.json({
      success: true,
      message: "فاکتور خرید با موفقیت حذف شد",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در حذف فاکتور خرید" },
      { status: 500 }
    );
  }
}