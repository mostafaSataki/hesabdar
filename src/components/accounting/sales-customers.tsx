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
import { Plus, Save, Edit, Trash2, Eye, Users, FileText, Calculator } from "lucide-react";
import { toast } from "sonner";

const customerSchema = z.object({
  code: z.string().min(1, "کد مشتری الزامی است"),
  name: z.string().min(1, "نام مشتری الزامی است"),
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  taxId: z.string().optional(),
});

const invoiceSchema = z.object({
  date: z.string().min(1, "تاریخ الزامی است"),
  number: z.string().min(1, "شماره فاکتور الزامی است"),
  customerId: z.string().min(1, "مشتری الزامی است"),
  description: z.string().optional(),
});

const invoiceItemSchema = z.object({
  productId: z.string().min(1, "کالا الزامی است"),
  quantity: z.string().min(1, "تعداد الزامی است"),
  unitPrice: z.string().min(1, "قیمت واحد الزامی است"),
  discount: z.string().optional(),
});

type CustomerFormData = z.infer<typeof customerSchema>;
type InvoiceFormData = z.infer<typeof invoiceSchema>;
type InvoiceItemFormData = z.infer<typeof invoiceItemSchema>;

interface Customer {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  taxId?: string;
  isActive: boolean;
  balance: number;
}

interface Product {
  id: string;
  code: string;
  name: string;
  salePrice: number;
  unit: string;
}

interface Invoice {
  id: string;
  number: string;
  date: string;
  customerName: string;
  totalAmount: number;
  discount: number;
  taxAmount: number;
  finalAmount: number;
  status: string;
}

interface InvoiceItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  totalPrice: number;
}

const mockCustomers: Customer[] = [
  {
    id: "1",
    code: "001",
    name: "شرکت الف",
    address: "تهران، خیابان ولیعصر",
    phone: "021-12345678",
    email: "info@company-a.com",
    taxId: "1234567890",
    isActive: true,
    balance: 5000000,
  },
  {
    id: "2",
    code: "002",
    name: "فروشگاه ب",
    address: "اصفهان، میدان نقش جهان",
    phone: "031-87654321",
    email: "sales@shop-b.com",
    isActive: true,
    balance: -2000000,
  },
  {
    id: "3",
    code: "003",
    name: "مشتری ج",
    address: "شیراز، خیابان زند",
    phone: "071-11223344",
    isActive: true,
    balance: 0,
  },
];

const mockProducts: Product[] = [
  { id: "1", code: "001", name: "لپتاپ مدل A", salePrice: 35000000, unit: "عدد" },
  { id: "2", code: "002", name: "موس بی‌سیم", salePrice: 800000, unit: "عدد" },
  { id: "3", code: "003", name: "کاغذ A4", salePrice: 80000, unit: "بسته" },
];

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "1403-001",
    date: "1403/12/01",
    customerName: "شرکت الف",
    totalAmount: 35800000,
    discount: 0,
    taxAmount: 0,
    finalAmount: 35800000,
    status: "PAID",
  },
  {
    id: "2",
    number: "1403-002",
    date: "1403/12/02",
    customerName: "فروشگاه ب",
    totalAmount: 1600000,
    discount: 100000,
    taxAmount: 0,
    finalAmount: 1500000,
    status: "POSTED",
  },
  {
    id: "3",
    number: "1403-003",
    date: "1403/12/03",
    customerName: "مشتری ج",
    totalAmount: 80000,
    discount: 0,
    taxAmount: 0,
    finalAmount: 80000,
    status: "DRAFT",
  },
];

const invoiceStatuses = {
  DRAFT: { label: "پیش‌نویس", variant: "secondary" as const },
  POSTED: { label: "ثبت شده", variant: "default" as const },
  PAID: { label: "پرداخت شده", variant: "default" as const },
  CANCELLED: { label: "لغو شده", variant: "destructive" as const },
  RETURNED: { label: "مرجوع شده", variant: "destructive" as const },
};

