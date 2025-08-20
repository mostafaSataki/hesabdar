import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let products = [
  {
    id: '1',
    code: '001',
    name: 'لپتاپ مدل A',
    description: 'لپتاپ با مشخصات عالی مناسب برای کارهای اداری',
    category: 'کالای کامل',
    unit: 'عدد',
    purchasePrice: 25000000,
    salePrice: 35000000,
    quantity: 15,
    minQuantity: 5,
    maxQuantity: 50,
    warehouseLocation: 'انبار اصلی - قفسه A-1',
    barcode: '6221044870015',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    code: '002',
    name: 'موس بی‌سیم گیمینگ',
    description: 'موس گیمینگ با دقت بالا و طراحی ارگونومیک',
    category: 'لوازم اداری',
    unit: 'عدد',
    purchasePrice: 500000,
    salePrice: 800000,
    quantity: 50,
    minQuantity: 10,
    maxQuantity: 100,
    warehouseLocation: 'انبار اصلی - قفسه B-2',
    barcode: '6221044870022',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    code: '003',
    name: 'کاغذ A4',
    description: 'بسته ۵۰۰ برگ کاغذ A4 با گرام 80',
    category: 'لوازم اداری',
    unit: 'بسته',
    purchasePrice: 50000,
    salePrice: 80000,
    quantity: 100,
    minQuantity: 20,
    maxQuantity: 200,
    warehouseLocation: 'انبار فرعی - قفسه C-1',
    barcode: '6221044870039',
    isActive: true,
    lastUpdated: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
];

const productSchema = z.object({
  code: z.string().min(1, 'Product code is required'),
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  unit: z.string().min(1, 'Unit is required'),
  purchasePrice: z.number().positive('Purchase price must be positive'),
  salePrice: z.number().positive('Sale price must be positive'),
  quantity: z.number().min(0, 'Quantity must be non-negative'),
  minQuantity: z.number().min(0, 'Minimum quantity must be non-negative'),
  maxQuantity: z.number().optional(),
  warehouseLocation: z.string().optional(),
  barcode: z.string().optional(),
});

// Helper function to check if product code exists
const productCodeExists = (code: string, excludeId?: string) => {
  return products.some(p => p.code === code && p.id !== excludeId);
};

// Helper function to check if barcode exists
const barcodeExists = (barcode: string, excludeId?: string) => {
  if (!barcode) return false;
  return products.some(p => p.barcode === barcode && p.id !== excludeId);
};

// Helper function to get stock status
const getStockStatus = (product: any) => {
  if (product.quantity <= product.minQuantity) {
    return 'NEEDS_ORDER';
  } else if (product.quantity <= (product.maxQuantity || product.minQuantity * 3) * 0.5) {
    return 'LOW_STOCK';
  } else {
    return 'SUFFICIENT';
  }
};

// GET single product
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = products.find(p => p.id === params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const responseProduct = {
      ...product,
      stockStatus: getStockStatus(product),
    };

    return NextResponse.json(responseProduct);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = products.find(p => p.id === params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Check if product code already exists (excluding current product)
    if (productCodeExists(validatedData.code, params.id)) {
      return NextResponse.json(
        { error: 'Product code already exists' },
        { status: 400 }
      );
    }

    // Check if barcode already exists (excluding current product)
    if (barcodeExists(validatedData.barcode, params.id)) {
      return NextResponse.json(
        { error: 'Barcode already exists' },
        { status: 400 }
      );
    }

    // Validate sale price is greater than purchase price
    if (validatedData.salePrice <= validatedData.purchasePrice) {
      return NextResponse.json(
        { error: 'Sale price must be greater than purchase price' },
        { status: 400 }
      );
    }

    // Update product
    Object.assign(product, {
      ...validatedData,
      lastUpdated: new Date().toISOString(),
    });

    const responseProduct = {
      ...product,
      stockStatus: getStockStatus(product),
    };

    return NextResponse.json(responseProduct);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productIndex = products.findIndex(p => p.id === params.id);
    
    if (productIndex === -1) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const product = products[productIndex];

    // Check if product has stock (cannot delete products with stock)
    if (product.quantity > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing stock' },
        { status: 400 }
      );
    }

    products.splice(productIndex, 1);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

// PATCH update product quantity (for inventory adjustments)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = products.find(p => p.id === params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { quantity, reason } = body;

    if (typeof quantity !== 'number' || quantity < 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      );
    }

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required for inventory adjustment' },
        { status: 400 }
      );
    }

    // Update product quantity
    const oldQuantity = product.quantity;
    product.quantity = quantity;
    product.lastUpdated = new Date().toISOString();

    const responseProduct = {
      ...product,
      stockStatus: getStockStatus(product),
    };

    return NextResponse.json({
      product: responseProduct,
      adjustment: {
        oldQuantity,
        newQuantity: quantity,
        difference: quantity - oldQuantity,
        reason,
        timestamp: new Date().toISOString(),
      },
      message: 'Product quantity updated successfully',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update product quantity' },
      { status: 500 }
    );
  }
}