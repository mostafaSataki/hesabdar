"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  FileText, 
  Download, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package,
  Users,
  Calendar,
  BarChart3,
  PieChart,
  Eye
} from "lucide-react";
import { toast } from "sonner";

interface ReportData {
  id: string;
  title: string;
  type: string;
  date: string;
  period: string;
  status: string;
}

const mockReports: ReportData[] = [
  {
    id: "1",
    title: "ترازنامه دی 1403",
    type: "مالی",
    date: "1403/12/01",
    period: "ماهانه",
    status: "تکمیل شده",
  },
  {
    id: "2",
    title: "صورت سود و زیان آذر 1403",
    type: "مالی",
    date: "1403/12/01",
    period: "ماهانه",
    status: "تکمیل شده",
  },
  {
    id: "3",
    title: "گزارش فروش دی 1403",
    type: "فروش",
    date: "1403/12/01",
    period: "ماهانه",
    status: "تکمیل شده",
  },
  {
    id: "4",
    title: "گزارش موجودی انبار",
    type: "انبار",
    date: "1403/12/05",
    period: "روزانه",
    status: "در حال تهیه",
  },
  {
    id: "5",
    title: "گزارش حقوق و دستمزد آذر 1403",
    type: "حقوق",
    date: "1403/12/10",
    period: "ماهانه",
    status: "تکمیل شده",
  },
];

const financialData = {
  balanceSheet: [
    { account: "دارایی‌ها", amount: 500000000, type: "دارایی" },
    { account: "بدهی‌ها", amount: 300000000, type: "بدهی" },
    { account: "حقوق صاحبان سهام", amount: 200000000, type: "حقوق" },
  ],
  incomeStatement: [
    { account: "درآمد فروش", amount: 800000000, type: "درآمد" },
    { account: "بهای تمام شده کالای فروش رفته", amount: 500000000, type: "هزینه" },
    { account: "هزینه‌های اداری", amount: 150000000, type: "هزینه" },
    { account: "هزینه‌های فروش", amount: 80000000, type: "هزینه" },
    { account: "سود خالص", amount: 70000000, type: "سود" },
  ],
  cashFlow: [
    { account: "وجه نقد حاصل از عملیات", amount: 100000000, type: "ورودی" },
    { account: "وجه نقد حاصل از سرمایه‌گذاری", amount: -50000000, type: "خروجی" },
    { account: "وجه نقد حاصل از تأمین مالی", amount: 20000000, type: "ورودی" },
    { account: "تغییرات نقدینگی", amount: 70000000, type: "خالص" },
  ],
};

const salesData = [
  { customer: "شرکت الف", amount: 250000000, invoices: 15, date: "1403/12/01" },
  { customer: "فروشگاه ب", amount: 180000000, invoices: 22, date: "1403/12/02" },
  { customer: "مشتری ج", amount: 120000000, invoices: 8, date: "1403/12/03" },
  { customer: "مشتری د", amount: 90000000, invoices: 12, date: "1403/12/04" },
  { customer: "مشتری ه", amount: 60000000, invoices: 6, date: "1403/12/05" },
];

const inventoryData = [
  { product: "لپتاپ مدل A", quantity: 15, value: 525000000, status: "موجودی کافی" },
  { product: "موس بی‌سیم", quantity: 8, value: 6400000, status: "نیاز به سفارش" },
  { product: "کاغذ A4", quantity: 100, value: 8000000, status: "موجودی کافی" },
  { product: "مانیتور LED", quantity: 5, value: 25000000, status: "موجودی کم" },
];

const payrollData = [
  { employee: "علی رضایی", baseSalary: 15000000, allowances: 2000000, deductions: 500000, netSalary: 16500000 },
  { employee: "مریم احمدی", baseSalary: 8000000, allowances: 1000000, deductions: 200000, netSalary: 8800000 },
  { employee: "رضا محمدی", baseSalary: 12000000, allowances: 1500000, deductions: 300000, netSalary: 13200000 },
];

