"use client";

import { useState, useEffect } from "react";
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
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  Calculator,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Eye
} from "lucide-react";
import { toast } from "sonner";

const periodSchema = z.object({
  name: z.string().min(1, "نام دوره الزامی است"),
  startDate: z.string().min(1, "تاریخ شروع الزامی است"),
  endDate: z.string().min(1, "تاریخ پایان الزامی است"),
});

const closingSchema = z.object({
  closingDate: z.string().min(1, "تاریخ بستن حسابها الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  confirmText: z.string().min(1, "تأیید متن الزامی است"),
});

type PeriodFormData = z.infer<typeof periodSchema>;
type ClosingFormData = z.infer<typeof closingSchema>;

interface AccountingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  createdAt: string;
  updatedAt: string;
}

interface ClosingCheckItem {
  id: string;
  name: string;
  description: string;
  category: string;
  required: boolean;
  status: "PENDING" | "COMPLETED" | "FAILED";
  errorMessage?: string;
  executedAt?: string;
  periodId?: string;
}

interface ClosingCheckResult {
  results: ClosingCheckItem[];
  summary: {
    total: number;
    completed: number;
    failed: number;
    successRate: number;
    canClose: boolean;
  };
  periodId: string;
  executedAt: string;
}

export function AccountingClosing() {
  const [activeTab, setActiveTab] = useState("periods");
  const [selectedPeriod, setSelectedPeriod] = useState<AccountingPeriod | null>(null);
  const [isClosingDialogOpen, setIsClosingDialogOpen] = useState(false);
  const [closingChecks, setClosingChecks] = useState<ClosingCheckItem[]>([]);
  const [periods, setPeriods] = useState<AccountingPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunningChecks, setIsRunningChecks] = useState(false);
  const [lastCheckResult, setLastCheckResult] = useState<ClosingCheckResult | null>(null);

  const periodForm = useForm<PeriodFormData>({
    resolver: zodResolver(periodSchema),
    defaultValues: {
      name: "",
      startDate: "",
      endDate: "",
    },
  });

  const closingForm = useForm<ClosingFormData>({
    resolver: zodResolver(closingSchema),
    defaultValues: {
      closingDate: new Date().toISOString().split('T')[0],
      description: "",
      confirmText: "",
    },
  });

  // Fetch accounting periods on component mount
  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await fetch('/api/accounting-periods');
      if (response.ok) {
        const data = await response.json();
        setPeriods(data);
      } else {
        toast.error("خطا در دریافت دوره‌های حسابداری");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const onPeriodSubmit = async (data: PeriodFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/accounting-periods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("دوره حسابداری با موفقیت ایجاد شد");
        periodForm.reset();
        fetchPeriods();
      } else {
        const error = await response.json();
        toast.error(error.error || "خطا در ایجاد دوره حسابداری");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const onClosingSubmit = async (data: ClosingFormData) => {
    if (!selectedPeriod) return;

    if (data.confirmText !== "بستن حسابها") {
      toast.error("متن تأیید صحیح نیست");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/accounting-periods/${selectedPeriod.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closingDate: data.closingDate,
          description: data.description,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success("حسابها با موفقیت بسته شد");
        setIsClosingDialogOpen(false);
        closingForm.reset();
        fetchPeriods();
        setLastCheckResult(null);
      } else {
        const error = await response.json();
        if (error.failedChecks) {
          toast.error("برخی بررسی‌ها با خطا مواجه شدند");
          setClosingChecks(error.failedChecks);
        } else {
          toast.error(error.error || "خطا در بستن حسابها");
        }
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsLoading(false);
    }
  };

  const runClosingChecks = async () => {
    if (!selectedPeriod) {
      toast.error("لطفاً یک دوره حسابداری را انتخاب کنید");
      return;
    }

    setIsRunningChecks(true);
    try {
      const response = await fetch('/api/closing-checks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          periodId: selectedPeriod.id,
        }),
      });

      if (response.ok) {
        const result: ClosingCheckResult = await response.json();
        setClosingChecks(result.results);
        setLastCheckResult(result);
        
        if (result.summary.canClose) {
          toast.success(`تمام بررسی‌ها با موفقیت انجام شد (${result.summary.successRate}%)`);
        } else {
          toast.error(`برخی بررسی‌ها با خطا مواجه شدند (${result.summary.successRate}%)`);
        }
      } else {
        const error = await response.json();
        toast.error(error.error || "خطا در اجرای بررسی‌ها");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setIsRunningChecks(false);
    }
  };

  const closePeriod = (period: AccountingPeriod) => {
    setSelectedPeriod(period);
    setIsClosingDialogOpen(true);
  };

  const getPeriodStatus = (period: AccountingPeriod) => {
    if (period.isClosed) {
      return { label: "بسته شده", variant: "default" as const, icon: Lock };
    } else {
      return { label: "باز", variant: "secondary" as const, icon: Unlock };
    }
  };

  const getCheckStatus = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return { label: "تکمیل شده", variant: "default" as const, icon: CheckCircle };
      case "FAILED":
        return { label: "خطا", variant: "destructive" as const, icon: XCircle };
      default:
        return { label: "در انتظار", variant: "secondary" as const, icon: Clock };
    }
  };

  const allChecksCompleted = closingChecks.every(check => check.status === "COMPLETED");
  const hasFailedChecks = closingChecks.some(check => check.status === "FAILED");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('fa-IR') + " تومان";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="periods">دوره‌های حسابداری</TabsTrigger>
          <TabsTrigger value="closing">بستن حسابها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات اختتامیه</TabsTrigger>
        </TabsList>

        <TabsContent value="periods" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                ایجاد دوره حسابداری جدید
              </CardTitle>
              <CardDescription>
                اطلاعات دوره حسابداری جدید را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...periodForm}>
                <form onSubmit={periodForm.handleSubmit(onPeriodSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={periodForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام دوره</FormLabel>
                          <FormControl>
                            <Input placeholder="دی ماه ۱۴۰۳" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={periodForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ شروع</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={periodForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ پایان</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 ml-2" />
                    )}
                    {isLoading ? "در حال ایجاد..." : "ایجاد دوره"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>لیست دوره‌های حسابداری</CardTitle>
              <CardDescription>
                لیست تمام دوره‌های حسابداری ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام دوره</TableHead>
                    <TableHead>تاریخ شروع</TableHead>
                    <TableHead>تاریخ پایان</TableHead>
                    <TableHead>درآمد کل</TableHead>
                    <TableHead>هزینه کل</TableHead>
                    <TableHead>سود/زیان</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {periods.map((period) => {
                    const status = getPeriodStatus(period);
                    return (
                      <TableRow key={period.id}>
                        <TableCell className="font-medium">{period.name}</TableCell>
                        <TableCell>{formatDate(period.startDate)}</TableCell>
                        <TableCell>{formatDate(period.endDate)}</TableCell>
                        <TableCell className="text-green-600">
                          {formatCurrency(period.totalRevenue)}
                        </TableCell>
                        <TableCell className="text-red-600">
                          {formatCurrency(period.totalExpenses)}
                        </TableCell>
                        <TableCell className={period.netIncome >= 0 ? "text-green-600" : "text-red-600"}>
                          {formatCurrency(Math.abs(period.netIncome))}
                          {period.netIncome >= 0 ? (
                            <TrendingUp className="h-4 w-4 inline mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 inline mr-1" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!period.isClosed && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => closePeriod(period)}
                              >
                                <Lock className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <FileText className="h-4 w-4" />
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

        <TabsContent value="closing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                بررسی‌های بستن حسابها
              </CardTitle>
              <CardDescription>
                قبل از بستن حسابها، بررسی‌های لازم را انجام دهید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Period Selection */}
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium">دوره حسابداری:</label>
                  <Select 
                    value={selectedPeriod?.id || ""} 
                    onValueChange={(value) => {
                      const period = periods.find(p => p.id === value);
                      setSelectedPeriod(period || null);
                      setClosingChecks([]);
                      setLastCheckResult(null);
                    }}
                  >
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="دوره حسابداری را انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.filter(p => !p.isClosed).map((period) => (
                        <SelectItem key={period.id} value={period.id}>
                          {period.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedPeriod && (
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">
                        {lastCheckResult ? (
                          <span>وضعیت بررسی‌ها: {lastCheckResult.summary.completed} از {lastCheckResult.summary.total} ({lastCheckResult.summary.successRate}%)</span>
                        ) : closingChecks.length > 0 ? (
                          <span>وضعیت بررسی‌ها: {closingChecks.filter(c => c.status === "COMPLETED").length} از {closingChecks.length}</span>
                        ) : (
                          <span>برای شروع بررسی‌ها روی دکمه اجرا کلیک کنید</span>
                        )}
                      </p>
                    </div>
                    <Button 
                      onClick={runClosingChecks} 
                      disabled={isRunningChecks || closingChecks.some(c => c.status !== "PENDING")}
                      className="flex items-center gap-2"
                    >
                      {isRunningChecks ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Calculator className="h-4 w-4" />
                      )}
                      {isRunningChecks ? "در حال اجرا..." : "اجرا کردن بررسی‌ها"}
                    </Button>
                  </div>
                )}

                {lastCheckResult && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">{lastCheckResult.summary.total}</div>
                        <p className="text-sm text-gray-600">کل بررسی‌ها</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">{lastCheckResult.summary.completed}</div>
                        <p className="text-sm text-gray-600">موفق</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{lastCheckResult.summary.failed}</div>
                        <p className="text-sm text-gray-600">خطا</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-purple-600">{lastCheckResult.summary.successRate}%</div>
                        <p className="text-sm text-gray-600">درصد موفقیت</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {closingChecks.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {closingChecks.map((check) => {
                      const status = getCheckStatus(check.status);
                      return (
                        <Card key={check.id} className={check.status === "FAILED" ? "border-red-200" : ""}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <status.icon className={`h-4 w-4 ${
                                  check.status === "COMPLETED" ? "text-green-500" :
                                  check.status === "FAILED" ? "text-red-500" : "text-gray-400"
                                }`} />
                                <span className="font-medium">{check.name}</span>
                                {check.required && (
                                  <Badge variant="outline" className="text-xs">
                                    الزامی
                                  </Badge>
                                )}
                              </div>
                              <Badge variant={status.variant}>
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{check.description}</p>
                            {check.errorMessage && (
                              <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>خطا</AlertTitle>
                                <AlertDescription>{check.errorMessage}</AlertDescription>
                              </Alert>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {lastCheckResult?.summary.canClose && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertTitle>آماده برای بستن حسابها</AlertTitle>
                    <AlertDescription>
                      تمام بررسی‌ها با موفقیت انجام شد. اکنون می‌توانید حسابها را ببندید.
                    </AlertDescription>
                    <Button 
                      className="mt-2" 
                      onClick={() => closePeriod(selectedPeriod)}
                    >
                      <Lock className="h-4 w-4 ml-2" />
                      بستن حسابها
                    </Button>
                  </Alert>
                )}

                {lastCheckResult && !lastCheckResult.summary.canClose && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertTitle>خطا در بررسی‌ها</AlertTitle>
                    <AlertDescription>
                      برخی از بررسی‌ها با خطا مواجه شدند. لطفاً خطاها را برطرف کرده و دوباره تلاش کنید.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                گزارشات اختتامیه
              </CardTitle>
              <CardDescription>
                گزارشات مالی مربوط به اختتامیه حسابها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">ترازنامه</h3>
                    <p className="text-sm text-gray-600">گزارش وضعیت مالی شرکت</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">صورت سود و زیان</h3>
                    <p className="text-sm text-gray-600">گزارش عملکرد مالی</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="font-semibold mb-2">صورت جریان وجوه نقد</h3>
                    <p className="text-sm text-gray-600">گزارش جریان نقدینگی</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Closing Dialog */}
      <Dialog open={isClosingDialogOpen} onOpenChange={setIsClosingDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              بستن حسابها
            </DialogTitle>
            <DialogDescription>
              دوره {selectedPeriod?.name} را ببندید. این عمل غیرقابل بازگشت است.
            </DialogDescription>
          </DialogHeader>
          <Form {...closingForm}>
            <form onSubmit={closingForm.handleSubmit(onClosingSubmit)} className="space-y-4">
              <FormField
                control={closingForm.control}
                name="closingDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ بستن حسابها</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={closingForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="توضیحات مربوط به بستن حسابها..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={closingForm.control}
                name="confirmText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تأیید نهایی</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="برای تأیید عبارت 'بستن حسابها' را تایپ کنید"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Lock className="h-4 w-4 ml-2" />
                  )}
                  {isLoading ? "در حال بستن..." : "بستن حسابها"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsClosingDialogOpen(false)}
                  disabled={isLoading}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}