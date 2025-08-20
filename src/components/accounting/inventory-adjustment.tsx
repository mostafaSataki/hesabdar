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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  Plus, 
  Save, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Package,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Box,
  Calculator,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

const adjustmentSchema = z.object({
  number: z.string().min(1, "شماره تنظیم الزامی است"),
  date: z.string().min(1, "تاریخ تنظیم الزامی است"),
  type: z.string().min(1, "نوع تنظیم الزامی است"),
  description: z.string().min(1, "توضیحات تنظیم الزامی است"),
});

const adjustmentItemSchema = z.object({
  productId: z.string().min(1, "کالا الزامی است"),
  quantity: z.string().min(1, "تعداد الزامی است"),
  unitCost: z.string().min(1, "قیمت واحد الزامی است"),
  reason: z.string().min(1, "دلیل تنظیم الزامی است"),
});

type AdjustmentFormData = z.infer<typeof adjustmentSchema>;
type AdjustmentItemFormData = z.infer<typeof adjustmentItemSchema>;

interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  minQuantity: number;
  isActive: boolean;
}

interface InventoryAdjustment {
  id: string;
  number: string;
  date: string;
  type: "INCREASE" | "DECREASE" | "CORRECTION";
  description: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  totalItems: number;
  totalCost: number;
  createdBy: string;
  createdAt: string;
  items: InventoryAdjustmentItem[];
}

interface InventoryAdjustmentItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  reason: string;
}

const mockProducts: Product[] = [
  { id: "1", code: "001", name: "لپتاپ مدل A", category: "کامپیوتر", unit: "عدد", quantity: 15, purchasePrice: 25000000, salePrice: 35000000, minQuantity: 5, isActive: true },
  { id: "2", code: "002", name: "موس بی‌سیم", category: "لوازم جانبی", unit: "عدد", quantity: 50, purchasePrice: 600000, salePrice: 800000, minQuantity: 10, isActive: true },
  { id: "3", code: "003", name: "کاغذ A4", category: "لوازم اداری", unit: "بسته", quantity: 100, purchasePrice: 70000, salePrice: 80000, minQuantity: 20, isActive: true },
  { id: "4", code: "004", name: "مانیتور 24 اینچ", category: "کامپیوتر", unit: "عدد", quantity: 8, purchasePrice: 8000000, salePrice: 10000000, minQuantity: 3, isActive: true },
  { id: "5", code: "005", name: "کیبورد", category: "لوازم جانبی", unit: "عدد", quantity: 25, purchasePrice: 400000, salePrice: 550000, minQuantity: 5, isActive: true },
];

const mockAdjustments: InventoryAdjustment[] = [
  {
    id: "1",
    number: "تنظیم-001",
    date: "1403/12/01",
    type: "INCREASE",
    description: "افزایش موجودی کالاهای ورودی جدید",
    status: "POSTED",
    totalItems: 2,
    totalCost: 51200000,
    createdBy: "admin",
    createdAt: "1403/12/01",
    items: [
      {
        id: "1",
        productId: "1",
        productName: "لپتاپ مدل A",
        quantity: 2,
        unitCost: 25000000,
        totalCost: 50000000,
        reason: "ورود از تأمین‌کننده",
      },
      {
        id: "2",
        productId: "2",
        productName: "موس بی‌سیم",
        quantity: 2,
        unitCost: 600000,
        totalCost: 1200000,
        reason: "ورود از تأمین‌کننده",
      },
    ],
  },
  {
    id: "2",
    number: "تنظیم-002",
    date: "1403/12/02",
    type: "DECREASE",
    description: "کاهش موجودی به دلیل خرابی",
    status: "POSTED",
    totalItems: 1,
    totalCost: 8000000,
    createdBy: "admin",
    createdAt: "1403/12/02",
    items: [
      {
        id: "3",
        productId: "4",
        productName: "مانیتور 24 اینچ",
        quantity: 1,
        unitCost: 8000000,
        totalCost: 8000000,
        reason: "خرابی و نیاز به تعویض",
      },
    ],
  },
  {
    id: "3",
    number: "تنظیم-003",
    date: "1403/12/03",
    type: "CORRECTION",
    description: "تصحیح موجودی انبار پس از شمارش",
    status: "DRAFT",
    totalItems: 3,
    totalCost: 1350000,
    createdBy: "admin",
    createdAt: "1403/12/03",
    items: [
      {
        id: "4",
        productId: "3",
        productName: "کاغذ A4",
        quantity: 5,
        unitCost: 70000,
        totalCost: 350000,
        reason: "تفاوت شمارش",
      },
      {
        id: "5",
        productId: "5",
        productName: "کیبورد",
        quantity: 2,
        unitCost: 400000,
        totalCost: 800000,
        reason: "تفاوت شمارش",
      },
      {
        id: "6",
        productId: "2",
        productName: "موس بی‌سیم",
        quantity: 1,
        unitCost: 600000,
        totalCost: 600000,
        reason: "تفاوت شمارش",
      },
    ],
  },
];

