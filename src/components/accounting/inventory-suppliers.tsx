"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  Users, 
  Truck, 
  ArrowLeftRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  FileText,
  Calculator
} from "lucide-react";
import { toast } from "sonner";

// اسکیماها برای فرم‌های مختلف
const productSchema = z.object({
  code: z.string().min(1, "کد کالا الزامی است"),
  name: z.string().min(1, "نام کالا الزامی است"),
  description: z.string().optional(),
  category: z.string().min(1, "دسته‌بندی الزامی است"),
  unit: z.string().min(1, "واحد اندازه‌گیری الزامی است"),
  purchasePrice: z.string().min(1, "قیمت خرید الزامی است"),
  salePrice: z.string().min(1, "قیمت فروش الزامی است"),
  quantity: z.string().min(1, "موجودی اولیه الزامی است"),
  minQuantity: z.string().min(1, "حداقل موجودی الزامی است"),
  maxQuantity: z.string().optional(),
  warehouseLocation: z.string().optional(),
  barcode: z.string().optional(),
});

const supplierSchema = z.object({
  code: z.string().min(1, "کد تأمین‌کننده الزامی است"),
  name: z.string().min(1, "نام تأمین‌کننده الزامی است"),
  address: z.string().min(1, "آدرس الزامی است"),
  phone: z.string().min(1, "تلفن الزامی است"),
  email: z.string().email().optional().or(z.literal("")),
  taxId: z.string().optional(),
  bankAccount: z.string().optional(),
  creditLimit: z.string().optional(),
  paymentTerms: z.string().optional(),
});

const warehouseEntrySchema = z.object({
  date: z.string().min(1, "تاریخ ورود الزامی است"),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است"),
  invoiceNumber: z.string().min(1, "شماره فاکتور الزامی است"),
  referenceNumber: z.string().optional(),
  description: z.string().min(1, "توضیحات الزامی است"),
  warehouseId: z.string().min(1, "انبار مقصد الزامی است"),
});

const warehouseEntryItemSchema = z.object({
  productId: z.string().min(1, "کالا الزامی است"),
  quantity: z.string().min(1, "تعداد الزامی است"),
  unitPrice: z.string().min(1, "قیمت واحد الزامی است"),
  totalPrice: z.string().min(1, "قیمت کل الزامی است"),
  expirationDate: z.string().optional(),
  batchNumber: z.string().optional(),
});

