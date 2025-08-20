import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Validation schema for sales invoice
const salesInvoiceSchema = z.object({
  number: z.string().min(1, "شماره فاکتور الزامی است"),
  date: z.string().min(1, "تاریخ فاکتور الزامی است"),
  customerId: z.string().min(1, "مشتری الزامی است"),
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
});

// Mock data for demonstration
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

// Mock customers for reference
const mockCustomers = [
  { id: "1", name: "شرکت الف" },
  { id: "2", name: "فروشگاه ب" },
  { id: "3", name: "مشتری ج" },
];

// Mock products for reference
const mockProducts = [
  { id: "1", name: "لپتاپ مدل A", price: 35000000 },
  { id: "2", name: "موس بی‌سیم گیمینگ", price: 800000 },
  { id: "3", name: "کاغذ A4", price: 80000 },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const customerId = searchParams.get('customerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let filteredInvoices = [...mockSalesInvoices];

    // Apply filters
    if (customerId) {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.customerId === customerId);
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
      { success: false, error: "خطا در دریافت لیست فاکتورهای فروش" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = salesInvoiceSchema.parse(body);

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

    const customer = mockCustomers.find(c => c.id === validatedData.customerId);

    const newInvoice = {
      id: `invoice-${Date.now()}`,
      number: validatedData.number,
      date: validatedData.date,
      customerId: validatedData.customerId,
      customerName: customer?.name || "نامشخص",
      description: validatedData.description,
      totalAmount,
      discount,
      taxAmount,
      finalAmount,
      status: "DRAFT",
      items,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSalesInvoices.unshift(newInvoice);

    return NextResponse.json({
      success: true,
      data: newInvoice,
      message: "فاکتور فروش با موفقیت ثبت شد",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: "داده‌های نامعتبر", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "خطا در ثبت فاکتور فروش" },
      { status: 500 }
    );
  }
}