export function InventoryAdjustment() {
  const [activeTab, setActiveTab] = useState("adjustments");
  const [selectedAdjustment, setSelectedAdjustment] = useState<InventoryAdjustment | null>(null);
  const [isAdjustmentDialogOpen, setIsAdjustmentDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [adjustmentItems, setAdjustmentItems] = useState<AdjustmentItemFormData[]>([
    { productId: "", quantity: "", unitCost: "", reason: "" },
  ]);

  const adjustmentForm = useForm<AdjustmentFormData>({
    resolver: zodResolver(adjustmentSchema),
    defaultValues: {
      number: "",
      date: new Date().toISOString().split('T')[0],
      type: "CORRECTION",
      description: "",
    },
  });

  const adjustmentItemForm = useForm<AdjustmentItemFormData>({
    resolver: zodResolver(adjustmentItemSchema),
    defaultValues: {
      productId: "",
      quantity: "",
      unitCost: "",
      reason: "",
    },
  });

  const onAdjustmentSubmit = (data: AdjustmentFormData) => {
    const hasEmptyItems = adjustmentItems.some(item => !item.productId || !item.quantity || !item.unitCost || !item.reason);
    if (hasEmptyItems) {
      toast.error("لطفا تمام ردیف‌های تنظیم را تکمیل کنید");
      return;
    }

    console.log("Adjustment Data:", { ...data, items: adjustmentItems });
    toast.success("تنظیم انبار با موفقیت ثبت شد");
    setIsAdjustmentDialogOpen(false);
    adjustmentForm.reset();
    setAdjustmentItems([{ productId: "", quantity: "", unitCost: "", reason: "" }]);
  };

  const addAdjustmentItem = () => {
    setAdjustmentItems([...adjustmentItems, { productId: "", quantity: "", unitCost: "", reason: "" }]);
  };

  const removeAdjustmentItem = (index: number) => {
    if (adjustmentItems.length > 1) {
      setAdjustmentItems(adjustmentItems.filter((_, i) => i !== index));
    }
  };

  const updateAdjustmentItem = (index: number, field: keyof AdjustmentItemFormData, value: string) => {
    const newItems = [...adjustmentItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setAdjustmentItems(newItems);
  };

  const getAdjustmentTotal = () => {
    return adjustmentItems.reduce((sum, item) => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitCost = parseFloat(item.unitCost) || 0;
      return sum + (quantity * unitCost);
    }, 0);
  };

  const postAdjustment = (adjustmentId: string) => {
    toast.success("تنظیم انبار با موفقیت ثبت نهایی شد");
  };

  const cancelAdjustment = (adjustmentId: string) => {
    toast.success("تنظیم انبار با موفقیت لغو شد");
  };

  const getAdjustmentStatus = (status: string) => {
    switch (status) {
      case "DRAFT":
        return { label: "پیش‌نویس", variant: "secondary" as const, icon: FileText };
      case "POSTED":
        return { label: "ثبت شده", variant: "default" as const, icon: CheckCircle };
      case "CANCELLED":
        return { label: "لغو شده", variant: "destructive" as const, icon: XCircle };
      default:
        return { label: "نامشخص", variant: "outline" as const, icon: AlertTriangle };
    }
  };

  const getAdjustmentType = (type: string) => {
    switch (type) {
      case "INCREASE":
        return { label: "افزایش", variant: "default" as const, icon: TrendingUp };
      case "DECREASE":
        return { label: "کاهش", variant: "destructive" as const, icon: TrendingDown };
      case "CORRECTION":
        return { label: "تصحیح", variant: "secondary" as const, icon: RefreshCw };
      default:
        return { label: "نامشخص", variant: "outline" as const, icon: AlertTriangle };
    }
  };

  const filteredAdjustments = mockAdjustments.filter(adjustment => {
    const matchesStatus = filterStatus === "ALL" || adjustment.status === filterStatus;
    const matchesType = filterType === "ALL" || adjustment.type === filterType;
    const matchesSearch = adjustment.number.includes(searchTerm) || 
                         adjustment.description.includes(searchTerm);
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const lowStockProducts = mockProducts.filter(product => product.quantity <= product.minQuantity);
  const totalInventoryValue = mockProducts.reduce((sum, product) => sum + (product.quantity * product.purchasePrice), 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="adjustments">تنظیمات انبار</TabsTrigger>
          <TabsTrigger value="inventory">موجودی انبار</TabsTrigger>
          <TabsTrigger value="reports">گزارشات انبار</TabsTrigger>
        </TabsList>

        <TabsContent value="adjustments" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل کالاها</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockProducts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {mockProducts.filter(p => p.isActive).length} فعال
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">موجودی کل</CardTitle>
                <Box className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockProducts.reduce((sum, p) => sum + p.quantity, 0)}</div>
                <p className="text-xs text-muted-foreground">
                  انواع کالا
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کالاهای کم موجود</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{lowStockProducts.length}</div>
                <p className="text-xs text-muted-foreground">
                  نیاز به سفارش
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ارزش انبار</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalInventoryValue.toLocaleString("fa-IR")}</div>
                <p className="text-xs text-muted-foreground">
                  تومان
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Adjustment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                ایجاد تنظیم انبار جدید
              </CardTitle>
              <CardDescription>
                اطلاعات تنظیم انبار را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...adjustmentForm}>
                <form onSubmit={adjustmentForm.handleSubmit(onAdjustmentSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={adjustmentForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره تنظیم</FormLabel>
                          <FormControl>
                            <Input placeholder="تنظیم-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adjustmentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ تنظیم</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adjustmentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع تنظیم</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="نوع تنظیم را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INCREASE">افزایش موجودی</SelectItem>
                              <SelectItem value="DECREASE">کاهش موجودی</SelectItem>
                              <SelectItem value="CORRECTION">تصحیح موجودی</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adjustmentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Input placeholder="توضیحات تنظیم..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Adjustment Items */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold">ردیف‌های تنظیم</h3>
                      <Button type="button" variant="outline" onClick={addAdjustmentItem}>
                        <Plus className="h-4 w-4 ml-2" />
                        افزودن ردیف
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {adjustmentItems.map((item, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                              <div>
                                <label className="text-sm font-medium">کالا</label>
                                <Select 
                                  value={item.productId} 
                                  onValueChange={(value) => updateAdjustmentItem(index, 'productId', value)}
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
                              </div>
                              <div>
                                <label className="text-sm font-medium">تعداد</label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.quantity}
                                  onChange={(e) => updateAdjustmentItem(index, 'quantity', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">قیمت واحد</label>
                                <Input
                                  type="number"
                                  placeholder="0"
                                  value={item.unitCost}
                                  onChange={(e) => updateAdjustmentItem(index, 'unitCost', e.target.value)}
                                />
                              </div>
                              <div>
                                <label className="text-sm font-medium">دلیل</label>
                                <Input
                                  placeholder="دلیل تنظیم"
                                  value={item.reason}
                                  onChange={(e) => updateAdjustmentItem(index, 'reason', e.target.value)}
                                />
                              </div>
                              <div className="flex items-end">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => removeAdjustmentItem(index)}
                                  disabled={adjustmentItems.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold">
                        مجموع: {getAdjustmentTotal().toLocaleString("fa-IR")} تومان
                      </div>
                      <Button type="submit">
                        <Save className="h-4 w-4 ml-2" />
                        ثبت تنظیم
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Adjustments List */}
          <Card>
            <CardHeader>
              <CardTitle>لیست تنظیمات انبار</CardTitle>
              <CardDescription>
                لیست تمام تنظیمات انبار ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="جستجو در تنظیمات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="DRAFT">پیش‌نویس</SelectItem>
                    <SelectItem value="POSTED">ثبت شده</SelectItem>
                    <SelectItem value="CANCELLED">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">همه انواع</SelectItem>
                    <SelectItem value="INCREASE">افزایش</SelectItem>
                    <SelectItem value="DECREASE">کاهش</SelectItem>
                    <SelectItem value="CORRECTION">تصحیح</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره تنظیم</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>نوع</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>تعداد کالا</TableHead>
                    <TableHead>مبلغ کل</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdjustments.map((adjustment) => {
                    const status = getAdjustmentStatus(adjustment.status);
                    const type = getAdjustmentType(adjustment.type);
                    return (
                      <TableRow key={adjustment.id}>
                        <TableCell className="font-medium">{adjustment.number}</TableCell>
                        <TableCell>{adjustment.date}</TableCell>
                        <TableCell>
                          <Badge variant={type.variant} className="flex items-center gap-1">
                            <type.icon className="h-3 w-3" />
                            {type.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{adjustment.description}</TableCell>
                        <TableCell>{adjustment.totalItems}</TableCell>
                        <TableCell>{adjustment.totalCost.toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {adjustment.status === "DRAFT" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => postAdjustment(adjustment.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => cancelAdjustment(adjustment.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
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

        <TabsContent value="inventory" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>موجودی انبار</CardTitle>
              <CardDescription>
                لیست کالاها و موجودی فعلی انبار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="جستجو در کالاها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کد کالا</TableHead>
                    <TableHead>نام کالا</TableHead>
                    <TableHead>دسته‌بندی</TableHead>
                    <TableHead>واحد</TableHead>
                    <TableHead>موجودی فعلی</TableHead>
                    <TableHead>حداقل موجودی</TableHead>
                    <TableHead>قیمت خرید</TableHead>
                    <TableHead>قیمت فروش</TableHead>
                    <TableHead>ارزش کل</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockProducts
                    .filter(product => 
                      product.name.includes(searchTerm) || 
                      product.code.includes(searchTerm) ||
                      product.category.includes(searchTerm)
                    )
                    .map((product) => {
                      const totalValue = product.quantity * product.purchasePrice;
                      const isLowStock = product.quantity <= product.minQuantity;
                      return (
                        <TableRow key={product.id} className={isLowStock ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">{product.code}</TableCell>
                          <TableCell>{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.unit}</TableCell>
                          <TableCell className={isLowStock ? "text-red-600 font-semibold" : ""}>
                            {product.quantity}
                          </TableCell>
                          <TableCell>{product.minQuantity}</TableCell>
                          <TableCell>{product.purchasePrice.toLocaleString("fa-IR")} تومان</TableCell>
                          <TableCell>{product.salePrice.toLocaleString("fa-IR")} تومان</TableCell>
                          <TableCell>{totalValue.toLocaleString("fa-IR")} تومان</TableCell>
                          <TableCell>
                            {isLowStock ? (
                              <Badge variant="destructive">کم موجود</Badge>
                            ) : (
                              <Badge variant="default">موجودی کافی</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>گزارشات انبار</CardTitle>
              <CardDescription>
                گزارشات تحلیلی مربوط به انبار و موجودی‌ها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">گزارش موجودی</h3>
                    <p className="text-sm text-gray-600">گزارش موجودی فعلی انبار</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">گزارش ورودی و خروجی</h3>
                    <p className="text-sm text-gray-600">تحلیل ورودی و خروجی کالاها</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="font-semibold mb-2">گزارش کم موجودی</h3>
                    <p className="text-sm text-gray-600">کالاها با موجودی کم</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}