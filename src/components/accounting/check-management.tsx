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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Plus, 
  Save, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  FileText,
  CreditCard,
  Calendar,
  Banknote,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  Search,
  Filter,
  Download,
  Users,
  TrendingUp,
  TrendingDown,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";

const checkSchema = z.object({
  number: z.string().min(1, "شماره چک الزامی است"),
  amount: z.string().min(1, "مبلغ چک الزامی است"),
  date: z.string().min(1, "تاریخ صدور الزامی است"),
  dueDate: z.string().min(1, "تاریخ سررسید الزامی است"),
  type: z.string().min(1, "نوع چک الزامی است"),
  relatedParty: z.string().min(1, "طرف مقابل الزامی است"),
  bankAccountId: z.string().min(1, "حساب بانکی الزامی است"),
  description: z.string().optional(),
});

const settlementSchema = z.object({
  settlementDate: z.string().min(1, "تاریخ تسویه الزامی است"),
  settlementAmount: z.string().min(1, "مبلغ تسویه الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  status: z.string().min(1, "وضعیت تسویه الزامی است"),
});

type CheckFormData = z.infer<typeof checkSchema>;
type SettlementFormData = z.infer<typeof settlementSchema>;

interface Check {
  id: string;
  number: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "PENDING" | "CLEARED" | "BOUNCED" | "CANCELLED";
  type: "RECEIPT" | "PAYMENT";
  relatedParty: string;
  bankAccountId: string;
  bankName: string;
  branchName: string;
  description?: string;
  settlementDate?: string;
  settlementAmount?: number;
  daysUntilDue: number;
  isOverdue: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  balance: number;
}

interface CheckReport {
  type: string;
  data: any;
  generatedAt: string;
}

interface BatchSettlementData {
  checkIds: string[];
  settlementDate: string;
  description: string;
  status: "CLEARED" | "BOUNCED";
}

const mockBankAccounts: BankAccount[] = [
  { id: "1", accountNumber: "1234-5678-9012-3456", bankName: "بانک ملت", branchName: "شعبه مرکزی", balance: 50000000 },
  { id: "2", accountNumber: "9876-5432-1098-7654", bankName: "بانک ملی", branchName: "شعبه ولیعصر", balance: 30000000 },
  { id: "3", accountNumber: "5555-6666-7777-8888", bankName: "بانک تجارت", branchName: "شعبه آزادی", balance: 20000000 },
];

const mockChecks: Check[] = [
  {
    id: "1",
    number: "چک-001",
    amount: 10000000,
    date: "1403/12/01",
    dueDate: "1404/01/01",
    status: "PENDING",
    type: "RECEIPT",
    relatedParty: "شرکت الف",
    bankName: "بانک ملت",
    branchName: "شعبه مرکزی",
    description: "چک مربوط به فاکتور فروش شماره 123",
    daysUntilDue: 15,
    isOverdue: false,
  },
  {
    id: "2",
    number: "چک-002",
    amount: 5000000,
    date: "1403/12/02",
    dueDate: "1403/12/10",
    status: "CLEARED",
    type: "PAYMENT",
    relatedParty: "تأمین‌کننده الف",
    bankName: "بانک ملی",
    branchName: "شعبه ولیعصر",
    description: "پرداخت به تأمین‌کننده",
    settlementDate: "1403/12/10",
    settlementAmount: 5000000,
    daysUntilDue: -5,
    isOverdue: true,
  },
  {
    id: "3",
    number: "چک-003",
    amount: 8000000,
    date: "1403/12/03",
    dueDate: "1403/12/05",
    status: "BOUNCED",
    type: "RECEIPT",
    relatedParty: "فروشگاه ب",
    bankName: "بانک تجارت",
    branchName: "شعبه آزادی",
    description: "چک برگشتی",
    settlementDate: "1403/12/06",
    settlementAmount: 0,
    daysUntilDue: -8,
    isOverdue: true,
  },
  {
    id: "4",
    number: "چک-004",
    amount: 15000000,
    date: "1403/12/04",
    dueDate: "1404/02/01",
    status: "PENDING",
    type: "PAYMENT",
    relatedParty: "شرکت ج",
    bankName: "بانک ملت",
    branchName: "شعبه مرکزی",
    description: "پرداخت قسط",
    daysUntilDue: 45,
    isOverdue: false,
  },
];

export function CheckManagement() {
  const [activeTab, setActiveTab] = useState("checks");
  const [selectedCheck, setSelectedCheck] = useState<Check | null>(null);
  const [isSettlementDialogOpen, setIsSettlementDialogOpen] = useState(false);
  const [isBatchSettlementDialogOpen, setIsBatchSettlementDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChecks, setSelectedChecks] = useState<string[]>([]);
  const [reportData, setReportData] = useState<any>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const checkForm = useForm<CheckFormData>({
    resolver: zodResolver(checkSchema),
    defaultValues: {
      number: "",
      amount: "",
      date: new Date().toISOString().split('T')[0],
      dueDate: "",
      type: "RECEIPT",
      relatedParty: "",
      bankAccountId: "",
      description: "",
    },
  });

  const settlementForm = useForm<SettlementFormData>({
    resolver: zodResolver(settlementSchema),
    defaultValues: {
      settlementDate: new Date().toISOString().split('T')[0],
      settlementAmount: "",
      description: "",
      status: "CLEARED",
    },
  });

  const batchSettlementForm = useForm({
    defaultValues: {
      settlementDate: new Date().toISOString().split('T')[0],
      description: "",
      status: "CLEARED",
    },
  });

  const onCheckSubmit = (data: CheckFormData) => {
    console.log("Check Data:", data);
    toast.success("چک با موفقیت ثبت شد");
    checkForm.reset();
  };

  const onSettlementSubmit = (data: SettlementFormData) => {
    if (!selectedCheck) return;
    
    console.log("Settlement Data:", { ...data, checkId: selectedCheck.id });
    toast.success("تسویه چک با موفقیت انجام شد");
    setIsSettlementDialogOpen(false);
    settlementForm.reset();
    setSelectedCheck(null);
  };

  const onBatchSettlementSubmit = (data: any) => {
    if (selectedChecks.length === 0) {
      toast.error("هیچ چکی برای تسویه انتخاب نشده است");
      return;
    }

    console.log("Batch Settlement Data:", { ...data, checkIds: selectedChecks });
    toast.success(`${selectedChecks.length} چک با موفقیت تسویه شدند`);
    setIsBatchSettlementDialogOpen(false);
    batchSettlementForm.reset();
    setSelectedChecks([]);
  };

  const openBatchSettlementDialog = () => {
    if (selectedChecks.length === 0) {
      toast.error("لطفاً ابتدا چک‌هایی را برای تسویه گروهی انتخاب کنید");
      return;
    }
    setIsBatchSettlementDialogOpen(true);
  };

  const toggleCheckSelection = (checkId: string) => {
    setSelectedChecks(prev => 
      prev.includes(checkId) 
        ? prev.filter(id => id !== checkId)
        : [...prev, checkId]
    );
  };

  const selectAllChecks = () => {
    const pendingCheckIds = filteredChecks
      .filter(check => check.status === "PENDING")
      .map(check => check.id);
    
    if (selectedChecks.length === pendingCheckIds.length) {
      setSelectedChecks([]);
    } else {
      setSelectedChecks(pendingCheckIds);
    }
  };

  const generateReport = async (reportType: string) => {
    try {
      // In a real app, this would fetch from the API
      const mockReports = {
        summary: {
          totalChecks: filteredChecks.length,
          pendingChecks: filteredChecks.filter(c => c.status === "PENDING").length,
          clearedChecks: filteredChecks.filter(c => c.status === "CLEARED").length,
          bouncedChecks: filteredChecks.filter(c => c.status === "BOUNCED").length,
          totalAmount: filteredChecks.reduce((sum, c) => sum + c.amount, 0),
          pendingAmount: filteredChecks.filter(c => c.status === "PENDING").reduce((sum, c) => sum + c.amount, 0),
        },
        aging: {
          current: filteredChecks.filter(c => c.status === "PENDING" && !c.isOverdue),
          overdue1_30: filteredChecks.filter(c => c.status === "PENDING" && c.isOverdue && c.daysUntilDue >= -30),
          overdue31_60: filteredChecks.filter(c => c.status === "PENDING" && c.isOverdue && c.daysUntilDue < -30 && c.daysUntilDue >= -60),
          overdue61_90: filteredChecks.filter(c => c.status === "PENDING" && c.isOverdue && c.daysUntilDue < -60 && c.daysUntilDue >= -90),
          overdueOver90: filteredChecks.filter(c => c.status === "PENDING" && c.isOverdue && c.daysUntilDue < -90),
        },
        cashflow: {
          weekly: Array.from({ length: 12 }, (_, i) => ({
            week: i + 1,
            receipts: Math.floor(Math.random() * 10000000),
            payments: Math.floor(Math.random() * 8000000),
            net: Math.floor(Math.random() * 5000000),
          }))
        }
      };

      setReportData(mockReports[reportType as keyof typeof mockReports]);
      setIsReportDialogOpen(true);
    } catch (error) {
      toast.error("خطا در تولید گزارش");
    }
  };

  const openSettlementDialog = (check: Check) => {
    setSelectedCheck(check);
    settlementForm.setValue("settlementAmount", check.amount.toString());
    setIsSettlementDialogOpen(true);
  };

  const cancelCheck = (checkId: string) => {
    toast.success("چک با موفقیت لغو شد");
  };

  const getCheckStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "در انتظار", variant: "secondary" as const, icon: Clock };
      case "CLEARED":
        return { label: "تسویه شده", variant: "default" as const, icon: CheckCircle };
      case "BOUNCED":
        return { label: "برگشتی", variant: "destructive" as const, icon: XCircle };
      case "CANCELLED":
        return { label: "لغو شده", variant: "outline" as const, icon: XCircle };
      default:
        return { label: "نامشخص", variant: "outline" as const, icon: AlertTriangle };
    }
  };

  const filteredChecks = mockChecks.filter(check => {
    const matchesStatus = filterStatus === "ALL" || check.status === filterStatus;
    const matchesType = filterType === "ALL" || check.type === filterType;
    const matchesSearch = check.number.includes(searchTerm) || 
                         check.relatedParty.includes(searchTerm) ||
                         check.description?.includes(searchTerm) || false;
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalPendingAmount = filteredChecks
    .filter(check => check.status === "PENDING")
    .reduce((sum, check) => sum + check.amount, 0);

  const overdueChecks = filteredChecks.filter(check => check.isOverdue && check.status === "PENDING");
  const totalOverdueAmount = overdueChecks.reduce((sum, check) => sum + check.amount, 0);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="checks">مدیریت چک‌ها</TabsTrigger>
          <TabsTrigger value="settlement">تسویه چک‌ها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات چک‌ها</TabsTrigger>
        </TabsList>

        <TabsContent value="checks" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل چک‌ها</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredChecks.length}</div>
                <p className="text-xs text-muted-foreground">
                  {filteredChecks.filter(c => c.type === "RECEIPT").length} دریافت / {filteredChecks.filter(c => c.type === "PAYMENT").length} پرداخت
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">در انتظار تسویه</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredChecks.filter(c => c.status === "PENDING").length}</div>
                <p className="text-xs text-muted-foreground">
                  مبلغ کل: {totalPendingAmount.toLocaleString("fa-IR")} تومان
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">چک‌های سررسید گذشته</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{overdueChecks.length}</div>
                <p className="text-xs text-muted-foreground">
                  مبلغ: {totalOverdueAmount.toLocaleString("fa-IR")} تومان
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">چک‌های تسویه شده</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{filteredChecks.filter(c => c.status === "CLEARED").length}</div>
                <p className="text-xs text-muted-foreground">
                  در این ماه
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Check Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                ثبت چک جدید
              </CardTitle>
              <CardDescription>
                اطلاعات چک جدید را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...checkForm}>
                <form onSubmit={checkForm.handleSubmit(onCheckSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره چک</FormLabel>
                          <FormControl>
                            <Input placeholder="چک-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={checkForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مبلغ چک</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={checkForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نوع چک</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="نوع چک را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="RECEIPT">دریافتی</SelectItem>
                              <SelectItem value="PAYMENT">پرداختی</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تاریخ صدور</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={checkForm.control}
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
                    <FormField
                      control={checkForm.control}
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={checkForm.control}
                      name="relatedParty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>طرف مقابل</FormLabel>
                          <FormControl>
                            <Input placeholder="نام شخص یا شرکت" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={checkForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Textarea placeholder="توضیحات مربوط به چک..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button type="submit">
                    <Plus className="h-4 w-4 ml-2" />
                    ثبت چک
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Checks List */}
          <Card>
            <CardHeader>
              <CardTitle>لیست چک‌ها</CardTitle>
              <CardDescription>
                لیست تمام چک‌های ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="جستجو در چک‌ها..."
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
                    <SelectItem value="PENDING">در انتظار</SelectItem>
                    <SelectItem value="CLEARED">تسویه شده</SelectItem>
                    <SelectItem value="BOUNCED">برگشتی</SelectItem>
                    <SelectItem value="CANCELLED">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">همه انواع</SelectItem>
                    <SelectItem value="RECEIPT">دریافتی</SelectItem>
                    <SelectItem value="PAYMENT">پرداختی</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Batch Operations */}
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="select-all"
                    checked={selectedChecks.length === filteredChecks.filter(c => c.status === "PENDING").length && filteredChecks.filter(c => c.status === "PENDING").length > 0}
                    onCheckedChange={selectAllChecks}
                  />
                  <label htmlFor="select-all" className="text-sm font-medium">
                    انتخاب همه ({selectedChecks.length} چک انتخاب شده)
                  </label>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openBatchSettlementDialog}
                    disabled={selectedChecks.length === 0}
                  >
                    <RefreshCw className="h-4 w-4 ml-2" />
                    تسویه گروهی
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedChecks([])}
                    disabled={selectedChecks.length === 0}
                  >
                    پاک کردن انتخاب
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectedChecks.length === filteredChecks.filter(c => c.status === "PENDING").length && filteredChecks.filter(c => c.status === "PENDING").length > 0}
                        onCheckedChange={selectAllChecks}
                      />
                    </TableHead>
                    <TableHead>شماره چک</TableHead>
                    <TableHead>مبلغ</TableHead>
                    <TableHead>تاریخ سررسید</TableHead>
                    <TableHead>طرف مقابل</TableHead>
                    <TableHead>بانک</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChecks.map((check) => {
                    const status = getCheckStatus(check.status);
                    return (
                      <TableRow key={check.id} className={check.isOverdue && check.status === "PENDING" ? "bg-red-50" : ""}>
                        <TableCell>
                          {check.status === "PENDING" && (
                            <Checkbox
                              checked={selectedChecks.includes(check.id)}
                              onCheckedChange={() => toggleCheckSelection(check.id)}
                            />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{check.number}</TableCell>
                        <TableCell className={check.type === "RECEIPT" ? "text-green-600" : "text-red-600"}>
                          {check.amount.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{check.dueDate}</span>
                            {check.isOverdue && check.status === "PENDING" && (
                              <Badge variant="destructive" className="text-xs">
                                سررسید گذشته
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{check.relatedParty}</TableCell>
                        <TableCell>{check.bankName}</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {check.status === "PENDING" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => openSettlementDialog(check)}
                                >
                                  <RefreshCw className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => cancelCheck(check.id)}
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

        <TabsContent value="settlement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>تسویه چک‌ها</CardTitle>
              <CardDescription>
                عملیات تسویه چک‌های در انتظار
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>توجه</AlertTitle>
                  <AlertDescription>
                    قبل از تسویه چک، از وجود موجودی کافی در حساب بانکی اطمینان حاصل کنید.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredChecks.filter(check => check.status === "PENDING").map((check) => (
                    <Card key={check.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{check.number}</h3>
                            <p className="text-sm text-gray-600">{check.relatedParty}</p>
                          </div>
                          <Badge variant="secondary">
                            {check.amount.toLocaleString("fa-IR")} تومان
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            <p>سررسید: {check.dueDate}</p>
                            <p>{check.bankName}</p>
                          </div>
                          <Button 
                            size="sm"
                            onClick={() => openSettlementDialog(check)}
                          >
                            تسویه
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>گزارشات چک‌ها</CardTitle>
              <CardDescription>
                گزارشات تحلیلی مربوط به چک‌ها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => generateReport('summary')}
                >
                  <CardContent className="p-6 text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">گزارش خلاصه</h3>
                    <p className="text-sm text-gray-600">خلاصه وضعیت چک‌ها</p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => generateReport('aging')}
                >
                  <CardContent className="p-6 text-center">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="font-semibold mb-2">گزارش سررسیدی</h3>
                    <p className="text-sm text-gray-600">تحلیل چک‌های سررسید شده</p>
                  </CardContent>
                </Card>
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => generateReport('cashflow')}
                >
                  <CardContent className="p-6 text-center">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">پیش‌بینی جریان نقدی</h3>
                    <p className="text-sm text-gray-600">پیش‌بینی دریافت‌ها و پرداخت‌ها</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Download className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                    <h3 className="font-semibold mb-2">خروجی اکسل</h3>
                    <p className="text-sm text-gray-600">دریافت فایل اکسل گزارشات</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">کل چک‌ها</p>
                        <p className="text-2xl font-bold">{filteredChecks.length}</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">در انتظار</p>
                        <p className="text-2xl font-bold text-yellow-600">
                          {filteredChecks.filter(c => c.status === "PENDING").length}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-yellow-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">تسویه شده</p>
                        <p className="text-2xl font-bold text-green-600">
                          {filteredChecks.filter(c => c.status === "CLEARED").length}
                        </p>
                      </div>
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">برگشتی</p>
                        <p className="text-2xl font-bold text-red-600">
                          {filteredChecks.filter(c => c.status === "BOUNCED").length}
                        </p>
                      </div>
                      <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Settlement Dialog */}
      <Dialog open={isSettlementDialogOpen} onOpenChange={setIsSettlementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              تسویه چک
            </DialogTitle>
            <DialogDescription>
              تسویه چک {selectedCheck?.number} به مبلغ {selectedCheck?.amount.toLocaleString("fa-IR")} تومان
            </DialogDescription>
          </DialogHeader>
          <Form {...settlementForm}>
            <form onSubmit={settlementForm.handleSubmit(onSettlementSubmit)} className="space-y-4">
              <FormField
                control={settlementForm.control}
                name="settlementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ تسویه</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={settlementForm.control}
                name="settlementAmount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مبلغ تسویه</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={settlementForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت تسویه</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="وضعیت تسویه را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CLEARED">تسویه شده</SelectItem>
                        <SelectItem value="BOUNCED">برگشتی</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={settlementForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="توضیحات مربوط به تسویه چک..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تسویه چک
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsSettlementDialogOpen(false)}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Batch Settlement Dialog */}
      <Dialog open={isBatchSettlementDialogOpen} onOpenChange={setIsBatchSettlementDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              تسویه گروهی چک‌ها
            </DialogTitle>
            <DialogDescription>
              تسویه {selectedChecks.length} چک به صورت گروهی
            </DialogDescription>
          </DialogHeader>
          <Form {...batchSettlementForm}>
            <form onSubmit={batchSettlementForm.handleSubmit(onBatchSettlementSubmit)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">چک‌های انتخاب شده:</label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedChecks.map(checkId => {
                    const check = filteredChecks.find(c => c.id === checkId);
                    return check ? (
                      <div key={checkId} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                        <span>{check.number}</span>
                        <span className="font-medium">{check.amount.toLocaleString("fa-IR")} تومان</span>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
              
              <FormField
                control={batchSettlementForm.control}
                name="settlementDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ تسویه</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={batchSettlementForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت تسویه</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="وضعیت تسویه را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="CLEARED">تسویه شده</SelectItem>
                        <SelectItem value="BOUNCED">برگشتی</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={batchSettlementForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="توضیحات مربوط به تسویه گروهی..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  <RefreshCw className="h-4 w-4 ml-2" />
                  تسویه {selectedChecks.length} چک
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsBatchSettlementDialogOpen(false)}
                >
                  انصراف
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              گزارش تحلیلی
            </DialogTitle>
            <DialogDescription>
              گزارش تولید شده در تاریخ {new Date().toLocaleDateString("fa-IR")}
            </DialogDescription>
          </DialogHeader>
          
          {reportData && (
            <div className="space-y-6">
              {reportData.totalChecks !== undefined && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">کل چک‌ها</p>
                      <p className="text-2xl font-bold">{reportData.totalChecks}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">در انتظار</p>
                      <p className="text-2xl font-bold text-yellow-600">{reportData.pendingChecks}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <p className="text-sm text-gray-600">مبلغ کل</p>
                      <p className="text-2xl font-bold">{reportData.totalAmount?.toLocaleString("fa-IR")} تومان</p>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {reportData.buckets && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">گزارش سررسیدی</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-green-50 rounded">
                          <p className="text-sm text-green-600">جاری</p>
                          <p className="font-bold">{reportData.buckets.current?.count} چک</p>
                          <p className="text-sm">{reportData.buckets.current?.amount?.toLocaleString("fa-IR")} تومان</p>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded">
                          <p className="text-sm text-yellow-600">1-30 روز سررسید گذشته</p>
                          <p className="font-bold">{reportData.buckets.days1_30?.count} چک</p>
                          <p className="text-sm">{reportData.buckets.days1_30?.amount?.toLocaleString("fa-IR")} تومان</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {reportData.weekly && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">پیش‌بینی جریان نقدی هفتگی</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {reportData.weekly.map((week: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <span>هفته {week.week}</span>
                          <div className="flex gap-4">
                            <span className="text-green-600">دریافت: {week.receipts?.toLocaleString("fa-IR")}</span>
                            <span className="text-red-600">پرداخت: {week.payments?.toLocaleString("fa-IR")}</span>
                            <span className="font-medium">خالص: {week.net?.toLocaleString("fa-IR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 ml-2" />
                  دانلود PDF
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 ml-2" />
                  دانلود اکسل
                </Button>
                <Button onClick={() => setIsReportDialogOpen(false)}>
                  بستن
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}