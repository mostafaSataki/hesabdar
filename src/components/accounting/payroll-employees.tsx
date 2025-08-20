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
import { Plus, Save, Edit, Trash2, Eye, Users, DollarSign, Calendar, Calculator } from "lucide-react";
import { toast } from "sonner";

const employeeSchema = z.object({
  code: z.string().min(1, "کد پرسنلی الزامی است"),
  name: z.string().min(1, "نام کارمند الزامی است"),
  nationalId: z.string().min(10, "کد ملی الزامی است"),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  position: z.string().min(1, "سمت شغلی الزامی است"),
  department: z.string().optional(),
  baseSalary: z.string().min(1, "حقوق پایه الزامی است"),
  hireDate: z.string().min(1, "تاریخ استخدام الزامی است"),
});

const payrollSchema = z.object({
  year: z.string().min(1, "سال الزامی است"),
  month: z.string().min(1, "ماه الزامی است"),
  employeeId: z.string().min(1, "کارمند الزامی است"),
  baseSalary: z.string().min(1, "حقوق پایه الزامی است"),
  allowances: z.string().min(1, "حقوق و مزایا الزامی است"),
  deductions: z.string().min(1, "کسورات الزامی است"),
  tax: z.string().min(1, "مالیات الزامی است"),
  insurance: z.string().min(1, "بیمه الزامی است"),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;
type PayrollFormData = z.infer<typeof payrollSchema>;

interface Employee {
  id: string;
  code: string;
  name: string;
  nationalId: string;
  phone?: string;
  email?: string;
  address?: string;
  position: string;
  department?: string;
  baseSalary: number;
  hireDate: string;
  isActive: boolean;
}

interface PayrollRecord {
  id: string;
  employeeName: string;
  year: number;
  month: number;
  baseSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  insurance: number;
  netSalary: number;
  status: string;
  paymentDate?: string;
}

const departments = [
  { value: "مالی", label: "مالی" },
  { value: "فروش", label: "فروش" },
  { value: "تولید", label: "تولید" },
  { value: "اداری", label: "اداری" },
  { value: "فنی", label: "فنی" },
];

const positions = [
  { value: "مدیرعامل", label: "مدیرعامل" },
  { value: "مدیر مالی", label: "مدیر مالی" },
  { value: "حسابدار", label: "حسابدار" },
  { value: "برنامه‌نویس", label: "برنامه‌نویس" },
  { value: "کارمند اداری", label: "کارمند اداری" },
  { value: "کارگر", label: "کارگر" },
];

const months = [
  { value: "1", label: "فروردین" },
  { value: "2", label: "اردیبهشت" },
  { value: "3", label: "خرداد" },
  { value: "4", label: "تیر" },
  { value: "5", label: "مرداد" },
  { value: "6", label: "شهریور" },
  { value: "7", label: "مهر" },
  { value: "8", label: "آبان" },
  { value: "9", label: "آذر" },
  { value: "10", label: "دی" },
  { value: "11", label: "بهمن" },
  { value: "12", label: "اسفند" },
];

const mockEmployees: Employee[] = [
  {
    id: "1",
    code: "001",
    name: "علی رضایی",
    nationalId: "1234567890",
    phone: "09123456789",
    email: "ali@example.com",
    address: "تهران، خیابان ولیعصر",
    position: "مدیر مالی",
    department: "مالی",
    baseSalary: 15000000,
    hireDate: "1400/01/01",
    isActive: true,
  },
  {
    id: "2",
    code: "002",
    name: "مریم احمدی",
    nationalId: "0987654321",
    phone: "09198765432",
    email: "maryam@example.com",
    address: "اصفهان، میدان نقش جهان",
    position: "حسابدار",
    department: "مالی",
    baseSalary: 8000000,
    hireDate: "1401/03/15",
    isActive: true,
  },
  {
    id: "3",
    code: "003",
    name: "رضا محمدی",
    nationalId: "1122334455",
    phone: "09111223344",
    address: "شیراز، خیابان زند",
    position: "برنامه‌نویس",
    department: "فنی",
    baseSalary: 12000000,
    hireDate: "1402/06/20",
    isActive: true,
  },
];

const mockPayrollRecords: PayrollRecord[] = [
  {
    id: "1",
    employeeName: "علی رضایی",
    year: 1403,
    month: 11,
    baseSalary: 15000000,
    allowances: 2000000,
    deductions: 500000,
    tax: 1500000,
    insurance: 1200000,
    netSalary: 13800000,
    status: "PAID",
    paymentDate: "1403/11/25",
  },
  {
    id: "2",
    employeeName: "مریم احمدی",
    year: 1403,
    month: 11,
    baseSalary: 8000000,
    allowances: 1000000,
    deductions: 200000,
    tax: 800000,
    insurance: 600000,
    netSalary: 7400000,
    status: "PAID",
    paymentDate: "1403/11/25",
  },
  {
    id: "3",
    employeeName: "رضا محمدی",
    year: 1403,
    month: 11,
    baseSalary: 12000000,
    allowances: 1500000,
    deductions: 300000,
    tax: 1200000,
    insurance: 900000,
    netSalary: 11100000,
    status: "CALCULATED",
  },
];

const payrollStatuses = {
  PENDING: { label: "در انتظار", variant: "secondary" as const },
  CALCULATED: { label: "محاسبه شده", variant: "default" as const },
  APPROVED: { label: "تأیید شده", variant: "default" as const },
  PAID: { label: "پرداخت شده", variant: "default" as const },
  CANCELLED: { label: "لغو شده", variant: "destructive" as const },
};

export function PayrollEmployees() {
  const [activeTab, setActiveTab] = useState("employees");
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const employeeForm = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      code: "",
      name: "",
      nationalId: "",
      phone: "",
      email: "",
      address: "",
      position: "",
      department: "",
      baseSalary: "",
      hireDate: "",
    },
  });

  const payrollForm = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      year: "1403",
      month: new Date().getMonth() + 1,
      employeeId: "",
      baseSalary: "",
      allowances: "",
      deductions: "",
      tax: "",
      insurance: "",
    },
  });

  const onEmployeeSubmit = (data: EmployeeFormData) => {
    console.log("Employee Data:", data);
    toast.success(editingEmployee ? "کارمند با موفقیت ویرایش شد" : "کارمند جدید با موفقیت ثبت شد");
    employeeForm.reset();
    setEditingEmployee(null);
  };

  const onPayrollSubmit = (data: PayrollFormData) => {
    const baseSalary = parseFloat(data.baseSalary);
    const allowances = parseFloat(data.allowances);
    const deductions = parseFloat(data.deductions);
    const tax = parseFloat(data.tax);
    const insurance = parseFloat(data.insurance);
    const netSalary = baseSalary + allowances - deductions - tax - insurance;

    console.log("Payroll Data:", { ...data, netSalary });
    toast.success("فیش حقوقی با موفقیت محاسبه و ثبت شد");
    payrollForm.reset();
  };

  const editEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    employeeForm.reset({
      code: employee.code,
      name: employee.name,
      nationalId: employee.nationalId,
      phone: employee.phone,
      email: employee.email,
      address: employee.address,
      position: employee.position,
      department: employee.department,
      baseSalary: employee.baseSalary.toString(),
      hireDate: employee.hireDate,
    });
  };

  const calculateNetSalary = (baseSalary: number, allowances: number, deductions: number, tax: number, insurance: number) => {
    return baseSalary + allowances - deductions - tax - insurance;
  };

  return (
    <div className="space-y-6 rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-rtl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="employees">کارکنان</TabsTrigger>
          <TabsTrigger value="payroll">حقوق و دستمزد</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 rtl-align-right">
                <Users className="h-5 w-5" />
                {editingEmployee ? "ویرایش کارمند" : "ثبت کارمند جدید"}
              </CardTitle>
              <CardDescription className="rtl-align-right">
                اطلاعات کارمند را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...employeeForm}>
                <form onSubmit={employeeForm.handleSubmit(onEmployeeSubmit)} className="space-y-4 form-rtl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={employeeForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">کد پرسنلی</FormLabel>
                          <FormControl>
                            <Input placeholder="001" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">نام کارمند</FormLabel>
                          <FormControl>
                            <Input placeholder="نام کارمند" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="nationalId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">کد ملی</FormLabel>
                          <FormControl>
                            <Input placeholder="1234567890" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={employeeForm.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">سمت شغلی</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="سمت شغلی را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {positions.map((position) => (
                                <SelectItem key={position.value} value={position.value}>
                                  {position.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">دپارتمان</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="دپارتمان را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {departments.map((department) => (
                                <SelectItem key={department.value} value={department.value}>
                                  {department.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="baseSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">حقوق پایه</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={employeeForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">تلفن</FormLabel>
                          <FormControl>
                            <Input placeholder="09123456789" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={employeeForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">ایمیل</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="employee@example.com" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={employeeForm.control}
                      name="hireDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">تاریخ استخدام</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={employeeForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="rtl-align-right">آدرس</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="آدرس کارمند..."
                            className="rtl-align-right"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" className="btn-rtl">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      {editingEmployee ? "ویرایش کارمند" : "ثبت کارمند"}
                    </Button>
                    {editingEmployee && (
                      <Button type="button" variant="outline" onClick={() => setEditingEmployee(null)} className="btn-rtl">
                        انصراف
                      </Button>
                    )}
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">لیست کارکنان</CardTitle>
              <CardDescription className="rtl-align-right">لیست تمام کارکنان فعال شرکت</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl-align-right">کد پرسنلی</TableHead>
                      <TableHead className="rtl-align-right">نام کارمند</TableHead>
                      <TableHead className="rtl-align-right">سمت شغلی</TableHead>
                      <TableHead className="rtl-align-right">دپارتمان</TableHead>
                      <TableHead className="rtl-align-left">حقوق پایه</TableHead>
                      <TableHead className="rtl-align-right">تاریخ استخدام</TableHead>
                      <TableHead className="rtl-align-right">وضعیت</TableHead>
                      <TableHead className="rtl-align-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="rtl-align-right">{employee.code}</TableCell>
                        <TableCell className="rtl-align-right">{employee.name}</TableCell>
                        <TableCell className="rtl-align-right">{employee.position}</TableCell>
                        <TableCell className="rtl-align-right">{employee.department}</TableCell>
                        <TableCell className="persian-numbers rtl-align-left">
                          {employee.baseSalary.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell className="rtl-align-right">{employee.hireDate}</TableCell>
                        <TableCell className="rtl-align-right">
                          <Badge variant={employee.isActive ? "default" : "secondary"} className="badge-rtl">
                            {employee.isActive ? "فعال" : "غیرفعال"}
                          </Badge>
                        </TableCell>
                        <TableCell className="rtl-align-right">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => editEmployee(employee)} className="btn-rtl">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-rtl">
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
                      <TableCell>{employee.position}</TableCell>
                      <TableCell>{employee.department}</TableCell>
                      <TableCell className="persian-numbers">
                        {employee.baseSalary.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell>{employee.hireDate}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editEmployee(employee)}>
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
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                محاسبه حقوق و دستمزد
              </CardTitle>
              <CardDescription>
                اطلاعات حقوق و دستمزد کارمند را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...payrollForm}>
                <form onSubmit={payrollForm.handleSubmit(onPayrollSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={payrollForm.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سال</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="سال را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1403">1403</SelectItem>
                              <SelectItem value="1404">1404</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ماه</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="ماه را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {months.map((month) => (
                                <SelectItem key={month.value} value={month.value}>
                                  {month.label}
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={payrollForm.control}
                      name="baseSalary"
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
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      name="tax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>مالیات</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={payrollForm.control}
                      name="insurance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>بیمه</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Calculator className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      محاسبه و ثبت فیش حقوقی
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>فیش‌های حقوقی اخیر</CardTitle>
              <CardDescription>
                لیست آخرین فیش‌های حقوقی محاسبه شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کارمند</TableHead>
                    <TableHead>ماه/سال</TableHead>
                    <TableHead>حقوق پایه</TableHead>
                    <TableHead>مزایا</TableHead>
                    <TableHead>کسورات</TableHead>
                    <TableHead>خالص پرداختی</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPayrollRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.employeeName}</TableCell>
                      <TableCell>
                        {months.find(m => m.value === record.month.toString())?.label} {record.year}
                      </TableCell>
                      <TableCell className="persian-numbers">
                        {record.baseSalary.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers">
                        {record.allowances.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers">
                        {record.deductions.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell className="persian-numbers">
                        {record.netSalary.toLocaleString("fa-IR")} تومان
                      </TableCell>
                      <TableCell>
                        <Badge variant={payrollStatuses[record.status as keyof typeof payrollStatuses].variant}>
                          {payrollStatuses[record.status as keyof typeof payrollStatuses].label}
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