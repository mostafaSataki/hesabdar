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
  FileText,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";

// Validation schemas
const purchaseInvoiceSchema = z.object({
  number: z.string().min(1, "شماره فاکتور الزامی است"),
  date: z.string().min(1, "تاریخ فاکتور الزامی است"),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  items: z.array(z.object({
    productId: z.string().min(1, "کالا الزامی است"),
    quantity: z.string().min(1, "تعداد الزامی است"),
    unitPrice: z.string().min(1, "قیمت واحد الزامی است"),
    discount: z.string().default("0"),
    totalPrice: z.string().min(1, "قیمت کل الزامی است"),
  })).min(1, "حداقل یک آیتم الزامی است"),
  discount: z.string().default("0"),
  taxRate: z.string().default("0"),
  paymentTerms: z.string().min(1, "شرایط پرداخت الزامی است"),
  dueDate: z.string().min(1, "تاریخ سررسید الزامی است"),
});

type PurchaseInvoiceFormData = z.infer<typeof purchaseInvoiceSchema>;

// Interfaces
interface PurchaseInvoice {
  id: string;
  number: string;
  date: string;
  supplierId: string;
  supplierName: string;
  description: string;
  totalAmount: number;
  discount: number;
  taxAmount: number;
  finalAmount: number;
  status: "DRAFT" | "POSTED" | "PAID" | "CANCELLED";
  paymentTerms: string;
  dueDate: string;
  items: PurchaseInvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

interface PurchaseInvoiceItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

interface Supplier {
  id: string;
  name: string;
  phone: string;
  email?: string;
  totalPurchases: number;
  lastPurchaseDate: string;
}

interface Product {
  id: string;
  name: string;
  code: string;
  purchasePrice: number;
  unit: string;
}

// Mock data
const mockSuppliers: Supplier[] = [
  {
    id: "1",
    name: "شرکت واردات الف",
    phone: "021-12345678",
    email: "info@company-a.com",
    totalPurchases: 2500000000,
    lastPurchaseDate: "1403/11/20",
  },
  {
    id: "2",
    name: "فروشگاه عمده ب",
    phone: "031-87654321",
    email: "sales@wholesale-b.com",
    totalPurchases: 1200000000,
    lastPurchaseDate: "1403/11/15",
  },
  {
    id: "3",
    name: "تولید کننده ج",
    phone: "071-11223344",
    email: "contact@manufacturer-j.com",
    totalPurchases: 3800000000,
    lastPurchaseDate: "1403/11/25",
  },
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "لپتاپ مدل A",
    code: "001",
    purchasePrice: 25000000,
    unit: "عدد",
  },
  {
    id: "2",
    name: "موس بی‌سیم گیمینگ",
    code: "002",
    purchasePrice: 500000,
    unit: "عدد",
  },
  {
    id: "3",
    name: "کاغذ A4",
    code: "003",
    purchasePrice: 50000,
    unit: "بسته",
  },
];

