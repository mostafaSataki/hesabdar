import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for purchase invoice
const purchaseInvoiceSchema = z.object({
  number: z.string().min(1, "شماره فاکتور الزامی است"),
  date: z.string().min(1, "تاریخ فاکتور الزامی است"),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است"),
  description: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, "کالا الزامی است"),
    quantity: z.string().min(1, "تعداد الزامی است"),
    unitPrice: z.string().min(1, "قیمت واحد الزامی است"),
    discount: z.string().default("0"),
    totalPrice: z.string().min(1, "قیمت کل الزامی است"),
  })).min(1, "حداقل یک آیتم الزامی است"),
  discount: z.string().default("0"),
  taxRate: z.string().default("0"),
  paymentTerms: z.string().optional(),
  dueDate: z.string().optional(),
});

// Mock data for demonstration
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
  {
    id: "3",
    number: "خ-003",
    date: "1403-12-05",
    supplierId: "3",
    supplierName: "تولید کننده ج",
    description: "خرید مواد اولیه",
    totalAmount: 5000000,
    discount: 0,
    taxAmount: 500000,
    finalAmount: 5500000,
    status: "DRAFT",
    paymentTerms: "60 روز",
    dueDate: "1404-02-05",
    items: [
      {
        id: "3",
        productId: "3",
        productName: "کاغذ A4",
        quantity: 100,
        unitPrice: 50000,
        discount: 0,
        totalPrice: 5000000,
      },
    ],
    createdAt: "2024-12-05T10:30:00Z",
    updatedAt: "2024-12-05T10:30:00Z",
  },
];

// Mock suppliers for reference
const mockSuppliers = [
  { id: "1", name: "شرکت واردات الف" },
  { id: "2", name: "فروشگاه عمده ب" },
  { id: "3", name: "تولید کننده ج" },
];

// Mock products for reference
const mockProducts = [
  { id: "1", name: "لپتاپ مدل A", price: 25000000 },
  { id: "2", name: "موس بی‌سیم گیمینگ", price: 100000 },
  { id: "3", name: "کاغذ A4", price: 50000 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const supplierId = searchParams.get('supplierId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredInvoices = [...mockPurchaseInvoices];

    // Apply filters
    if (supplierId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.supplierId === supplierId);
    }

    if (status) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status);
    }

    if (startDate) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.date >= startDate);
    }

    if (endDate) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.date <= endDate);
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedInvoices,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(filteredInvoices.length / limit),
        totalItems: filteredInvoices.length,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "خطا در دریافت لیست فاکتورهای خرید" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = purchaseInvoiceSchema.parse(body);

    // Calculate totals
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
        productName: mockProducts.find(p => p.id === item.productId)?.name || "نامشخص",
        quantity,
        unitPrice,
        discount,
        totalPrice,
      };
    });

    const discount = parseFloat(validatedData.discount) || 0;
    const taxRate = parseFloat(validatedData.taxRate) || 0;
    const taxAmount = (totalAmount - discount) * (taxRate / 100);
    const finalAmount = totalAmount - discount + taxAmount;

    const supplier = mockSuppliers.find(s => s.id === validatedData.supplierId);

    const newInvoice = {
      id: `purchase-${Date.now()}`,
      number: validatedData.number,
      date: validatedData.date,
      supplierId: validatedData.supplierId,
      supplierName: supplier?.name || "نامشخص",
      description: validatedData.description,
      totalAmount,
      discount,
      taxAmount,
      finalAmount,
      status: "DRAFT",
      paymentTerms: validatedData.paymentTerms || "نقدی",
      dueDate: validatedData.dueDate || validatedData.date,
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPurchaseInvoices.unshift(newInvoice);

    return NextResponse.json({
      success: true,
      data: newInvoice,
      message: "فاکتور خرید با موفقیت ثبت شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ثبت فاکتور خرید" },
      { status: 500 }
    );
  }
}