export function SalesCustomers() {
  const [activeTab, setActiveTab] = useState("customers");
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItemFormData[]>([
    { productId: "", quantity: "", unitPrice: "", discount: "" },
  ]);

  const customerForm = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      code: "",
      name: "",
      address: "",
      phone: "",
      email: "",
      taxId: "",
    },
  });

  const invoiceForm = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      number: "",
      customerId: "",
      description: "",
    },
  });

  const onCustomerSubmit = (data: CustomerFormData) => {
    console.log("Customer Data:", data);
    toast.success(editingCustomer ? "مشتری با موفقیت ویرایش شد" : "مشتری جدید با موفقیت ثبت شد");
    customerForm.reset();
    setEditingCustomer(null);
  };

  const onInvoiceSubmit = (data: InvoiceFormData) => {
    const hasEmptyItems = invoiceItems.some(item => !item.productId || !item.quantity || !item.unitPrice);
    if (hasEmptyItems) {
      toast.error("لطفا تمام ردیف‌های فاکتور را تکمیل کنید");
      return;
    }

    console.log("Invoice Data:", { ...data, items: invoiceItems });
    toast.success("فاکتور فروش با موفقیت ثبت شد");
    invoiceForm.reset();
    setInvoiceItems([{ productId: "", quantity: "", unitPrice: "", discount: "" }]);
  };

  const editCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    customerForm.reset({
      code: customer.code,
      name: customer.name,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
      taxId: customer.taxId,
    });
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { productId: "", quantity: "", unitPrice: "", discount: "" }]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  const updateInvoiceItem = (index: number, field: keyof InvoiceItemFormData, value: string) => {
    const newItems = [...invoiceItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setInvoiceItems(newItems);
  };

  const getInvoiceTotal = () => {
    return invoiceItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const discount = parseFloat(item.discount) || 0;
      return sum + (quantity * unitPrice - discount);
    }, 0);
  };

  const getBalanceStatus = (balance: number) => {
    if (balance > 0) {
      return { label: "بدهکار", variant: "destructive" as const };
    } else if (balance < 0) {
      return { label: "بستانکار", variant: "default" as const };
    } else {
      return { label: "تسویه", variant: "secondary" as const };
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="customers">مشتریان</TabsTrigger>
          <TabsTrigger value="invoices">فاکتورهای فروش</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingCustomer ? "ویرایش مشتری" : "ثبت مشتری جدید"}
              </CardTitle>
              <CardDescription>
                اطلاعات مشتری را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...customerForm}>
                <form onSubmit={customerForm.handleSubmit(onCustomerSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={customerForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کد مشتری</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={customerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام مشتری</FormLabel>
                          <FormControl>
                            <Input placeholder="نام مشتری" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={customerForm.control}
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
                    <FormField
                      control={customerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ایمیل</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={customerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>آدرس</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="آدرس مشتری..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={customerForm.control}
                    name="taxId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>شماره اقتصادی</FormLabel>
                        <FormControl>
                          <Input placeholder="1234567890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {editingCustomer ? "ویرایش مشتری" : "ثبت مشتری"}
                    </Button>
                    {editingCustomer && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingCustomer(null);
                          customerForm.reset();
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
              <CardTitle>لیست مشتریان</CardTitle>
              <CardDescription>
                لیست تمام مشتریان ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کد</TableHead>
                    <TableHead>نام</TableHead>
                    <TableHead>تلفن</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>مانده حساب</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCustomers.map((customer) => {
                    const balanceStatus = getBalanceStatus(customer.balance);
                    return (
                      <TableRow key={customer.id}>
                        <TableCell>{customer.code}</TableCell>
                        <TableCell>{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell className="persian-numbers">
                          {Math.abs(customer.balance).toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>
                          <Badge variant={balanceStatus.variant}>
                            {balanceStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editCustomer(customer)}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                صدور فاکتور فروش جدید
              </CardTitle>
              <CardDescription>
                اطلاعات فاکتور فروش را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...invoiceForm}>
                <form onSubmit={invoiceForm.handleSubmit(onInvoiceSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={invoiceForm.control}
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
                      control={invoiceForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره فاکتور</FormLabel>
                          <FormControl>
                            <Input placeholder="1403-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={invoiceForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مشتری</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="مشتری را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockCustomers.map((customer) => (
                                <SelectItem key={customer.id} value={customer.id}>
                                  {customer.code} - {customer.name}
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
                    control={invoiceForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="توضیحات فاکتور..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>ردیف‌های فاکتور</CardTitle>
                  <CardDescription>
                    کالاها و خدمات مربوط به این فاکتور را وارد کنید
                  </CardDescription>
                </div>
                <Button onClick={addInvoiceItem} variant="outline" size="sm">
                  <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                  افزودن کالا
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>کالا</TableHead>
                      <TableHead>تعداد</TableHead>
                      <TableHead>قیمت واحد</TableHead>
                      <TableHead>تخفیف</TableHead>
                      <TableHead>مبلغ کل</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoiceItems.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateInvoiceItem(index, "productId", value)}
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
                            onChange={(e) => updateInvoiceItem(index, "quantity", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.unitPrice}
                            onChange={(e) => updateInvoiceItem(index, "unitPrice", e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            placeholder="0"
                            value={item.discount}
                            onChange={(e) => updateInvoiceItem(index, "discount", e.target.value)}
                          />
                        </TableCell>
                        <TableCell className="persian-numbers">
                          {(
                            (parseFloat(item.quantity) || 0) * 
                            (parseFloat(item.unitPrice) || 0) - 
                            (parseFloat(item.discount) || 0)
                          ).toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>
                          {invoiceItems.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeInvoiceItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div className="text-sm">
                    <span className="font-medium">جمع کل: </span>
                    <span className="persian-numbers">
                      {getInvoiceTotal().toLocaleString("fa-IR")} تومان
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={invoiceForm.handleSubmit(onInvoiceSubmit)}>
                    <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    ثبت فاکتور
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>فاکتورهای اخیر</CardTitle>
              <CardDescription>
                لیست آخرین فاکتورهای فروش ثبت شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره فاکتور</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>مشتری</TableHead>
                    <TableHead>مبلغ کل</TableHead>
                    <TableHead>مبلغ نهایی</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockInvoices.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell>{invoice.number}</TableCell>
                      <TableCell>{invoice.date}</TableCell>
                      <TableCell>{invoice.customerName}</TableCell>
                      <TableCell className="persian-numbers">
                        {invoice.totalAmount.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers">
                        {invoice.finalAmount.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell>
                        <Badge variant={invoiceStatuses[invoice.status as keyof typeof invoiceStatuses].variant}>
                          {invoiceStatuses[invoice.status as keyof typeof invoiceStatuses].label}
                        </Badge>
                      </TableCell>
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
      </Tabs>
    </div>
  );
}