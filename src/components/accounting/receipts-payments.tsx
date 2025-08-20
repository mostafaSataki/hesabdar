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
import { Plus, Save, Send, Eye, Edit, AlertTriangle, CheckCircle, Clock, XCircle, Banknote, CreditCard, Smartphone } from "lucide-react";
import { toast } from "sonner";

const receiptSchema = z.object({
  date: z.string().min(1, "تاریخ الزامی است"),
  number: z.string().min(1, "شماره سند الزامی است"),
  amount: z.string().min(1, "مبلغ الزامی است"),
  type: z.string().min(1, "نوع دریافت الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  customerId: z.string().min(1, "مشتری الزامی است"),
  bankAccount: z.string().min(1, "حساب بانکی الزامی است"),
  checkNumber: z.string().optional(),
  checkDate: z.string().optional(),
  dueDate: z.string().optional(),
  referenceNumber: z.string().optional(),
});

const paymentSchema = z.object({
  date: z.string().min(1, "تاریخ الزامی است"),
  number: z.string().min(1, "شماره سند الزامی است"),
  amount: z.string().min(1, "مبلغ الزامی است"),
  type: z.string().min(1, "نوع پرداخت الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  supplierId: z.string().min(1, "تأمین‌کننده الزامی است"),
  bankAccount: z.string().min(1, "حساب بانکی الزامی است"),
  checkNumber: z.string().optional(),
  checkDate: z.string().optional(),
  dueDate: z.string().optional(),
  referenceNumber: z.string().optional(),
});

const checkSettlementSchema = z.object({
  checkId: z.string().min(1, "چک الزامی است"),
  settlementDate: z.string().min(1, "تاریخ تسویه الزامی است"),
  settlementAmount: z.string().min(1, "مبلغ تسویه الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
});

const bankDiscrepancySchema = z.object({
  bankAccountId: z.string().min(1, "حساب بانکی الزامی است"),
  statementDate: z.string().min(1, "تاریخ صورت حساب الزامی است"),
  statementAmount: z.string().min(1, "مبلغ صورت حساب الزامی است"),
  systemAmount: z.string().min(1, "مبلغ سیستم الزامی است"),
  discrepancyReason: z.string().min(1, "علت مغایرت الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
});

type ReceiptFormData = z.infer<typeof receiptSchema>;
type PaymentFormData = z.infer<typeof paymentSchema>;
type CheckSettlementFormData = z.infer<typeof checkSettlementSchema>;
type BankDiscrepancyFormData = z.infer<typeof bankDiscrepancySchema>;

interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  creditLimit: number;
}

interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
}

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  branchName: string;
  balance: number;
}

interface Check {
  id: string;
  number: string;
  amount: number;
  date: string;
  dueDate: string;
  status: "PENDING" | "CLEARED" | "BOUNCED" | "CANCELLED";
  type: "RECEIPT" | "PAYMENT";
  relatedParty: string;
}

const mockCustomers: Customer[] = [
  { id: "1", code: "001", name: "شرکت الف", phone: "021-12345678", address: "تهران، خیابان ولیعصر", creditLimit: 100000000 },
  { id: "2", code: "002", name: "فروشگاه ب", phone: "021-87654321", address: "تهران، خیابان آزادی", creditLimit: 50000000 },
  { id: "3", code: "003", name: "مشتری ج", phone: "0912-3456789", address: "تهران، خیابان فاطمی", creditLimit: 30000000 },
];

const mockSuppliers: Supplier[] = [
  { id: "1", code: "001", name: "تأمین‌کننده الف", phone: "021-11111111", address: "تهران، خیابان کارگر" },
  { id: "2", code: "002", name: "شرکت ب", phone: "021-22222222", address: "تهران، خیابان انقلاب" },
  { id: "3", code: "003", name: "فروشنده ج", phone: "021-33333333", address: "تهران، خیابان جمهوری" },
];

const mockBankAccounts: BankAccount[] = [
  { id: "1", accountNumber: "1234-5678-9012-3456", bankName: "بانک ملت", branchName: "شعبه مرکزی", balance: 50000000 },
  { id: "2", accountNumber: "9876-5432-1098-7654", bankName: "بانک ملی", branchName: "شعبه ولیعصر", balance: 30000000 },
  { id: "3", accountNumber: "5555-6666-7777-8888", bankName: "بانک تجارت", branchName: "شعبه آزادی", balance: 20000000 },
];

const mockChecks: Check[] = [
  { id: "1", number: "چک-001", amount: 10000000, date: "1403/12/01", dueDate: "1404/01/01", status: "PENDING", type: "RECEIPT", relatedParty: "شرکت الف" },
  { id: "2", number: "چک-002", amount: 5000000, date: "1403/12/02", dueDate: "1404/02/01", status: "CLEARED", type: "PAYMENT", relatedParty: "تأمین‌کننده الف" },
  { id: "3", number: "چک-003", amount: 8000000, date: "1403/12/03", dueDate: "1404/03/01", status: "BOUNCED", type: "RECEIPT", relatedParty: "فروشگاه ب" },
];

const receiptTypes = [
  { value: "CASH", label: "نقدی", icon: Banknote },
  { value: "CHECK", label: "چکی", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "انتقال بانکی", icon: Smartphone },
  { value: "POS", label: "کارتخوان", icon: Smartphone },
  { value: "MONEY_ORDER", label: "حواله", icon: Send },
];

const paymentTypes = [
  { value: "CASH", label: "نقدی", icon: Banknote },
  { value: "CHECK", label: "چکی", icon: CreditCard },
  { value: "BANK_TRANSFER", label: "انتقال بانکی", icon: Smartphone },
  { value: "ONLINE", label: "آنلاین", icon: Smartphone },
  { value: "MONEY_ORDER", label: "حواله", icon: Send },
];

const transactionStatuses = {
  PENDING: { label: "در انتظار", variant: "secondary" as const, icon: Clock },
  COMPLETED: { label: "تکمیل شده", variant: "default" as const, icon: CheckCircle },
  CANCELLED: { label: "لغو شده", variant: "destructive" as const, icon: XCircle },
  BOUNCED: { label: "برگشت خورده", variant: "destructive" as const, icon: AlertTriangle },
};

const mockReceipts = [
  {
    id: "1",
    number: "دریافت-001",
    date: "1403/12/01",
    amount: "5,000,000",
    type: "نقدی",
    description: "پرداخت فاکتور فروش شماره 123",
    customer: "شرکت الف",
    bankAccount: "بانک ملت",
    status: "COMPLETED",
    referenceNumber: "REF-001",
  },
  {
    id: "2",
    number: "دریافت-002",
    date: "1403/12/02",
    amount: "10,000,000",
    type: "چکی",
    description: "دریافت چک از مشتری بابت فاکتور 124",
    customer: "فروشگاه ب",
    bankAccount: "بانک ملی",
    checkNumber: "چک-001",
    status: "PENDING",
    referenceNumber: "REF-002",
  },
  {
    id: "3",
    number: "دریافت-003",
    date: "1403/12/03",
    amount: "2,500,000",
    type: "کارتخوان",
    description: "فروش نسیه به مشتری ج",
    customer: "مشتری ج",
    bankAccount: "بانک تجارت",
    status: "COMPLETED",
    referenceNumber: "REF-003",
  },
];

const mockPayments = [
  {
    id: "1",
    number: "پرداخت-001",
    date: "1403/12/01",
    amount: "3,000,000",
    type: "نقدی",
    description: "خرید مواد اولیه از تأمین‌کننده الف",
    supplier: "تأمین‌کننده الف",
    bankAccount: "بانک ملت",
    status: "COMPLETED",
    referenceNumber: "REF-101",
  },
  {
    id: "2",
    number: "پرداخت-002",
    date: "1403/12/02",
    amount: "8,000,000",
    type: "چکی",
    description: "پرداخت به تأمین‌کننده بابت فاکتور 456",
    supplier: "شرکت ب",
    bankAccount: "بانک ملی",
    checkNumber: "چک-002",
    status: "PENDING",
    referenceNumber: "REF-102",
  },
  {
    id: "3",
    number: "پرداخت-003",
    date: "1403/12/03",
    amount: "1,500,000",
    type: "آنلاین",
    description: "هزینه‌های اداری",
    supplier: "فروشنده ج",
    bankAccount: "بانک تجارت",
    status: "BOUNCED",
    referenceNumber: "REF-103",
  },
];

export function ReceiptsPayments() {
  const [activeTab, setActiveTab] = useState("receipts");

  const receiptForm = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      number: "",
      amount: "",
      type: "CASH",
      description: "",
      customerId: "",
      bankAccount: "",
    },
  });

  const paymentForm = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      number: "",
      amount: "",
      type: "CASH",
      description: "",
      supplierId: "",
      bankAccount: "",
    },
  });

  const checkSettlementForm = useForm<CheckSettlementFormData>({
    resolver: zodResolver(checkSettlementSchema),
    defaultValues: {
      settlementDate: new Date().toISOString().split('T')[0],
      settlementAmount: "",
      description: "",
    },
  });

  const bankDiscrepancyForm = useForm<BankDiscrepancyFormData>({
    resolver: zodResolver(bankDiscrepancySchema),
    defaultValues: {
      statementDate: new Date().toISOString().split('T')[0],
      statementAmount: "",
      systemAmount: "",
      description: "",
    },
  });

  const onReceiptSubmit = (data: ReceiptFormData) => {
    console.log("Receipt Data:", data);
    toast.success("فیش دریافت با موفقیت ثبت شد");
    receiptForm.reset();
  };

  const onPaymentSubmit = (data: PaymentFormData) => {
    console.log("Payment Data:", data);
    toast.success("فیش پرداخت با موفقیت ثبت شد");
    paymentForm.reset();
  };

  const onCheckSettlementSubmit = (data: CheckSettlementFormData) => {
    console.log("Check Settlement Data:", data);
    toast.success("تسویه چک با موفقیت انجام شد");
    checkSettlementForm.reset();
  };

  const onBankDiscrepancySubmit = (data: BankDiscrepancyFormData) => {
    console.log("Bank Discrepancy Data:", data);
    toast.success("مغایرت بانکی با موفقیت ثبت شد");
    bankDiscrepancyForm.reset();
  };

  const onCheckRefundRequest = (checkId: string) => {
    toast.success("درخواست استرداد چک ثبت شد");
  };

  return (
    <div className="space-y-6 rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="tabs-rtl">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="receipts">دریافت‌ها</TabsTrigger>
          <TabsTrigger value="payments">پرداخت‌ها</TabsTrigger>
          <TabsTrigger value="checks">مدیریت چک‌ها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات</TabsTrigger>
        </TabsList>

        <TabsContent value="receipts" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">ثبت دریافت جدید</CardTitle>
              <CardDescription className="rtl-align-right">
                اطلاعات مربوط به دریافت وجه را ثبت کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...receiptForm}>
                <form onSubmit={receiptForm.handleSubmit(onReceiptSubmit)} className="space-y-4 form-rtl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={receiptForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">تاریخ و شماره سند</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={receiptForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره سند</FormLabel>
                          <FormControl>
                            <Input placeholder="دریافت-001" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={receiptForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">مبلغ دریافتی</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={receiptForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">نوع دریافت</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="نوع دریافت را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {receiptTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={receiptForm.control}
                      name="customerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">مشتری</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
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
                    <FormField
                      control={receiptForm.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">حساب بانکی یا صندوق</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="حساب بانکی را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockBankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.bankName} - {account.accountNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {receiptForm.watch("type") === "CHECK" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={receiptForm.control}
                        name="checkNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="rtl-align-right">شماره چک</FormLabel>
                            <FormControl>
                              <Input placeholder="شماره چک" {...field} className="rtl-align-right" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={receiptForm.control}
                        name="checkDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="rtl-align-right">تاریخ چک</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="rtl-align-right" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={receiptForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="rtl-align-right">تاریخ سررسید</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="rtl-align-right" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={receiptForm.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره مرجع</FormLabel>
                          <FormControl>
                            <Input placeholder="شماره مرجع" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={receiptForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">توضیحات (مشتری، تأمین‌کننده، علت دریافت)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="توضیحات مربوط به دریافت..."
                              className="min-h-[80px] rtl-align-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="btn-rtl">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ثبت دریافت
                    </Button>
                    <Button type="button" variant="outline" className="btn-rtl">
                      <Send className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ارسال برای تأیید
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">دریافت‌های اخیر</CardTitle>
              <CardDescription className="rtl-align-right">
                لیست آخرین دریافت‌های ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl-align-right">شماره سند</TableHead>
                      <TableHead className="rtl-align-right">تاریخ</TableHead>
                      <TableHead className="rtl-align-right">مبلغ</TableHead>
                      <TableHead className="rtl-align-right">نوع</TableHead>
                      <TableHead className="rtl-align-right">مشتری</TableHead>
                      <TableHead className="rtl-align-right">حساب بانکی</TableHead>
                      <TableHead className="rtl-align-right">وضعیت</TableHead>
                      <TableHead className="rtl-align-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockReceipts.map((receipt) => (
                      <TableRow key={receipt.id}>
                        <TableCell className="rtl-align-right">{receipt.number}</TableCell>
                        <TableCell className="rtl-align-right">{receipt.date}</TableCell>
                        <TableCell className="persian-numbers rtl-align-right">
                          {receipt.amount} تومان
                        </TableCell>
                        <TableCell className="rtl-align-right">{receipt.type}</TableCell>
                        <TableCell className="rtl-align-right">{receipt.customer}</TableCell>
                        <TableCell className="rtl-align-right">{receipt.bankAccount}</TableCell>
                        <TableCell className="rtl-align-right">
                          <Badge variant={transactionStatuses[receipt.status as keyof typeof transactionStatuses].variant} className="badge-rtl">
                            {transactionStatuses[receipt.status as keyof typeof transactionStatuses].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="rtl-align-right">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="btn-rtl">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-rtl">
                              <Edit className="h-4 w-4" />
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

        <TabsContent value="payments" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">ثبت پرداخت جدید</CardTitle>
              <CardDescription className="rtl-align-right">
                اطلاعات مربوط به پرداخت وجه را ثبت کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...paymentForm}>
                <form onSubmit={paymentForm.handleSubmit(onPaymentSubmit)} className="space-y-4 form-rtl">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">تاریخ و شماره سند</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره سند</FormLabel>
                          <FormControl>
                            <Input placeholder="پرداخت-001" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">مبلغ پرداختی</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">نوع پرداخت</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="نوع پرداخت را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {paymentTypes.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="supplierId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">تأمین‌کننده</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="تأمین‌کننده را انتخاب کنید" />
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
                      control={paymentForm.control}
                      name="bankAccount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">حساب بانکی یا صندوق</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="حساب بانکی را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockBankAccounts.map((account) => (
                                <SelectItem key={account.id} value={account.id}>
                                  {account.bankName} - {account.accountNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {paymentForm.watch("type") === "CHECK" && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={paymentForm.control}
                        name="checkNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="rtl-align-right">شماره چک</FormLabel>
                            <FormControl>
                              <Input placeholder="شماره چک" {...field} className="rtl-align-right" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={paymentForm.control}
                        name="checkDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="rtl-align-right">تاریخ چک</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="rtl-align-right" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={paymentForm.control}
                        name="dueDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="rtl-align-right">تاریخ سررسید</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} className="rtl-align-right" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={paymentForm.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره مرجع</FormLabel>
                          <FormControl>
                            <Input placeholder="شماره مرجع" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={paymentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">توضیحات (مشتری، تأمین‌کننده، علت پرداخت)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="توضیحات مربوط به پرداخت..."
                              className="min-h-[80px] rtl-align-right"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="btn-rtl">
                      <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ثبت پرداخت
                    </Button>
                    <Button type="button" variant="outline" className="btn-rtl">
                      <Send className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ارسال برای تأیید
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">پرداخت‌های اخیر</CardTitle>
              <CardDescription className="rtl-align-right">
                لیست آخرین پرداخت‌های ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table className="table-rtl">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="rtl-align-right">شماره سند</TableHead>
                      <TableHead className="rtl-align-right">تاریخ</TableHead>
                      <TableHead className="rtl-align-right">مبلغ</TableHead>
                      <TableHead className="rtl-align-right">نوع</TableHead>
                      <TableHead className="rtl-align-right">تأمین‌کننده</TableHead>
                      <TableHead className="rtl-align-right">حساب بانکی</TableHead>
                      <TableHead className="rtl-align-right">وضعیت</TableHead>
                      <TableHead className="rtl-align-right">عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="rtl-align-right">{payment.number}</TableCell>
                        <TableCell className="rtl-align-right">{payment.date}</TableCell>
                        <TableCell className="persian-numbers rtl-align-right">
                          {payment.amount} تومان
                        </TableCell>
                        <TableCell className="rtl-align-right">{payment.type}</TableCell>
                        <TableCell className="rtl-align-right">{payment.supplier}</TableCell>
                        <TableCell className="rtl-align-right">{payment.bankAccount}</TableCell>
                        <TableCell className="rtl-align-right">
                          <Badge variant={transactionStatuses[payment.status as keyof typeof transactionStatuses].variant} className="badge-rtl">
                            {transactionStatuses[payment.status as keyof typeof transactionStatuses].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="rtl-align-right">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="btn-rtl">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="btn-rtl">
                              <Edit className="h-4 w-4" />
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

        <TabsContent value="checks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تسویه چک‌ها</CardTitle>
                <CardDescription>
                  تسویه چک‌های دریافتی یا پرداختی
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...checkSettlementForm}>
                  <form onSubmit={checkSettlementForm.handleSubmit(onCheckSettlementSubmit)} className="space-y-4">
                    <FormField
                      control={checkSettlementForm.control}
                      name="checkId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>انتخاب چک</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="چک را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockChecks.filter(check => check.status === "PENDING").map((check) => (
                                <SelectItem key={check.id} value={check.id}>
                                  {check.number} - {check.relatedParty} - {check.amount.toLocaleString("fa-IR")} تومان
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={checkSettlementForm.control}
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
                        control={checkSettlementForm.control}
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
                    </div>
                    <FormField
                      control={checkSettlementForm.control}
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
                    <Button type="submit">
                      <CheckCircle className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      تسویه چک
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>ثبت مغایرت بانکی</CardTitle>
                <CardDescription>
                  ثبت مغایرت بین صورت حساب بانکی و سیستم
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...bankDiscrepancyForm}>
                  <form onSubmit={bankDiscrepancyForm.handleSubmit(onBankDiscrepancySubmit)} className="space-y-4">
                    <FormField
                      control={bankDiscrepancyForm.control}
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
                                  {account.bankName} - {account.accountNumber}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bankDiscrepancyForm.control}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={bankDiscrepancyForm.control}
                        name="statementAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مبلغ صورت حساب بانکی</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={bankDiscrepancyForm.control}
                        name="systemAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>مبلغ سیستم</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="0" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={bankDiscrepancyForm.control}
                      name="discrepancyReason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>علت مغایرت</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="علت مغایرت را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ERROR">خطای ورود اطلاعات</SelectItem>
                              <SelectItem value="DELAY">تأخیر در ثبت</SelectItem>
                              <SelectItem value="BANK_ERROR">خطای بانکی</SelectItem>
                              <SelectItem value="OTHER">سایر</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bankDiscrepancyForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>توضیحات</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="توضیحات مربوط به مغایرت..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit">
                      <AlertTriangle className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
                      ثبت مغایرت
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>لیست چک‌ها</CardTitle>
              <CardDescription>
                لیست چک‌های دریافتی و پرداختی
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>شماره چک</TableHead>
                      <TableHead>مبلغ</TableHead>
                      <TableHead>تاریخ</TableHead>
                      <TableHead>سررسید</TableHead>
                      <TableHead>طرف حساب</TableHead>
                      <TableHead>نوع</TableHead>
                      <TableHead>وضعیت</TableHead>
                      <TableHead>عملیات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell>{check.number}</TableCell>
                        <TableCell className="persian-numbers">
                          {check.amount.toLocaleString("fa-IR")} تومان
                        </TableCell>
                        <TableCell>{check.date}</TableCell>
                        <TableCell>{check.dueDate}</TableCell>
                        <TableCell>{check.relatedParty}</TableCell>
                        <TableCell>
                          <Badge variant={check.type === "RECEIPT" ? "default" : "secondary"}>
                            {check.type === "RECEIPT" ? "دریافتی" : "پرداختی"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={transactionStatuses[check.status].variant}>
                            {transactionStatuses[check.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {check.status === "PENDING" && (
                              <Button variant="ghost" size="sm">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => onCheckRefundRequest(check.id)}>
                              <AlertTriangle className="h-4 w-4" />
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
                  <div className="text-2xl">📊</div>
                  <div>
                    <CardTitle className="text-lg">گزارش دریافت‌ها</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش کامل دریافت‌های ثبت شده
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
                  <div className="text-2xl">💸</div>
                  <div>
                    <CardTitle className="text-lg">گزارش پرداخت‌ها</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش کامل پرداخت‌های ثبت شده
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
                  <div className="text-2xl">🏦</div>
                  <div>
                    <CardTitle className="text-lg">گزارش مغایرت بانکی</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش مغایرت‌های ثبت شده بانکی
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
                    <CardTitle className="text-lg">گزارش چک‌ها</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش وضعیت چک‌های دریافتی و پرداختی
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
                  <div className="text-2xl">📈</div>
                  <div>
                    <CardTitle className="text-lg">تحلیل جریان نقدی</CardTitle>
                    <CardDescription className="text-sm">
                      تحلیل جریان‌های نقدی ورودی و خروجی
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
                  <div className="text-2xl">📑</div>
                  <div>
                    <CardTitle className="text-lg">گزارش خلاصه</CardTitle>
                    <CardDescription className="text-sm">
                      گزارش خلاصه دریافت‌ها و پرداخت‌ها
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