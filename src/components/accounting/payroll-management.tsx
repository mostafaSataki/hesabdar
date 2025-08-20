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
  UserCheck,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Calculator,
  Calendar,
  DollarSign,
  Users,
  Briefcase,
  Award,
  Plane
} from "lucide-react";
import { toast } from "sonner";

const payrollSchema = z.object({
  employeeId: z.string().min(1, "کارمند الزامی است"),
  periodId: z.string().min(1, "دوره پرداخت الزامی است"),
  basicSalary: z.string().min(1, "حقوق پایه الزامی است"),
  allowances: z.string().min(1, "حقوق و مزایا الزامی است"),
  deductions: z.string().min(1, "کسورات الزامی است"),
  bonuses: z.string().min(1, "پاداش‌ها الزامی است"),
  leaveDays: z.string().min(1, "روزهای مرخصی الزامی است"),
  leaveDeduction: z.string().min(1, "کسورات مرخصی الزامی است"),
  description: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface Employee {
  id: string;
  code: string;
  name: string;
  position: string;
  department: string;
  basicSalary: number;
  hireDate: string;
  isActive: boolean;
}

interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

interface PayrollRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  position: string;
  periodName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  bonuses: number;
  leaveDays: number;
  leaveDeduction: number;
  netSalary: number;
  status: "DRAFT" | "APPROVED" | "PAID" | "CANCELLED";
  paymentDate?: string;
  description?: string;
  createdAt: string;
}

interface LeaveRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: "CASUAL" | "SICK" | "ANNUAL" | "UNPAID";
  startDate: string;
  endDate: string;
  days: number;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reason: string;
}

const mockEmployees: Employee[] = [
  { id: "1", code: "EMP001", name: "علی رضایی", position: "برنامه‌نویس", department: "فنی", basicSalary: 8000000, hireDate: "1400/01/15", isActive: true },
  { id: "2", code: "EMP002", name: "مریم احمدی", position: "حسابدار", department: "مالی", basicSalary: 7000000, hireDate: "1399/05/20", isActive: true },
  { id: "3", code: "EMP003", name: "رضا محمدی", position: "مدیر فروش", department: "فروش", basicSalary: 10000000, hireDate: "1398/11/10", isActive: true },
  { id: "4", code: "EMP004", name: "سارا حسینی", position: "منابع انسانی", department: "اداری", basicSalary: 6000000, hireDate: "1401/03/05", isActive: true },
  { id: "5", code: "EMP005", name: "محمد تقوی", position: "تحلیلگر سیستم", department: "فنی", basicSalary: 9000000, hireDate: "1400/08/12", isActive: true },
];

const mockPeriods: PayrollPeriod[] = [
  { id: "1", name: "دی ماه 1403", startDate: "1403/12/01", endDate: "1403/12/30", isClosed: false },
  { id: "2", name: "بهمن ماه 1403", startDate: "1403/11/01", endDate: "1403/11/30", isClosed: true },
  { id: "3", name: "آبان ماه 1403", startDate: "1403/08/01", endDate: "1403/08/30", isClosed: true },
];

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "علی رضایی",
    position: "برنامه‌نویس",
    periodName: "دی ماه 1403",
    basicSalary: 8000000,
    allowances: 2000000,
    deductions: 500000,
    bonuses: 1000000,
    leaveDays: 2,
    leaveDeduction: 400000,
    netSalary: 10100000,
    status: "DRAFT",
    createdAt: "1403/12/01",
  },
  {
    id: "2",
    employeeId: "2",
    employeeName: "مریم احمدی",
    position: "حسابدار",
    periodName: "دی ماه 1403",
    basicSalary: 7000000,
    allowances: 1500000,
    deductions: 300000,
    bonuses: 500000,
    leaveDays: 0,
    leaveDeduction: 0,
    netSalary: 8700000,
    status: "APPROVED",
    createdAt: "1403/12/01",
  },
  {
    id: "3",
    employeeId: "3",
    employeeName: "رضا محمدی",
    position: "مدیر فروش",
    periodName: "بهمن ماه 1403",
    basicSalary: 10000000,
    allowances: 3000000,
    deductions: 800000,
    bonuses: 2000000,
    leaveDays: 1,
    leaveDeduction: 350000,
    netSalary: 13850000,
    status: "PAID",
    paymentDate: "1403/12/05",
    createdAt: "1403/11/01",
  },
];

const mockLeaveRecords: LeaveRecord[] = [
  {
    id: "1",
    employeeId: "1",
    employeeName: "علی رضایی",
    leaveType: "CASUAL",
    startDate: "1403/12/10",
    endDate: "1403/12/11",
    days: 2,
    status: "APPROVED",
    reason: "مرخصی استعلاجی",
  },
  {
    id: "2",
    employeeId: "4",
    employeeName: "سارا حسینی",
    leaveType: "SICK",
    startDate: "1403/12/05",
    endDate: "1403/12/06",
    days: 2,
    status: "APPROVED",
    reason: "بیماری",
  },
  {
    id: "3",
    employeeId: "2",
    employeeName: "مریم احمدی",
    leaveType: "ANNUAL",
    startDate: "1403/12/15",
    endDate: "1403/12/17",
    days: 3,
    status: "PENDING",
    reason: "مسافرت",
  },
];