const mockPurchaseInvoices: PurchaseInvoice[] = [
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

const paymentTerms = [
  { value: "نقدی", label: "نقدی" },
  { value: "7 روز", label: "7 روز" },
  { value: "15 روز", label: "15 روز" },
  { value: "30 روز", label: "30 روز" },
  { value: "60 روز", label: "60 روز" },
  { value: "90 روز", label: "90 روز" },
];

const statusOptions = [
  { value: "DRAFT", label: "پیش‌نویس", color: "secondary" },
  { value: "POSTED", label: "ثبت شده", color: "default" },
  { value: "PAID", label: "پرداخت شده", color: "default" },
  { value: "CANCELLED", label: "لغو شده", color: "destructive" },
];

export function PurchaseManagement() {
  const [activeTab, setActiveTab] = useState("invoices");
  const [editingInvoice, setEditingInvoice] = useState<PurchaseInvoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState([
    { productId: "", quantity: "", unitPrice: "", discount: "0", totalPrice: "" },
  ]);

  const purchaseForm = useForm<PurchaseInvoiceFormData>({
    resolver: zodResolver(purchaseInvoiceSchema),
    defaultValues: {
      number: "",
      date: new Date().toISOString().split('T')[0],
      supplierId: "",
      description: "",
      items: invoiceItems,
      discount: "0",
      taxRate: "0",
      paymentTerms: "نقدی",
      dueDate: new Date().toISOString().split('T')[0],
    },
  });

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { productId: "", quantity: "", unitPrice: "", discount: "0", totalPrice: "" }]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const updateInvoiceItem = (index: number, field: string, value: string) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto calculate total price when quantity or unit price changes
    if (field === "quantity" || field === "unitPrice" || field === "discount") {
      const quantity = parseFloat(newItems[index].quantity) || 0;
      const unitPrice = parseFloat(newItems[index].unitPrice) || 0;
      const discount = parseFloat(newItems[index].discount) || 0;
      newItems[index].totalPrice = (quantity * unitPrice - discount).toString();
    }
    
    setInvoiceItems(newItems);
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <Badge variant={statusOption?.color as any || "secondary"}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const onPurchaseSubmit = (data: PurchaseInvoiceFormData) => {
    const hasEmptyItems = invoiceItems.some(item => !item.productId || !item.quantity || !item.unitPrice);
    if (hasEmptyItems) {
      toast.error("لطفا تمام آیتم‌ها را تکمیل کنید");
      return;
    }

    console.log("Purchase Invoice Data:", { ...data, items: invoiceItems });
    toast.success(editingInvoice ? "فاکتور خرید با موفقیت ویرایش شد" : "فاکتور خرید جدید با موفقیت ثبت شد");
    purchaseForm.reset();
    setInvoiceItems([{ productId: "", quantity: "", unitPrice: "", discount: "0", totalPrice: "" }]);
    setEditingInvoice(null);
  };

  const editInvoice = (invoice: PurchaseInvoice) => {
    setEditingInvoice(invoice);
    const items = invoice.items.map(item => ({
      productId: item.productId,
      quantity: item.quantity.toString(),
      unitPrice: item.unitPrice.toString(),
      discount: item.discount.toString(),
      totalPrice: item.totalPrice.toString(),
    }));
    setInvoiceItems(items);
    
    purchaseForm.reset({
      number: invoice.number,
      date: invoice.date,
      supplierId: invoice.supplierId,
      description: invoice.description,
      items: items,
      discount: invoice.discount.toString(),
      taxRate: "0",
      paymentTerms: invoice.paymentTerms,
      dueDate: invoice.dueDate,
    });
  };

  const deleteInvoice = (invoiceId: string) => {
    toast.success("فاکتور خرید با موفقیت حذف شد");
  };

  const postInvoice = (invoiceId: string) => {
    toast.success("فاکتور خرید با موفقیت ثبت شد");
  };

  const calculateTotalStats = () => {
    const totalPurchases = mockPurchaseInvoices.reduce((sum, inv) => sum + inv.finalAmount, 0);
    const pendingPayments = mockPurchaseInvoices
      .filter(inv => inv.status !== "PAID")
      .reduce((sum, inv) => sum + inv.finalAmount, 0);
    const draftInvoices = mockPurchaseInvoices.filter(inv => inv.status === "DRAFT").length;
    const overdueInvoices = mockPurchaseInvoices
      .filter(inv => inv.status !== "PAID" && new Date(inv.dueDate) < new Date())
      .length;

    return { totalPurchases, pendingPayments, draftInvoices, overdueInvoices };
  };

  const stats = calculateTotalStats();

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="invoices">فاکتورهای خرید</TabsTrigger>
          <TabsTrigger value="suppliers">تأمین‌کنندگان</TabsTrigger>
          <TabsTrigger value="reports">گزارشات</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 rtl:flex-row-reverse">
                <CardTitle className="text-sm font-medium">کل خریدها</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalPurchases.toLocaleString("fa-IR")} تومان
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 rtl:flex-row-reverse">
                <CardTitle className="text-sm font-medium">پرداخت‌های معوق</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.pendingPayments.toLocaleString("fa-IR")} تومان
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 rtl:flex-row-reverse">
                <CardTitle className="text-sm font-medium">پیش‌نویس‌ها</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.draftInvoices}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 rtl:flex-row-reverse">
                <CardTitle className="text-sm font-medium">سررسید گذشته</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.overdueInvoices}</div>
              </CardContent>
            </Card>
          </div>

          {/* Create/Edit Invoice Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingInvoice ? "ویرایش فاکتور خرید" : "ایجاد فاکتور خرید جدید"}
              </CardTitle>
              <CardDescription>
                اطلاعات فاکتور خرید را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...purchaseForm}>
                <form onSubmit={purchaseForm.handleSubmit(onPurchaseSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={purchaseForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره فاکتور</FormLabel>
                          <FormControl>
                            <Input placeholder="خ-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={purchaseForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={purchaseForm.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تأمین‌کننده</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="تأمین‌کننده را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockSuppliers.map((supplier) => (
                                <SelectItem key={supplier.id} value={supplier.id}>
                                  {supplier.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={purchaseForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea placeholder="توضیحات فاکتور" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Invoice Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">آیتم‌های فاکتور</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addInvoiceItem}>
                        <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                        افزودن آیتم
                      </Button>
                    </div>
                    
                    {invoiceItems.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="text-sm font-medium">کالا</label>
                            <Select 
                              value={item.productId} 
                              onValueChange={(value) => updateInvoiceItem(index, "productId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="کالا را انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockProducts.map((product) => (
                                  <SelectItem key={product.id} value={product.id}>
                                    {product.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">تعداد</label>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateInvoiceItem(index, "quantity", e.target.value)}
                              placeholder="1"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">قیمت واحد</label>
                            <Input
                              type="number"
                              value={item.unitPrice}
                              onChange={(e) => updateInvoiceItem(index, "unitPrice", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">تخفیف</label>
                            <Input
                              type="number"
                              value={item.discount}
                              onChange={(e) => updateInvoiceItem(index, "discount", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-end gap-2">
                            <div className="flex-1">
                              <label className="text-sm font-medium">مبلغ کل</label>
                              <Input
                                type="number"
                                value={item.totalPrice}
                                readOnly
                                className="bg-gray-50"
                              />
                            </div>
                            {invoiceItems.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeInvoiceItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={purchaseForm.control}
                      name="discount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تخفیف کل</FormLabel>
                          <FormControl>
                            <Input placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={purchaseForm.control}
                      name="taxRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نرخ مالیات (%)</FormLabel>
                          <FormControl>
                            <Input placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={purchaseForm.control}
                      name="paymentTerms"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شرایط پرداخت</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentTerms.map((term) => (
                                <SelectItem key={term.value} value={term.value}>
                                  {term.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={purchaseForm.control}
                      name="dueDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ سررسید</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {editingInvoice ? "ویرایش فاکتور" : "ایجاد فاکتور"}
                    </Button>
                    {editingInvoice && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingInvoice(null);
                          purchaseForm.reset();
                          setInvoiceItems([{ productId: "", quantity: "", unitPrice: "", discount: "0", totalPrice: "" }]);
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

          {/* Invoices List */}
          <Card>
            <CardHeader>
              <CardTitle>لیست فاکتورهای خرید</CardTitle>
              <CardDescription>
                مدیریت فاکتورهای خرید ثبت شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره فاکتور</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>تأمین‌کننده</TableHead>
                    <TableHead>مبلغ کل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>سررسید</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.number}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.supplierName}</TableCell>
                      <TableCell className="font-medium">
                        {invoice.finalAmount.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                      <TableCell>{invoice.dueDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editInvoice(invoice)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {invoice.status === "DRAFT" && (
                            <Button variant="ghost" size="sm" onClick={() => postInvoice(invoice.id)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteInvoice(invoice.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>لیست تأمین‌کنندگان</CardTitle>
              <CardDescription>
                مدیریت تأمین‌کنندگان و آمار خریدها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام تأمین‌کننده</TableHead>
                    <TableHead>تلفن</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>مجموع خریدها</TableHead>
                    <TableHead>آخرین خرید</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockSuppliers.map((supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell className="font-medium">{supplier.name}</TableCell>
                      <TableCell>{supplier.phone}</TableCell>
                      <TableCell>{supplier.email}</TableCell>
                      <TableCell className="font-medium">
                        {supplier.totalPurchases.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell>{supplier.lastPurchaseDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>گزارشات خرید</CardTitle>
              <CardDescription>
                تحلیل داده‌های خرید و تأمین‌کنندگان
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">گزارشات خرید</h3>
                <p className="text-gray-500">
                  بخش گزارشات خرید در حال توسعه می‌باشد
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}