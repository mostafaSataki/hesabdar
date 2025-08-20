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
  Building2,
  Calendar,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CreditCard,
  ArrowRightLeft
} from "lucide-react";
import { toast } from "sonner";

const reconciliationSchema = z.object({
  bankAccountId: z.string().min(1, "حساب بانکی الزامی است"),
  statementDate: z.string().min(1, "تاریخ صورت حساب الزامی است"),
  statementBalance: z.string().min(1, "مانده صورت حساب الزامی است"),
  systemBalance: z.string().min(1, "مانده سیستم الزامی است"),
  description: z.string().optional(),
});

const discrepancySchema = z.object({
  amount: z.string().min(1, "مبلغ مغایرت الزامی است"),
  type: z.string().min(1, "نوع مغایرت الزامی است"),
  description: z.string().min(1, "توضیحات مغایرت الزامی است"),
  resolution: z.string().optional(),
});

type ReconciliationFormData = z.infer<typeof reconciliationSchema>;
type DiscrepancyFormData = z.infer<typeof discrepancySchema>;

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  balance: number;
}

interface BankReconciliation {
  id: string;
  bankAccountId: string;
  bankName: string;
  accountNumber: string;
  statementDate: string;
  statementBalance: number;
  systemBalance: number;
  difference: number;
  status: "PENDING" | "COMPLETED" | "CANCELLED";
  description?: string;
  reconciledAt?: string;
  discrepancies: BankDiscrepancy[];
}

interface BankDiscrepancy {
  id: string;
  amount: number;
  type: "MISSING_TRANSACTION" | "DUPLICATE_TRANSACTION" | "AMOUNT_DIFFERENCE" | "DATE_DIFFERENCE" | "OTHER";
  description: string;
  resolution?: string;
  status: "OPEN" | "RESOLVED" | "IGNORED";
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: "DEBIT" | "CREDIT";
  status: "MATCHED" | "UNMATCHED" | "DISCREPANCY";
}

const mockBankAccounts: BankAccount[] = [
  { id: "1", accountNumber: "1234-5678-9012-3456", bankName: "بانک ملت", branchName: "شعبه مرکزی", balance: 50000000 },
  { id: "2", accountNumber: "9876-5432-1098-7654", bankName: "بانک ملی", branchName: "شعبه ولیعصر", balance: 30000000 },
  { id: "3", accountNumber: "5555-6666-7777-8888", bankName: "بانک تجارت", branchName: "شعبه آزادی", balance: 20000000 },
];

const mockReconciliations: BankReconciliation[] = [
  {
    id: "1",
    bankAccountId: "1",
    bankName: "بانک ملت",
    accountNumber: "1234-5678-9012-3456",
    statementDate: "1403/12/01",
    statementBalance: 48500000,
    systemBalance: 50000000,
    difference: -1500000,
    status: "PENDING",
    description: "مغایرت در تراکنش‌های روز آخر",
    discrepancies: [
      {
        id: "1",
        amount: 1000000,
        type: "MISSING_TRANSACTION",
        description: "تراکنش واریز به حساب در سیستم ثبت نشده",
        status: "OPEN",
      },
      {
        id: "2",
        amount: 500000,
        type: "AMOUNT_DIFFERENCE",
        description: "تفاوت مبلغ در تراکنش خرید",
        status: "OPEN",
      },
    ],
  },
  {
    id: "2",
    bankAccountId: "2",
    bankName: "بانک ملی",
    accountNumber: "9876-5432-1098-7654",
    statementDate: "1403/11/30",
    statementBalance: 29500000,
    systemBalance: 29500000,
    difference: 0,
    status: "COMPLETED",
    reconciledAt: "1403/12/02",
    discrepancies: [],
  },
];

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "1403/12/01",
    description: "واریز از مشتری الف",
    amount: 5000000,
    type: "CREDIT",
    status: "MATCHED",
  },
  {
    id: "2",
    date: "1403/12/01",
    description: "پرداخت به تأمین‌کننده ب",
    amount: 3000000,
    type: "DEBIT",
    status: "MATCHED",
  },
  {
    id: "3",
    date: "1403/12/01",
    description: "کارمزد بانکی",
    amount: 50000,
    type: "DEBIT",
    status: "UNMATCHED",
  },
  {
    id: "4",
    date: "1403/12/01",
    description: "واریز از فروشگاه ج",
    amount: 2000000,
    type: "CREDIT",
    status: "DISCREPANCY",
  },
];