const reportTypes = [
  { value: "financial", label: "گزارشات مالی" },
  { value: "sales", label: "گزارشات فروش" },
  { value: "inventory", label: "گزارشات انبار" },
  { value: "payroll", label: "گزارشات حقوق" },
  { value: "customer", label: "گزارشات مشتریان" },
  { value: "supplier", label: "گزارشات تأمین‌کنندگان" },
];

const periods = [
  { value: "daily", label: "روزانه" },
  { value: "weekly", label: "هفتگی" },
  { value: "monthly", label: "ماهانه" },
  { value: "quarterly", label: "فصلی" },
  { value: "yearly", label: "سالانه" },
];

export function Reports() {
  const [activeTab, setActiveTab] = useState("financial");
  const [selectedType, setSelectedType] = useState("financial");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const generateReport = () => {
    toast.success("گزارش در حال تهیه است...");
  };

  const downloadReport = (reportId: string) => {
    toast.success("دانلود گزارش آغاز شد");
  };

  const getNetIncome = () => {
    const revenue = financialData.incomeStatement.find(item => item.type === "درآمد")?.amount || 0;
    const expenses = financialData.incomeStatement
      .filter(item => item.type === "هزینه")
      .reduce((sum, item) => sum + item.amount, 0);
    return revenue - expenses;
  };

  return (
    <div className="space-y-6 rtl">
      <Card className="card-rtl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 rtl-align-right">
            <BarChart3 className="h-5 w-5" />
            ایجاد گزارش جدید
          </CardTitle>
          <CardDescription className="rtl-align-right">
            نوع گزارش و بازه زمانی مورد نظر را انتخاب کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block rtl-align-right">نوع گزارش</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="select-rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block rtl-align-right">دوره زمانی</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="select-rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {periods.map((period) => (
                    <SelectItem key={period.value} value={period.value}>
                      {period.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block rtl-align-right">از تاریخ</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="rtl-align-right"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block rtl-align-right">تا تاریخ</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="rtl-align-right"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button onClick={generateReport} className="btn-rtl">
              <Filter className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
              ایجاد گزارش
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial">مالی</TabsTrigger>
          <TabsTrigger value="sales">فروش</TabsTrigger>
          <TabsTrigger value="inventory">انبار</TabsTrigger>
          <TabsTrigger value="payroll">حقوق</TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="card-rtl">
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium rtl-align-right">کل دارایی‌ها</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold persian-numbers rtl-align-right">
                  {financialData.balanceSheet
                    .filter(item => item.type === "دارایی")
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString("fa-IR")} تومان
                </div>
              </CardContent>
            </Card>
            <Card className="card-rtl">
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium rtl-align-right">کل بدهی‌ها</CardTitle>
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold persian-numbers rtl-align-right">
                  {financialData.balanceSheet
                    .filter(item => item.type === "بدهی")
                    .reduce((sum, item) => sum + item.amount, 0)
                    .toLocaleString("fa-IR")} تومان
                </div>
              </CardContent>
            </Card>
            <Card className="card-rtl">
              <CardHeader className="flex flex-row rtl:flex-row-reverse items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium rtl-align-right">سود خالص</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold persian-numbers rtl-align-right">
                  {getNetIncome().toLocaleString("fa-IR")} تومان
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="card-rtl">
              <CardHeader>
                <CardTitle className="rtl-align-right">ترازنامه</CardTitle>
                <CardDescription className="rtl-align-right">وضعیت مالی شرکت در تاریخ گزارش</CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl-align-right">حساب</TableHead>
                      <TableHead className="rtl-align-left">مبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.balanceSheet.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="rtl-align-right">{item.account}</TableCell>
                        <TableCell className="persian-numbers rtl-align-left">
                          {item.amount.toLocaleString("fa-IR")} تومان
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="card-rtl">
              <CardHeader>
                <CardTitle className="rtl-align-right">صورت سود و زیان</CardTitle>
                <CardDescription className="rtl-align-right">عملکرد مالی شرکت در دوره گزارش</CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl-align-right">حساب</TableHead>
                      <TableHead className="rtl-align-left">مبلغ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {financialData.incomeStatement.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="rtl-align-right">{item.account}</TableCell>
                        <TableCell className={`persian-numbers rtl-align-left ${
                          item.type === "درآمد" || item.type === "سود" ? "text-green-600" : "text-red-600"
                        }`}>
                          {item.amount.toLocaleString("fa-IR")} تومان
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">گزارش فروش بر اساس مشتری</CardTitle>
              <CardDescription className="rtl-align-right">تحلیل فروش به تفکیک مشتریان</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="rtl-align-right">مشتری</TableHead>
                    <TableHead className="rtl-align-right">تعداد فاکتور</TableHead>
                    <TableHead className="rtl-align-left">مبلغ فروش</TableHead>
                    <TableHead className="rtl-align-right">آخرین خرید</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {salesData.map((sale, index) => (
                    <TableRow key={index}>
                      <TableCell className="rtl-align-right">{sale.customer}</TableCell>
                      <TableCell className="persian-numbers rtl-align-right">{sale.invoices}</TableCell>
                      <TableCell className="persian-numbers rtl-align-left">
                        {sale.amount.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="rtl-align-right">{sale.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">گزارش موجودی انبار</CardTitle>
              <CardDescription className="rtl-align-right">وضعیت موجودی کالاها در انبار</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="rtl-align-right">کالا</TableHead>
                    <TableHead className="rtl-align-right">تعداد</TableHead>
                    <TableHead className="rtl-align-left">ارزش ریالی</TableHead>
                    <TableHead className="rtl-align-right">وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventoryData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="rtl-align-right">{item.product}</TableCell>
                      <TableCell className="persian-numbers rtl-align-right">{item.quantity}</TableCell>
                      <TableCell className="persian-numbers rtl-align-left">
                        {item.value.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="rtl-align-right">
                        <Badge variant={
                          item.status === "موجودی کافی" ? "default" : 
                          item.status === "موجودی کم" ? "secondary" : "destructive"
                        } className="badge-rtl">
                          {item.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">گزارش حقوق و دستمزد</CardTitle>
              <CardDescription className="rtl-align-right">خلاصه پرداخت‌های حقوق و دستمزد</CardDescription>
            </CardHeader>
            <CardContent>
              <Table className="table-rtl">
                <TableHeader>
                  <TableRow>
                    <TableHead className="rtl-align-right">کارمند</TableHead>
                    <TableHead className="rtl-align-left">حقوق پایه</TableHead>
                    <TableHead className="rtl-align-left">مزایا</TableHead>
                    <TableHead className="rtl-align-left">کسورات</TableHead>
                    <TableHead className="rtl-align-left">خالص پرداختی</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payrollData.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="rtl-align-right">{item.employee}</TableCell>
                      <TableCell className="persian-numbers rtl-align-left">
                        {item.baseSalary.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers rtl-align-left">
                        {item.allowances.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers rtl-align-left">
                        {item.deductions.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers rtl-align-left">
                        {item.netSalary.toLocaleString("fa-IR")} تومان
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="card-rtl">
        <CardHeader>
          <CardTitle className="rtl-align-right">گزارش‌های اخیر</CardTitle>
          <CardDescription className="rtl-align-right">لیست گزارش‌های تهیه شده در سیستم</CardDescription>
        </CardHeader>
        <CardContent>
          <Table className="table-rtl">
            <TableHeader>
              <TableRow>
                <TableHead className="rtl-align-right">عنوان گزارش</TableHead>
                <TableHead className="rtl-align-right">نوع</TableHead>
                <TableHead className="rtl-align-right">تاریخ</TableHead>
                <TableHead className="rtl-align-right">دوره</TableHead>
                <TableHead className="rtl-align-right">وضعیت</TableHead>
                <TableHead className="rtl-align-right">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="rtl-align-right">{report.title}</TableCell>
                  <TableCell className="rtl-align-right">{report.type}</TableCell>
                  <TableCell className="rtl-align-right">{report.date}</TableCell>
                  <TableCell className="rtl-align-right">{report.period}</TableCell>
                  <TableCell className="rtl-align-right">
                    <Badge 
                      variant={report.status === "تکمیل شده" ? "default" : "secondary"}
                      className="badge-rtl"
                    >
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="rtl-align-right">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" className="btn-rtl">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="btn-rtl" onClick={() => downloadReport(report.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}