const inventoryAdjustmentSchema = z.object({
  date: z.string().min(1, "تاریخ الزامی است"),
  warehouseId: z.string().min(1, "انبار الزامی است"),
  reason: z.string().min(1, "علت تعدیل الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  referenceNumber: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;
type SupplierFormData = z.infer<typeof supplierSchema>;
type WarehouseEntryFormData = z.infer<typeof warehouseEntrySchema>;
type WarehouseEntryItemFormData = z.infer<typeof warehouseEntryItemSchema>;
type InventoryAdjustmentFormData = z.infer<typeof inventoryAdjustmentSchema>;

// اینترفیس‌ها
interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unit: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minQuantity: number;
  maxQuantity?: number;
  warehouseLocation?: string;
  barcode?: string;
  isActive: boolean;
  lastUpdated: string;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  taxId?: string;
  bankAccount?: string;
  creditLimit?: number;
  paymentTerms?: string;
  isActive: boolean;
  totalPurchases: number;
  lastPurchaseDate: string;
}

interface Warehouse {
  id: string;
  name: string;
  code: string;
  location: string;
  capacity: number;
  currentStock: number;
  manager: string;
}

interface WarehouseEntry {
  id: string;
  date: string;
  supplier: string;
  invoiceNumber: string;
  referenceNumber?: string;
  description: string;
  warehouse: string;
  totalItems: number;
  totalAmount: number;
  status: "DRAFT" | "CONFIRMED" | "CANCELLED";
}

interface WarehouseEntryItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  expirationDate?: string;
  batchNumber?: string;
}

// داده‌های نمونه
const units = [
  { value: "عدد", label: "عدد" },
  { value: "کیلوگرم", label: "کیلوگرم" },
  { value: "گرم", label: "گرم" },
  { value: "متر", label: "متر" },
  { value: "سانتی‌متر", label: "سانتی‌متر" },
  { value: "لیتر", label: "لیتر" },
  { value: "میل‌لیتر", label: "میل‌لیتر" },
  { value: "متر مکعب", label: "متر مکعب" },
  { value: "بسته", label: "بسته" },
  { value: "کارتن", label: "کارتن" },
];

const categories = [
  { value: "مواد اولیه", label: "مواد اولیه" },
  { value: "کالای کامل", label: "کالای کامل" },
  { value: "نیمه‌ساخته", label: "نیمه‌ساخته" },
  { value: "خدمات", label: "خدمات" },
  { value: "لوازم اداری", label: "لوازم اداری" },
  { value: "مواد مصرفی", label: "مواد مصرفی" },
  { value: "ماشین‌آلات", label: "ماشین‌آلات" },
];

const warehouses: Warehouse[] = [
  { id: "1", name: "انبار اصلی", code: "WH-001", location: "تهران، خیابان ولیعصر", capacity: 1000, currentStock: 750, manager: "علی رضایی" },
  { id: "2", name: "انبار فرعی", code: "WH-002", location: "تهران، خیابان آزادی", capacity: 500, currentStock: 320, manager: "مریم احمدی" },
  { id: "3", name: "انبار مواد اولیه", code: "WH-003", location: "کرج، شهرک صنعتی", capacity: 2000, currentStock: 1500, manager: "رضا محمدی" },
];

const mockProducts: Product[] = [
  {
    id: "1",
    code: "001",
    name: "لپتاپ مدل A",
    description: "لپتاپ با مشخصات عالی مناسب برای کارهای اداری",
    category: "کالای کامل",
    unit: "عدد",
    purchasePrice: 25000000,
    salePrice: 35000000,
    quantity: 15,
    minQuantity: 5,
    maxQuantity: 50,
    warehouseLocation: "انبار اصلی - قفسه A-1",
    barcode: "6221044870015",
    isActive: true,
    lastUpdated: "1403/12/01",
  },
  {
    id: "2",
    code: "002",
    name: "موس بی‌سیم گیمینگ",
    description: "موس گیمینگ با دقت بالا و طراحی ارگونومیک",
    category: "لوازم اداری",
    unit: "عدد",
    purchasePrice: 500000,
    salePrice: 800000,
    quantity: 50,
    minQuantity: 10,
    maxQuantity: 100,
    warehouseLocation: "انبار اصلی - قفسه B-2",
    barcode: "6221044870022",
    isActive: true,
    lastUpdated: "1403/12/02",
  },
  {
    id: "3",
    code: "003",
    name: "کاغذ A4",
    description: "بسته ۵۰۰ برگ کاغذ A4 با گرام 80",
    category: "لوازم اداری",
    unit: "بسته",
    purchasePrice: 50000,
    salePrice: 80000,
    quantity: 100,
    minQuantity: 20,
    maxQuantity: 200,
    warehouseLocation: "انبار فرعی - قفسه C-1",
    barcode: "6221044870039",
    isActive: true,
    lastUpdated: "1403/12/03",
  },
];

const mockSuppliers: Supplier[] = [
  {
    id: "1",
    code: "001",
    name: "شرکت واردات الف",
    address: "تهران، خیابان ولیعصر، پلاک 123",
    phone: "021-12345678",
    email: "info@company-a.com",
    taxId: "1234567890",
    bankAccount: "1234-5678-9012-3456",
    creditLimit: 500000000,
    paymentTerms: "30 روز",
    isActive: true,
    totalPurchases: 2500000000,
    lastPurchaseDate: "1403/11/20",
  },
  {
    id: "2",
    code: "002",
    name: "فروشگاه عمده ب",
    address: "اصفهان، میدان نقش جهان، خیابان امام",
    phone: "031-87654321",
    email: "sales@wholesale-b.com",
    bankAccount: "9876-5432-1098-7654",
    creditLimit: 300000000,
    paymentTerms: "15 روز",
    isActive: true,
    totalPurchases: 1200000000,
    lastPurchaseDate: "1403/11/15",
  },
  {
    id: "3",
    code: "003",
    name: "تولید کننده ج",
    address: "شیراز، خیابان زند، پلاک 456",
    phone: "071-11223344",
    email: "contact@manufacturer-j.com",
    taxId: "0987654321",
    bankAccount: "5555-6666-7777-8888",
    creditLimit: 800000000,
    paymentTerms: "60 روز",
    isActive: true,
    totalPurchases: 3800000000,
    lastPurchaseDate: "1403/11/25",
  },
];

const mockWarehouseEntries: WarehouseEntry[] = [
  {
    id: "1",
    date: "1403/12/01",
    supplier: "شرکت واردات الف",
    invoiceNumber: "ف-001",
    referenceNumber: "REF-001",
    description: "ورود محموله لپتاپ‌ها",
    warehouse: "انبار اصلی",
    totalItems: 10,
    totalAmount: 250000000,
    status: "CONFIRMED",
  },
  {
    id: "2",
    date: "1403/12/02",
    supplier: "فروشگاه عمده ب",
    invoiceNumber: "ف-002",
    description: "ورود لوازم اداری",
    warehouse: "انبار فرعی",
    totalItems: 100,
    totalAmount: 50000000,
    status: "CONFIRMED",
  },
];

export function InventorySuppliers() {
  const [activeTab, setActiveTab] = useState("products");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [warehouseEntryItems, setWarehouseEntryItems] = useState<WarehouseEntryItemFormData[]>([
    { productId: "", quantity: "", unitPrice: "", totalPrice: "", expirationDate: "", batchNumber: "" },
  ]);

  const productForm = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      category: "",
      unit: "عدد",
      purchasePrice: "",
      salePrice: "",
      quantity: "",
      minQuantity: "",
      maxQuantity: "",
      warehouseLocation: "",
      barcode: "",
    },
  });

  const supplierForm = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      taxId: "",
      bankAccount: "",
      creditLimit: "",
      paymentTerms: "",
    },
  });

  const warehouseEntryForm = useForm<WarehouseEntryFormData>({
    resolver: zodResolver(warehouseEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      supplierId: "",
      invoiceNumber: "",
      referenceNumber: "",
      description: "",
      warehouseId: "",
    },
  });

  const inventoryAdjustmentForm = useForm<InventoryAdjustmentFormData>({
    resolver: zodResolver(inventoryAdjustmentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      warehouseId: "",
      reason: "",
      description: "",
      referenceNumber: "",
    },
  });

  const addWarehouseEntryItem = () => {
    setWarehouseEntryItems([...warehouseEntryItems, { 
      productId: "", quantity: "", unitPrice: "", totalPrice: "", expirationDate: "", batchNumber: "" 
    }]);
  };

  const removeWarehouseEntryItem = (index: number) => {
    if (warehouseEntryItems.length > 1) {
      setWarehouseEntryItems(warehouseEntryItems.filter((_, i) => i !== index));
    }
  };

  const updateWarehouseEntryItem = (index: number, field: keyof WarehouseEntryItemFormData, value: string) => {
    const newItems = [...warehouseEntryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice") {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      newItems[index].totalPrice = (quantity * unitPrice).toString();
    }
    
    setWarehouseEntryItems(newItems);
  };

  const getStockStatus = (product: Product) => {
    if (product.quantity <= product.minQuantity) {
      return { label: "نیاز به سفارش", variant: "destructive" as const, icon: AlertTriangle };
    } else if (product.quantity <= (product.maxQuantity || product.minQuantity * 3) * 0.5) {
      return { label: "موجودی کم", variant: "secondary" as const, icon: Clock };
    } else {
      return { label: "موجودی کافی", variant: "default" as const, icon: CheckCircle };
    }
  };

  const onProductSubmit = (data: ProductFormData) => {
    console.log("Product Data:", data);
    toast.success(editingProduct ? "کالا با موفقیت ویرایش شد" : "کالای جدید با موفقیت ثبت شد");
    productForm.reset();
    setEditingProduct(null);
  };

  const onSupplierSubmit = (data: SupplierFormData) => {
    console.log("Supplier Data:", data);
    toast.success(editingSupplier ? "تأمین‌کننده با موفقیت ویرایش شد" : "تأمین‌کننده جدید با موفقیت ثبت شد");
    supplierForm.reset();
    setEditingSupplier(null);
  };

  const onWarehouseEntrySubmit = (data: WarehouseEntryFormData) => {
    const hasEmptyItems = warehouseEntryItems.some(item => !item.productId || !item.quantity || !item.unitPrice);
    if (hasEmptyItems) {
      toast.error("لطفا تمام آیتم‌ها را تکمیل کنید");
      return;
    }

    console.log("Warehouse Entry Data:", { ...data, items: warehouseEntryItems });
    toast.success("ورود کالا به انبار با موفقیت ثبت شد");
    warehouseEntryForm.reset();
    setWarehouseEntryItems([{ productId: "", quantity: "", unitPrice: "", totalPrice: "", expirationDate: "", batchNumber: "" }]);
  };

  const onInventoryAdjustmentSubmit = (data: InventoryAdjustmentFormData) => {
    console.log("Inventory Adjustment Data:", data);
    toast.success("تعدیل موجودی با موفقیت ثبت شد");
    inventoryAdjustmentForm.reset();
  };

  const editProduct = (product: Product) => {
    setEditingProduct(product);
    productForm.reset({
      code: product.code,
      name: product.name,
      description: product.description,
      category: product.category,
      unit: product.unit,
      purchasePrice: product.purchasePrice.toString(),
      salePrice: product.salePrice.toString(),
      quantity: product.quantity.toString(),
      minQuantity: product.minQuantity.toString(),
      maxQuantity: product.maxQuantity?.toString(),
      warehouseLocation: product.warehouseLocation,
      barcode: product.barcode,
    });
  };

  const editSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    supplierForm.reset({
      code: supplier.code,
      name: supplier.name,
      address: supplier.address,
      phone: supplier.phone,
      email: supplier.email,
      taxId: supplier.taxId,
      bankAccount: supplier.bankAccount,
      creditLimit: supplier.creditLimit?.toString(),
      paymentTerms: supplier.paymentTerms,
    });
  };

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">کالاها و انبار</TabsTrigger>
          <TabsTrigger value="suppliers">تأمین‌کنندگان</TabsTrigger>
          <TabsTrigger value="warehouse">ورود کالا به انبار</TabsTrigger>
          <TabsTrigger value="reports">گزارشات</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                {editingProduct ? "ویرایش کالا" : "ثبت کالای جدید"}
              </CardTitle>
              <CardDescription>
                اطلاعات کالا را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(onProductSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={productForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کد کالا</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام کالا</FormLabel>
                          <FormControl>
                            <Input placeholder="نام کالا" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>دسته‌بندی</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="دسته‌بندی را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={productForm.control}
                      name="unit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>واحد سنجش</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="واحد را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {units.map((unit) => (
                                <SelectItem key={unit.value} value={unit.value}>
                                  {unit.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="purchasePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>قیمت خرید</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="salePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>قیمت فروش</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="barcode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>بارکد</FormLabel>
                          <FormControl>
                            <Input placeholder="بارکد کالا" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={productForm.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>موجودی اولیه</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="minQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حداقل موجودی</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="maxQuantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حداکثر موجودی</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={productForm.control}
                      name="warehouseLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مکان انبار</FormLabel>
                          <FormControl>
                            <Input placeholder="مثلا: انبار اصلی - قفسه A-1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={productForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="توضیحات مربوط به کالا..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {editingProduct ? "ویرایش کالا" : "ثبت کالا"}
                    </Button>
                    {editingProduct && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingProduct(null);
                          productForm.reset();
                        }}
                      >
                        انصراف
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>لیست کالاها</CardTitle>
              <CardDescription>
                لیست تمام کالاهای ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>کد</TableHead>
                      <TableHead>نام کالا</TableHead>
                      <TableHead>دسته‌بندی</TableHead>
                      <TableHead>واحد</TableHead>
                      <TableHead>قیمت فروش</TableHead>
                      <TableHead>موجودی</TableHead>
                      <TableHead>مکان انبار</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockProducts.map((product) => {
                      const stockStatus = getStockStatus(product);
                      const StatusIcon = stockStatus.icon;
                      return (
                        <TableRow key={product.id}>
                          <TableCell>{product.code}</TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">{product.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell className="persian-numbers">
                            {product.salePrice.toLocaleString("fa-IR")} تومان
                          </TableCell>
                          <TableCell className="persian-numbers">
                            {product.quantity.toLocaleString("fa-IR")}
                          </TableCell>
                          <TableCell className="text-sm">{product.warehouseLocation}</TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.variant} className="flex items-center gap-1">
                              <StatusIcon className="h-3 w-3" />
                              {stockStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" onClick={() => editProduct(product)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingSupplier ? "ویرایش تأمین‌کننده" : "ثبت تأمین‌کننده جدید"}
              </CardTitle>
              <CardDescription>
                اطلاعات تأمین‌کننده را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...supplierForm}>
                <form onSubmit={supplierForm.handleSubmit(onSupplierSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={supplierForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کد تأمین‌کننده</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplierForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام تأمین‌کننده</FormLabel>
                          <FormControl>
                            <Input placeholder="نام تأمین‌کننده" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplierForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تلفن</FormLabel>
                          <FormControl>
                            <Input placeholder="021-12345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={supplierForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ایمیل</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplierForm.control}
                      name="taxId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شناسه مالیاتی</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={supplierForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>آدرس</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="آدرس کامل تأمین‌کننده..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={supplierForm.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حساب بانکی</FormLabel>
                          <FormControl>
                            <Input placeholder="1234-5678-9012-3456" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplierForm.control}
                      name="creditLimit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حد اعتبار</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={supplierForm.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شرایط پرداخت</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="شرایط پرداخت را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="نقدی">نقدی</SelectItem>
                              <SelectItem value="7 روز">7 روز</SelectItem>
                              <SelectItem value="15 روز">15 روز</SelectItem>
                              <SelectItem value="30 روز">30 روز</SelectItem>
                              <SelectItem value="60 روز">60 روز</SelectItem>
                              <SelectItem value="90 روز">90 روز</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {editingSupplier ? "ویرایش تأمین‌کننده" : "ثبت تأمین‌کننده"}
                    </Button>
                    {editingSupplier && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingSupplier(null);
                          supplierForm.reset();
                        }}
                      >
                        انصراف
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>لیست تأمین‌کنندگان</CardTitle>
              <CardDescription>
                لیست تمام تأمین‌کنندگان ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>کد</TableHead>
                      <TableHead>نام تأمین‌کننده</TableHead>
                      <TableHead>تلفن</TableHead>
                      <TableHead>ایمیل</TableHead>
                      <TableHead>حد اعتبار</TableHead>
                      <TableHead>شرایط پرداخت</TableHead>
                      <TableHead>خرید کل</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>{supplier.code}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{supplier.name}</div>
                            <div className="text-sm text-muted-foreground">{supplier.address}</div>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.phone}</TableCell>
                        <TableCell>{supplier.email}</TableCell>
                        <TableCell className="persian-numbers">
                          {supplier.creditLimit?.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>{supplier.paymentTerms}</TableCell>
                        <TableCell className="persian-numbers">
                          {supplier.totalPurchases.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editSupplier(supplier)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warehouse" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                فرم ورود کالا به انبار
              </CardTitle>
              <CardDescription>
                اطلاعات ورود کالا به انبار را ثبت کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...warehouseEntryForm}>
                <form onSubmit={warehouseEntryForm.handleSubmit(onWarehouseEntrySubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={warehouseEntryForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ ورود کالا</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={warehouseEntryForm.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>انتخاب تامین‌کننده</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="تامین‌کننده را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockSuppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.code} - {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={warehouseEntryForm.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>انبار مقصد</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="انبار را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses.map((warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name} - {warehouse.location}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={warehouseEntryForm.control}
                      name="invoiceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره فاکتور خرید</FormLabel>
                          <FormControl>
                            <Input placeholder="ف-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={warehouseEntryForm.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره مرجع</FormLabel>
                          <FormControl>
                            <Input placeholder="شماره مرجع" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={warehouseEntryForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Input placeholder="توضیحات ورود کالا" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">آیتم‌های کالا</h3>
                      <Button type="button" onClick={addWarehouseEntryItem} variant="outline" size="sm">
                        <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                        افزودن آیتم
                      </Button>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>کالا</TableHead>
                            <TableHead>تعداد</TableHead>
                            <TableHead>قیمت واحد</TableHead>
                            <TableHead>قیمت کل</TableHead>
                            <TableHead>تاریخ انقضا</TableHead>
                            <TableHead>شماره سریال</TableHead>
                            <TableHead>عملیات</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {warehouseEntryItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select
                                  value={item.productId}
                                  onValueChange={(value) => updateWarehouseEntryItem(index, "productId", value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="انتخاب کالا" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {mockProducts.map((product) => (
                                      <SelectItem key={product.id} value={product.id}>
                                        {product.code} - {product.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.quantity}
                                  onChange={(e) => updateWarehouseEntryItem(index, "quantity", e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.unitPrice}
                                  onChange={(e) => updateWarehouseEntryItem(index, "unitPrice", e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.totalPrice}
                                  readOnly
                                  className="bg-muted"
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="date"
                                  value={item.expirationDate}
                                  onChange={(e) => updateWarehouseEntryItem(index, "expirationDate", e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  placeholder="شماره سریال/بچ"
                                  value={item.batchNumber}
                                  onChange={(e) => updateWarehouseEntryItem(index, "batchNumber", e.target.value)}
                                />
                              </TableCell>
                              <TableCell>
                                {warehouseEntryItems.length > 1 && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeWarehouseEntryItem(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ثبت ورود کالا
                    </Button>
                    <Button type="button" variant="outline">
                      <ArrowLeftRight className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ثبت برگشت کالا
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تعدیل موجودی انبار</CardTitle>
              <CardDescription>
                ثبت تعدیل موجودی کالاها در انبار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...inventoryAdjustmentForm}>
                <form onSubmit={inventoryAdjustmentForm.handleSubmit(onInventoryAdjustmentSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={inventoryAdjustmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ تعدیل</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inventoryAdjustmentForm.control}
                      name="warehouseId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>انبار</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="انبار را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {warehouses.map((warehouse) => (
                                <SelectItem key={warehouse.id} value={warehouse.id}>
                                  {warehouse.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inventoryAdjustmentForm.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>علت تعدیل</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="علت تعدیل را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="DAMAGE">خسارت</SelectItem>
                              <SelectItem value="LOSS">مفقودی</SelectItem>
                              <SelectItem value="COUNT_ERROR">خطای شمارش</SelectItem>
                              <SelectItem value="THEFT">سرقت</SelectItem>
                              <SelectItem value="ADJUSTMENT">تعدیل عادی</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={inventoryAdjustmentForm.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره مرجع</FormLabel>
                          <FormControl>
                            <Input placeholder="شماره مرجع" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={inventoryAdjustmentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="توضیحات مربوط به تعدیل موجودی..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">
                    <Calculator className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    ثبت تعدیل موجودی
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>ورودهای اخیر به انبار</CardTitle>
              <CardDescription>
                لیست آخرین ورودهای کالا به انبار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>تأمین‌کننده</TableHead>
                      <TableHead>شماره فاکتور</TableHead>
                      <TableHead>انبار</TableHead>
                      <TableHead>تعداد آیتم</TableHead>
                      <TableHead>مبلغ کل</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockWarehouseEntries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.date}</TableCell>
                        <TableCell>{entry.supplier}</TableCell>
                        <TableCell>{entry.invoiceNumber}</TableCell>
                        <TableCell>{entry.warehouse}</TableCell>
                        <TableCell className="persian-numbers">{entry.totalItems}</TableCell>
                        <TableCell className="persian-numbers">
                          {entry.totalAmount.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>
                          <Badge variant={entry.status === "CONFIRMED" ? "default" : "secondary"}>
                            {entry.status === "CONFIRMED" ? "تأیید شده" : "پیش‌نویس"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📦</div>
                  <div>
                    <CardTitle className="text-lg">گزارش موجودی انبار</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش کامل موجودی کالاها در انبارها
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📋</div>
                  <div>
                    <CardTitle className="text-lg">فاکتورهای خرید</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش فاکتورهای خرید و ورود کالا
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">🔄</div>
                  <div>
                    <CardTitle className="text-lg">کالاهای برگشتی</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش کالاهای برگشتی به تأمین‌کنندگان
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">📊</div>
                  <div>
                    <CardTitle className="text-lg">تحلیل انبار</CardTitle>
                    <CardDescription className="text-sm">
                      تحلیل عملکرد انبار و گردش کالا
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">👥</div>
                  <div>
                    <CardTitle className="text-lg">گزارش تأمین‌کنندگان</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش عملکرد تأمین‌کنندگان
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <CardTitle className="text-lg">کالاهای کم‌موجود</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش کالاهای نیازمند سفارش
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  مشاهده گزارش
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}