export function BankReconciliation() {
  const [activeTab, setActiveTab] = useState("reconciliation");
  const [selectedReconciliation, setSelectedReconciliation] = useState<BankReconciliation | null>(null);
  const [isReconciliationDialogOpen, setIsReconciliationDialogOpen] = useState(false);
  const [isDiscrepancyDialogOpen, setIsDiscrepancyDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const reconciliationForm = useForm<ReconciliationFormData>({
    resolver: zodResolver(reconciliationSchema),
    defaultValues: {
      bankAccountId: "",
      statementDate: new Date().toISOString().split('T')[0],
      statementBalance: "",
      systemBalance: "",
      description: "",
    },
  });

  const discrepancyForm = useForm<DiscrepancyFormData>({
    resolver: zodResolver(discrepancySchema),
    defaultValues: {
      amount: "",
      type: "",
      description: "",
      resolution: "",
    },
  });

  const onReconciliationSubmit = (data: ReconciliationFormData) => {
    const statementBalance = parseFloat(data.statementBalance);
    const systemBalance = parseFloat(data.systemBalance);
    const difference = statementBalance - systemBalance;

    console.log("Reconciliation Data:", { ...data, difference });
    toast.success("عملیات reconcile با موفقیت آغاز شد");
    setIsReconciliationDialogOpen(false);
    reconciliationForm.reset();
  };

  const onDiscrepancySubmit = (data: DiscrepancyFormData) => {
    console.log("Discrepancy Data:", data);
    toast.success("مغایرت با موفقیت ثبت شد");
    setIsDiscrepancyDialogOpen(false);
    discrepancyForm.reset();
  };

  const completeReconciliation = (reconciliationId: string) => {
    toast.success("عملیات reconcile با موفقیت تکمیل شد");
  };

  const openDiscrepancyDialog = () => {
    setIsDiscrepancyDialogOpen(true);
  };

  const getReconciliationStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "در انتظار", variant: "secondary" as const, icon: Clock };
      case "COMPLETED":
        return { label: "تکمیل شده", variant: "default" as const, icon: CheckCircle };
      case "CANCELLED":
        return { label: "لغو شده", variant: "destructive" as const, icon: XCircle };
      default:
        return { label: "نامشخص", variant: "outline" as const, icon: AlertTriangle };
    }
  };

  const getDiscrepancyType = (type: string) => {
    switch (type) {
      case "MISSING_TRANSACTION":
        return { label: "تراکنش گم شده", variant: "secondary" as const };
      case "DUPLICATE_TRANSACTION":
        return { label: "تراکنش تکراری", variant: "secondary" as const };
      case "AMOUNT_DIFFERENCE":
        return { label: "تفاوت مبلغ", variant: "secondary" as const };
      case "DATE_DIFFERENCE":
        return { label: "تفاوت تاریخ", variant: "secondary" as const };
      default:
        return { label: "سایر", variant: "outline" as const };
    }
  };

  const getDiscrepancyStatus = (status: string) => {
    switch (status) {
      case "OPEN":
        return { label: "باز", variant: "secondary" as const };
      case "RESOLVED":
        return { label: "حل شده", variant: "default" as const };
      case "IGNORED":
        return { label: "نادیده گرفته", variant: "outline" as const };
      default:
        return { label: "نامشخص", variant: "outline" as const };
    }
  };

  const filteredReconciliations = mockReconciliations.filter(rec => {
    const matchesStatus = filterStatus === "ALL" || rec.status === filterStatus;
    const matchesSearch = rec.bankName.includes(searchTerm) || 
                         rec.accountNumber.includes(searchTerm);
    
    return matchesStatus && matchesSearch;
  });

  const pendingReconciliations = filteredReconciliations.filter(rec => rec.status === "PENDING");
  const totalDiscrepancies = pendingReconciliations.reduce((sum, rec) => sum + rec.discrepancies.length, 0);
  const totalDifference = pendingReconciliations.reduce((sum, rec) => sum + Math.abs(rec.difference), 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
          <TabsTrigger value="discrepancies">مغایرت‌ها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات بانکی</TabsTrigger>
        </TabsList>

        <TabsContent value="reconciliation" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">حساب‌های بانکی</CardTitle>
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBankAccounts.length}</div>
                <p className="text-xs text-muted-foreground">
                  مجموع موجودی: {mockBankAccounts.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString("fa-IR")} تومان
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">در انتظار reconcile</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingReconciliations.length}</div>
                <p className="text-xs text-muted-foreground">
                  نیاز به بررسی دارند
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مغایرت‌ها</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalDiscrepancies}</div>
                <p className="text-xs text-muted-foreground">
                  مجموع مبلغ: {totalDifference.toLocaleString("fa-IR")} تومان
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تکمیل شده</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{filteredReconciliations.filter(r => r.status === "COMPLETED").length}</div>
                <p className="text-xs text-muted-foreground">
                  در این ماه
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Reconciliation Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                شروع عملیات reconcile جدید
              </CardTitle>
              <CardDescription>
                اطلاعات reconcile بانکی را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...reconciliationForm}>
                <form onSubmit={reconciliationForm.handleSubmit(onReconciliationSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={reconciliationForm.control}
                      name="bankAccountId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حساب بانکی</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="حساب بانکی را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockBankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.bankName} - {account.branchName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reconciliationForm.control}
                      name="statementDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ صورت حساب</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reconciliationForm.control}
                      name="statementBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مانده صورت حساب</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={reconciliationForm.control}
                      name="systemBalance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مانده سیستم</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={reconciliationForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Textarea placeholder="توضیحات مربوط به reconcile..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">
                    <RefreshCw className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    شروع reconcile
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Reconciliations List */}
          <Card>
            <CardHeader>
              <CardTitle>لیست عملیات reconcile</CardTitle>
              <CardDescription>
                لیست تمام عملیات reconcile انجام شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="جستجو در reconcileها..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 rtl:pr-10 rtl:pl-0"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="PENDING">در انتظار</SelectItem>
                    <SelectItem value="COMPLETED">تکمیل شده</SelectItem>
                    <SelectItem value="CANCELLED">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>بانک</TableHead>
                    <TableHead>شماره حساب</TableHead>
                    <TableHead>تاریخ صورت حساب</TableHead>
                    <TableHead>مانده بانک</TableHead>
                    <TableHead>مانده سیستم</TableHead>
                    <TableHead>تفاوت</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReconciliations.map((reconciliation) => {
                    const status = getReconciliationStatus(reconciliation.status);
                    return (
                      <TableRow key={reconciliation.id}>
                        <TableCell className="font-medium">{reconciliation.bankName}</TableCell>
                        <TableCell>{reconciliation.accountNumber}</TableCell>
                        <TableCell>{reconciliation.statementDate}</TableCell>
                        <TableCell>{reconciliation.statementBalance.toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell>{reconciliation.systemBalance.toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell className={reconciliation.difference !== 0 ? "text-red-600" : "text-green-600"}>
                          {Math.abs(reconciliation.difference).toLocaleString("fa-IR")} تومان
                          {reconciliation.difference !== 0 && (
                            reconciliation.difference > 0 ? (
                              <TrendingUp className="h-4 w-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                            ) : (
                              <TrendingDown className="h-4 w-4 inline mr-1 rtl:ml-1 rtl:mr-0" />
                            )
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
                            {reconciliation.status === "PENDING" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => completeReconciliation(reconciliation.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={openDiscrepancyDialog}
                                >
                                  <AlertTriangle className="h-4 w-4" />
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

        <TabsContent value="discrepancies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت مغایرت‌ها</CardTitle>
              <CardDescription>
                ثبت و پیگیری مغایرت‌های بانکی
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">
                      کل مغایرت‌ها: {totalDiscrepancies} مورد به مبلغ {totalDifference.toLocaleString("fa-IR")} تومان
                    </p>
                  </div>
                  <Button onClick={openDiscrepancyDialog}>
                    <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                    ثبت مغایرت جدید
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pendingReconciliations.flatMap(reconciliation => 
                    reconciliation.discrepancies.map(discrepancy => (
                      <Card key={discrepancy.id} className="border-orange-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-semibold">{reconciliation.bankName}</h3>
                              <p className="text-sm text-gray-600">{reconciliation.accountNumber}</p>
                            </div>
                            <div className="text-right rtl:text-left">
                              <Badge variant="outline" className="mb-1">
                                {getDiscrepancyType(discrepancy.type).label}
                              </Badge>
                              <Badge variant={getDiscrepancyStatus(discrepancy.status).variant}>
                                {getDiscrepancyStatus(discrepancy.status).label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex justify-between items-center">
                            <div className="text-sm">
                              <p className="font-medium text-red-600">
                                {discrepancy.amount.toLocaleString("fa-IR")} تومان
                              </p>
                              <p className="text-gray-600">{discrepancy.description}</p>
                            </div>
                            <Button size="sm" variant="outline">
                              پیگیری
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>گزارشات بانکی</CardTitle>
              <CardDescription>
                گزارشات تحلیلی مربوط به حساب‌های بانکی
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <ArrowRightLeft className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">گزارش reconcile</h3>
                    <p className="text-sm text-gray-600">گزارش عملیات reconcile انجام شده</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
                    <h3 className="font-semibold mb-2">گزارش مغایرت‌ها</h3>
                    <p className="text-sm text-gray-600">تحلیل مغایرت‌های بانکی</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <DollarSign className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">گردش حساب‌ها</h3>
                    <p className="text-sm text-gray-600">گزارش گردش حساب‌های بانکی</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reconciliation Dialog */}
      <Dialog open={isReconciliationDialogOpen} onOpenChange={setIsReconciliationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              شروع عملیات reconcile
            </DialogTitle>
            <DialogDescription>
              عملیات reconcile را برای تطبیق صورت حساب بانکی با سیستم آغاز کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...reconciliationForm}>
            <form onSubmit={reconciliationForm.handleSubmit(onReconciliationSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={reconciliationForm.control}
                  name="bankAccountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>حساب بانکی</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="حساب بانکی را انتخاب کنید" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {mockBankAccounts.map((account) => (
                            <SelectItem key={account.id} value={account.id}>
                              {account.bankName} - {account.branchName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reconciliationForm.control}
                  name="statementDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاریخ صورت حساب</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={reconciliationForm.control}
                  name="statementBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مانده صورت حساب بانک</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={reconciliationForm.control}
                  name="systemBalance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مانده سیستم</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="0" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={reconciliationForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea placeholder="توضیحات مربوط به reconcile..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>توجه</AlertTitle>
                <AlertDescription>
                  پس از شروع reconcile، سیستم تراکنش‌ها را به صورت خودکار بررسی کرده و مغایرت‌ها را شناسایی خواهد کرد.
                </AlertDescription>
              </Alert>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <RefreshCw className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                  شروع reconcile
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsReconciliationDialogOpen(false)}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Discrepancy Dialog */}
      <Dialog open={isDiscrepancyDialogOpen} onOpenChange={setIsDiscrepancyDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              ثبت مغایرت جدید
            </DialogTitle>
            <DialogDescription>
              اطلاعات مغایرت بانکی را ثبت کنید
            </DialogDescription>
          </DialogHeader>
          <Form {...discrepancyForm}>
            <form onSubmit={discrepancyForm.handleSubmit(onDiscrepancySubmit)} className="space-y-4">
              <FormField
                control={discrepancyForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مبلغ مغایرت</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={discrepancyForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع مغایرت</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع مغایرت را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MISSING_TRANSACTION">تراکنش گم شده</SelectItem>
                        <SelectItem value="DUPLICATE_TRANSACTION">تراکنش تکراری</SelectItem>
                        <SelectItem value="AMOUNT_DIFFERENCE">تفاوت مبلغ</SelectItem>
                        <SelectItem value="DATE_DIFFERENCE">تفاوت تاریخ</SelectItem>
                        <SelectItem value="OTHER">سایر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={discrepancyForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات مغایرت</FormLabel>
                    <FormControl>
                      <Textarea placeholder="توضیحات مربوط به مغایرت..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={discrepancyForm.control}
                name="resolution"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>راه حل (اختیاری)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="راه حل پیشنهادی برای رفع مغایرت..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                  ثبت مغایرت
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDiscrepancyDialogOpen(false)}
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