export function PayrollManagement() {
  const [activeTab, setActiveTab] = useState("payroll");
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);
  const [isPayrollDialogOpen, setIsPayrollDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterPeriod, setFilterPeriod] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const payrollForm = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employeeId: "",
      periodId: "",
      basicSalary: "",
      allowances: "0",
      deductions: "0",
      bonuses: "0",
      leaveDays: "0",
      leaveDeduction: "0",
      description: "",
    },
  });

  const onPayrollSubmit = (data: PayrollFormData) => {
    const basicSalary = parseFloat(data.basicSalary);
    const allowances = parseFloat(data.allowances);
    const deductions = parseFloat(data.deductions);
    const bonuses = parseFloat(data.bonuses);
    const leaveDeduction = parseFloat(data.leaveDeduction);
    const netSalary = basicSalary + allowances + bonuses - deductions - leaveDeduction;

    console.log("Payroll Data:", { ...data, netSalary });
    toast.success("فیش حقوقی با موفقیت ثبت شد");
    setIsPayrollDialogOpen(false);
    payrollForm.reset();
  };

  const approvePayroll = (payrollId: string) => {
    toast.success("فیش حقوقی با موفقیت تأیید شد");
  };

  const payPayroll = (payrollId: string) => {
    toast.success("فیش حقوقی با موفقیت پرداخت شد");
  };

  const cancelPayroll = (payrollId: string) => {
    toast.success("فیش حقوقی با موفقیت لغو شد");
  };

  const getPayrollStatus = (status: string) => {
    switch (status) {
      case "DRAFT":
        return { label: "پیش‌نویس", variant: "secondary" as const, icon: FileText };
      case "APPROVED":
        return { label: "تأیید شده", variant: "default" as const, icon: CheckCircle };
      case "PAID":
        return { label: "پرداخت شده", variant: "default" as const, icon: DollarSign };
      case "CANCELLED":
        return { label: "لغو شده", variant: "destructive" as const, icon: XCircle };
      default:
        return { label: "نامشخص", variant: "outline" as const, icon: AlertTriangle };
    }
  };

  const getLeaveType = (type: string) => {
    switch (type) {
      case "CASUAL":
        return { label: "استعلاجی", variant: "secondary" as const };
      case "SICK":
        return { label: "بیماری", variant: "destructive" as const };
      case "ANNUAL":
        return { label: "سالانه", variant: "default" as const };
      case "UNPAID":
        return { label: "بدون حقوق", variant: "outline" as const };
      default:
        return { label: "نامشخص", variant: "outline" as const };
    }
  };

  const getLeaveStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return { label: "در انتظار", variant: "secondary" as const };
      case "APPROVED":
        return { label: "تأیید شده", variant: "default" as const };
      case "REJECTED":
        return { label: "رد شده", variant: "destructive" as const };
      default:
        return { label: "نامشخص", variant: "outline" as const };
    }
  };

  const filteredPayrollRecords = mockPayrollRecords.filter(record => {
    const matchesStatus = filterStatus === "ALL" || record.status === filterStatus;
    const matchesPeriod = filterPeriod === "ALL" || record.periodName === filterPeriod;
    const matchesSearch = record.employeeName.includes(searchTerm) || 
                         record.position.includes(searchTerm);
    
    return matchesStatus && matchesPeriod && matchesSearch;
  });

  const totalPayroll = filteredPayrollRecords.reduce((sum, record) => sum + record.netSalary, 0);
  const totalEmployees = mockEmployees.length;
  const activeEmployees = mockEmployees.filter(emp => emp.isActive).length;
  const averageSalary = totalEmployees > 0 ? mockEmployees.reduce((sum, emp) => sum + emp.basicSalary, 0) / totalEmployees : 0;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="payroll">حقوق و دستمزد</TabsTrigger>
          <TabsTrigger value="leave">مرخصی‌ها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات حقوقی</TabsTrigger>
        </TabsList>

        <TabsContent value="payroll" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل کارمندان</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalEmployees}</div>
                <p className="text-xs text-muted-foreground">
                  {activeEmployees} نفر فعال
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط حقوق</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{averageSalary.toLocaleString("fa-IR")}</div>
                <p className="text-xs text-muted-foreground">
                  تومان
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مجموع حقوق دوره</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalPayroll.toLocaleString("fa-IR")}</div>
                <p className="text-xs text-muted-foreground">
                  تومان
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">پرداخت نشده</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {filteredPayrollRecords.filter(r => r.status !== "PAID").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  فیش حقوقی
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payroll Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                ایجاد فیش حقوقی جدید
              </CardTitle>
              <CardDescription>
                اطلاعات فیش حقوقی کارمند را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...payrollForm}>
                <form onSubmit={payrollForm.handleSubmit(onPayrollSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={payrollForm.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کارمند</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="کارمند را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockEmployees.map((employee) => (
                                <SelectItem key={employee.id} value={employee.id}>
                                  {employee.code} - {employee.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="periodId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>دوره پرداخت</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="دوره پرداخت را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockPeriods.filter(p => !p.isClosed).map((period) => (
                                <SelectItem key={period.id} value={period.id}>
                                  {period.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="basicSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حقوق پایه</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <FormField
                      control={payrollForm.control}
                      name="allowances"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>حقوق و مزایا</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="deductions"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کسورات</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="bonuses"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>پاداش‌ها</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="leaveDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>روزهای مرخصی</FormLabel>
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
                      control={payrollForm.control}
                      name="leaveDeduction"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>کسورات مرخصی</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Textarea placeholder="توضیحات مربوط به فیش حقوقی..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Alert>
                    <Calculator className="h-4 w-4" />
                    <AlertTitle>محاسبه خودکار</AlertTitle>
                    <AlertDescription>
                      حقوق خالص به صورت خودکار بر اساس حقوق پایه، مزایا، پاداش‌ها و کسورات محاسبه خواهد شد.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit">
                    <Save className="h-4 w-4 ml-2" />
                    ثبت فیش حقوقی
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Payroll Records List */}
          <Card>
            <CardHeader>
              <CardTitle>لیست فیش‌های حقوقی</CardTitle>
              <CardDescription>
                لیست تمام فیش‌های حقوقی ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="جستجو در فیش‌های حقوقی..."
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
                    <SelectItem value="APPROVED">تأیید شده</SelectItem>
                    <SelectItem value="PAID">پرداخت شده</SelectItem>
                    <SelectItem value="CANCELLED">لغو شده</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterPeriod} onValueChange={setFilterPeriod}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">همه دوره‌ها</SelectItem>
                    {mockPeriods.map((period) => (
                      <SelectItem key={period.id} value={period.name}>
                        {period.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کارمند</TableHead>
                    <TableHead>سمت</TableHead>
                    <TableHead>دوره</TableHead>
                    <TableHead>حقوق پایه</TableHead>
                    <TableHead>مزایا و پاداش</TableHead>
                    <TableHead>کسورات</TableHead>
                    <TableHead>حقوق خالص</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayrollRecords.map((record) => {
                    const status = getPayrollStatus(record.status);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.employeeName}</TableCell>
                        <TableCell>{record.position}</TableCell>
                        <TableCell>{record.periodName}</TableCell>
                        <TableCell>{record.basicSalary.toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell>{(record.allowances + record.bonuses).toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell>{(record.deductions + record.leaveDeduction).toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell className="font-semibold">{record.netSalary.toLocaleString("fa-IR")} تومان</TableCell>
                        <TableCell>
                          <Badge variant={status.variant} className="flex items-center gap-1">
                            <status.icon className="h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {record.status === "DRAFT" && (
                              <>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => approvePayroll(record.id)}
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => cancelPayroll(record.id)}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {record.status === "APPROVED" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => payPayroll(record.id)}
                              >
                                <DollarSign className="h-4 w-4" />
                              </Button>
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

        <TabsContent value="leave" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>مدیریت مرخصی‌ها</CardTitle>
              <CardDescription>
                ثبت و پیگیری درخواست‌های مرخصی کارمندان
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {mockLeaveRecords.map((leave) => {
                  const leaveType = getLeaveType(leave.type);
                  const leaveStatus = getLeaveStatus(leave.status);
                  return (
                    <Card key={leave.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold">{leave.employeeName}</h3>
                            <p className="text-sm text-gray-600">{leave.startDate} تا {leave.endDate}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={leaveType.variant} className="mb-1">
                              {leaveType.label}
                            </Badge>
                            <Badge variant={leaveStatus.variant}>
                              {leaveStatus.label}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <div className="text-sm">
                            <p className="font-medium">{leave.days} روز</p>
                            <p className="text-gray-600">{leave.reason}</p>
                          </div>
                          <div className="flex gap-2">
                            {leave.status === "PENDING" && (
                              <>
                                <Button size="sm" variant="outline">
                                  تأیید
                                </Button>
                                <Button size="sm" variant="outline">
                                  رد
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>گزارشات حقوقی</CardTitle>
              <CardDescription>
                گزارشات تحلیلی مربوط به حقوق و دستمزد
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Calculator className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                    <h3 className="font-semibold mb-2">گزارش حقوق ماهانه</h3>
                    <p className="text-sm text-gray-600">گزارش حقوق پرداختی به کارمندان</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Award className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <h3 className="font-semibold mb-2">گزارش پاداش‌ها</h3>
                    <p className="text-sm text-gray-600">تحلیل پاداش‌های پرداختی</p>
                  </CardContent>
                </Card>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-6 text-center">
                    <Plane className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                    <h3 className="font-semibold mb-2">گزارش مرخصی‌ها</h3>
                    <p className="text-sm text-gray-600">تحلیل مرخصی‌های کارمندان</p>
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