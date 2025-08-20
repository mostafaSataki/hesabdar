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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trash2, Save, Send, Calculator, FileText } from "lucide-react";
import { toast } from "sonner";

const journalEntrySchema = z.object({
  date: z.string().min(1, "تاریخ الزامی است"),
  number: z.string().min(1, "شماره سند الزامی است"),
  referenceNumber: z.string().optional(),
  subNumber: z.string().optional(),
  type: z.string().min(1, "نوع سند الزامی است"),
  currency: z.string().optional(),
  exchangeRate: z.string().optional(),
  description: z.string().min(1, "توضیحات الزامی است"),
});

const journalLineSchema = z.object({
  accountGroup: z.string().min(1, "گروه حساب الزامی است"),
  accountMain: z.string().min(1, "حساب کل الزامی است"),
  accountSub: z.string().min(1, "حساب معین الزامی است"),
  accountDetail: z.string().min(1, "حساب تفصیل الزامی است"),
  description: z.string().optional(),
  debit: z.string().optional(),
  credit: z.string().optional(),
  currency: z.string().optional(),
  foreignAmount: z.string().optional(),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;
type JournalLineFormData = z.infer<typeof journalLineSchema>;

interface Account {
  id: string;
  code: string;
  name: string;
  type: string;
  level: "GROUP" | "MAIN" | "SUB" | "DETAIL";
  parentId?: string;
}

interface Currency {
  code: string;
  name: string;
  symbol: string;
}

const mockAccounts: Account[] = [
  // گروه حساب‌ها
  { id: "1", code: "1", name: "دارایی‌ها", type: "ASSET", level: "GROUP" },
  { id: "2", code: "2", name: "بدهی‌ها", type: "LIABILITY", level: "GROUP" },
  { id: "3", code: "3", name: "حقوق صاحبان سهام", type: "EQUITY", level: "GROUP" },
  { id: "4", code: "4", name: "درآمدها", type: "REVENUE", level: "GROUP" },
  { id: "5", code: "5", name: "هزینه‌ها", type: "EXPENSE", level: "GROUP" },
  
  // حساب‌های کل
  { id: "11", code: "11", name: "دارایی‌های جاری", type: "ASSET", level: "MAIN", parentId: "1" },
  { id: "12", code: "12", name: "دارایی‌های ثابت", type: "ASSET", level: "MAIN", parentId: "1" },
  { id: "21", code: "21", name: "بدهی‌های جاری", type: "LIABILITY", level: "MAIN", parentId: "2" },
  { id: "31", code: "31", name: "سرمایه", type: "EQUITY", level: "MAIN", parentId: "3" },
  { id: "41", code: "41", name: "درآمدهای عملیاتی", type: "REVENUE", level: "MAIN", parentId: "4" },
  { id: "51", code: "51", name: "هزینه‌های عملیاتی", type: "EXPENSE", level: "MAIN", parentId: "5" },
  
  // حساب‌های معین
  { id: "111", code: "111", name: "صندوق", type: "ASSET", level: "SUB", parentId: "11" },
  { id: "112", code: "112", name: "بانک‌ها", type: "ASSET", level: "SUB", parentId: "11" },
  { id: "113", code: "113", name: "حساب‌های دریافتنی", type: "ASSET", level: "SUB", parentId: "11" },
  { id: "121", code: "121", name: "ماشین‌آلات", type: "ASSET", level: "SUB", parentId: "12" },
  { id: "211", code: "211", name: "حساب‌های پرداختنی", type: "LIABILITY", level: "SUB", parentId: "21" },
  { id: "411", code: "411", name: "فروش کالا", type: "REVENUE", level: "SUB", parentId: "41" },
  { id: "511", code: "511", name: "خرید کالا", type: "EXPENSE", level: "SUB", parentId: "51" },
  { id: "512", code: "512", name: "هزینه‌های اداری", type: "EXPENSE", level: "SUB", parentId: "51" },
  
  // حساب‌های تفصیلی
  { id: "1111", code: "1111", name: "صندوق اصلی", type: "ASSET", level: "DETAIL", parentId: "111" },
  { id: "1121", code: "1121", name: "بانک ملت", type: "ASSET", level: "DETAIL", parentId: "112" },
  { id: "1122", code: "1122", name: "بانک ملی", type: "ASSET", level: "DETAIL", parentId: "112" },
  { id: "1131", code: "1131", name: "مشتریان", type: "ASSET", level: "DETAIL", parentId: "113" },
  { id: "2111", code: "2111", name: "تامین‌کنندگان", type: "LIABILITY", level: "DETAIL", parentId: "211" },
];

const currencies: Currency[] = [
  { code: "IRR", name: "ریال ایران", symbol: "ریال" },
  { code: "USD", name: "دلار آمریکا", symbol: "$" },
  { code: "EUR", name: "یورو", symbol: "€" },
  { code: "AED", name: "درهم امارات", symbol: "د.إ" },
];

const journalTypes = [
  { value: "MANUAL", label: "دستی" },
  { value: "RECEIPT", label: "دریافت" },
  { value: "PAYMENT", label: "پرداخت" },
  { value: "PURCHASE", label: "خرید" },
  { value: "SALES", label: "فروش" },
  { value: "PAYROLL", label: "حقوق" },
  { value: "ADJUSTMENT", label: "اصلاحی" },
  { value: "CLOSING", label: "بستن حساب‌ها" },
  { value: "RETURN_PURCHASE", label: "برگشت خرید" },
  { value: "RETURN_SALES", label: "برگشت فروش" },
];

export function JournalEntryForm() {
  const [lines, setLines] = useState<JournalLineFormData[]>([
    { accountGroup: "", accountMain: "", accountSub: "", accountDetail: "", description: "", debit: "", credit: "", currency: "IRR", foreignAmount: "" },
    { accountGroup: "", accountMain: "", accountSub: "", accountDetail: "", description: "", debit: "", credit: "", currency: "IRR", foreignAmount: "" },
  ]);

  const form = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      number: "",
      referenceNumber: "",
      subNumber: "",
      type: "MANUAL",
      currency: "IRR",
      exchangeRate: "1",
      description: "",
    },
  });

  const getAccountsByLevel = (level: Account["level"], parentId?: string) => {
    return mockAccounts.filter(account => account.level === level && account.parentId === parentId);
  };

  const addLine = () => {
    setLines([...lines, { accountGroup: "", accountMain: "", accountSub: "", accountDetail: "", description: "", debit: "", credit: "", currency: "IRR", foreignAmount: "" }]);
  };

  const removeLine = (index: number) => {
    if (lines.length > 2) {
      setLines(lines.filter((_, i) => i !== index));
    }
  };

  const updateLine = (index: number, field: keyof JournalLineFormData, value: string) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    
    // If account group changes, reset lower level accounts
    if (field === "accountGroup") {
      newLines[index].accountMain = "";
      newLines[index].accountSub = "";
      newLines[index].accountDetail = "";
    } else if (field === "accountMain") {
      newLines[index].accountSub = "";
      newLines[index].accountDetail = "";
    } else if (field === "accountSub") {
      newLines[index].accountDetail = "";
    }
    
    setLines(newLines);
  };

  const getTotalDebit = () => {
    return lines.reduce((sum, line) => sum + (parseFloat(line.debit) || 0), 0);
  };

  const getTotalCredit = () => {
    return lines.reduce((sum, line) => sum + (parseFloat(line.credit) || 0), 0);
  };

  const isBalanced = () => {
    return Math.abs(getTotalDebit() - getTotalCredit()) < 0.01;
  };

  const onSubmit = (data: JournalEntryFormData) => {
    if (!isBalanced()) {
      toast.error("مجموع بدهکار و بستانکار باید برابر باشند");
      return;
    }

    const hasEmptyLines = lines.some(line => !line.accountGroup || !line.accountMain || !line.accountSub || !line.accountDetail || (!line.debit && !line.credit));
    if (hasEmptyLines) {
      toast.error("لطفا تمام ردیف‌ها را تکمیل کنید");
      return;
    }

    console.log("Journal Entry Data:", { ...data, lines });
    toast.success("سند حسابداری با موفقیت ثبت شد");
    
    // Reset form
    form.reset();
    setLines([
      { accountGroup: "", accountMain: "", accountSub: "", accountDetail: "", description: "", debit: "", credit: "", currency: "IRR", foreignAmount: "" },
      { accountGroup: "", accountMain: "", accountSub: "", accountDetail: "", description: "", debit: "", credit: "", currency: "IRR", foreignAmount: "" },
    ]);
  };

  const onSaveAsDraft = () => {
    toast.success("سند به صورت پیش‌نویس ذخیره شد");
  };

  const onPreview = () => {
    toast.success("پیش‌نمایش سند آماده شد");
  };

  return (
    <div className="space-y-6 rtl">
      <Tabs defaultValue="entry" className="w-full tabs-rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry">ثبت سند</TabsTrigger>
          <TabsTrigger value="closing">بستن حساب‌ها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="entry" className="space-y-6">
          <Card className="card-rtl">
            <CardHeader>
              <CardTitle className="rtl-align-right">ثبت سند حسابداری جدید</CardTitle>
              <CardDescription className="rtl-align-right">
                اطلاعات سند حسابداری را وارد کنید و ردیف‌های مربوط به آن را ثبت نمایید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 form-rtl">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">تاریخ سند</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره سند</FormLabel>
                          <FormControl>
                            <Input placeholder="مثلا: 1403-001" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="referenceNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره عطف</FormLabel>
                          <FormControl>
                            <Input placeholder="شماره عطف" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="subNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">شماره فرعی</FormLabel>
                          <FormControl>
                            <Input placeholder="شماره فرعی" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">نوع سند</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="نوع سند را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {journalTypes.map((type) => (
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
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">ارز</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="ارز را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.code} value={currency.code}>
                                  {currency.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="exchangeRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="rtl-align-right">نرخ ارز</FormLabel>
                          <FormControl>
                            <Input placeholder="1" type="number" step="0.01" {...field} className="rtl-align-right" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="rtl-align-right">توضیحات و جزئیات سند</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="توضیحات مربوط به سند را وارد کنید..."
                            className="min-h-[100px] rtl-align-right"
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

          <Card className="card-rtl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="rtl-align-right">ردیف‌های سند حسابداری</CardTitle>
                  <CardDescription className="rtl-align-right">
                    حساب‌ها و مبالغ مربوط به این سند را وارد کنید
                  </CardDescription>
                </div>
                <Button onClick={addLine} variant="outline" size="sm" className="btn-rtl">
                  <Plus className="h-4 w-4 ml-2" />
                  افزودن ردیف
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table className="table-rtl">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12 rtl-align-right">#</TableHead>
                        <TableHead className="rtl-align-right">گروه حساب</TableHead>
                        <TableHead className="rtl-align-right">حساب کل</TableHead>
                        <TableHead className="rtl-align-right">حساب معین</TableHead>
                        <TableHead className="rtl-align-right">حساب تفصیل</TableHead>
                        <TableHead className="rtl-align-right">توضیحات</TableHead>
                        <TableHead className="rtl-align-left">بدهکار</TableHead>
                        <TableHead className="rtl-align-left">بستانکار</TableHead>
                        <TableHead className="rtl-align-right">ارز</TableHead>
                        <TableHead className="rtl-align-left">مبلغ ارزی</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {lines.map((line, index) => (
                        <TableRow key={index}>
                          <TableCell className="rtl-align-right">{index + 1}</TableCell>
                          <TableCell>
                            <Select
                              value={line.accountGroup}
                              onValueChange={(value) => updateLine(index, "accountGroup", value)}
                            >
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="گروه" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAccountsByLevel("GROUP").map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.code} - {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.accountMain}
                              onValueChange={(value) => updateLine(index, "accountMain", value)}
                              disabled={!line.accountGroup}
                            >
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="حساب کل" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAccountsByLevel("MAIN", line.accountGroup).map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.code} - {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.accountSub}
                              onValueChange={(value) => updateLine(index, "accountSub", value)}
                              disabled={!line.accountMain}
                            >
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="معین" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAccountsByLevel("SUB", line.accountMain).map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.code} - {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.accountDetail}
                              onValueChange={(value) => updateLine(index, "accountDetail", value)}
                              disabled={!line.accountSub}
                            >
                              <SelectTrigger className="select-rtl">
                                <SelectValue placeholder="تفصیل" />
                              </SelectTrigger>
                              <SelectContent>
                                {getAccountsByLevel("DETAIL", line.accountSub).map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.code} - {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="توضیحات ردیف"
                              value={line.description}
                              onChange={(e) => updateLine(index, "description", e.target.value)}
                              className="rtl-align-right"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="rtl-align-left"
                              value={line.debit}
                              onChange={(e) => updateLine(index, "debit", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="rtl-align-left"
                              value={line.credit}
                              onChange={(e) => updateLine(index, "credit", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={line.currency}
                              onValueChange={(value) => updateLine(index, "currency", value)}
                            >
                              <SelectTrigger className="select-rtl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {currencies.map((currency) => (
                                  <SelectItem key={currency.code} value={currency.code}>
                                    {currency.code}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              placeholder="0"
                              className="rtl-align-left"
                              value={line.foreignAmount}
                              onChange={(e) => updateLine(index, "foreignAmount", e.target.value)}
                            />
                          </TableCell>
                          <TableCell>
                            {lines.length > 2 && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeLine(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
                  <div className="flex gap-4 flex-wrap">
                    <div className="text-sm rtl-align-right">
                      <span className="font-medium">جمع بدهکار: </span>
                      <span className="persian-numbers">
                        {getTotalDebit().toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="text-sm rtl-align-right">
                      <span className="font-medium">جمع بستانکار: </span>
                      <span className="persian-numbers">
                        {getTotalCredit().toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                    <div className="text-sm rtl-align-right">
                      <span className="font-medium">تفاوت: </span>
                      <span className={`persian-numbers ${isBalanced() ? "text-green-600" : "text-red-600"}`}>
                        {Math.abs(getTotalDebit() - getTotalCredit()).toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  </div>
                  <Badge variant={isBalanced() ? "default" : "destructive"} className="badge-rtl">
                    {isBalanced() ? "متراز" : "غیرمتراز"}
                  </Badge>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Button onClick={onSaveAsDraft} variant="outline" className="btn-rtl">
                    <Save className="h-4 w-4 ml-2" />
                    ذخیره پیش‌نویس
                  </Button>
                  <Button onClick={onPreview} variant="outline" className="btn-rtl">
                    <FileText className="h-4 w-4 ml-2" />
                    پیش‌نمایش
                  </Button>
                  <Button 
                    onClick={form.handleSubmit(onSubmit)} 
                    disabled={!isBalanced()}
                    className="btn-rtl"
                  >
                    <Send className="h-4 w-4 ml-2" />
                    ثبت و ارسال
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="closing" className="space-y-6">
          <ClosingAccountsForm />
        </TabsContent>
        
        <TabsContent value="reports" className="space-y-6">
          <JournalReports />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// فرم بستن حساب‌های سود و زیانی
function ClosingAccountsForm() {
  const [closingDate, setClosingDate] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const profitLossAccounts = [
    { id: "411", name: "فروش کالا", balance: 50000000, type: "REVENUE" },
    { id: "412", name: "سایر درآمدها", balance: 5000000, type: "REVENUE" },
    { id: "511", name: "خرید کالا", balance: 30000000, type: "EXPENSE" },
    { id: "512", name: "هزینه‌های اداری", balance: 15000000, type: "EXPENSE" },
    { id: "513", name: "هزینه‌های فروش", balance: 8000000, type: "EXPENSE" },
  ];

  const totalRevenue = profitLossAccounts
    .filter(acc => acc.type === "REVENUE")
    .reduce((sum, acc) => sum + acc.balance, 0);
  
  const totalExpense = profitLossAccounts
    .filter(acc => acc.type === "EXPENSE")
    .reduce((sum, acc) => sum + acc.balance, 0);
  
  const netProfit = totalRevenue - totalExpense;

  const onCloseAccounts = async () => {
    if (!closingDate) {
      toast.error("لطفا تاریخ بستن حساب‌ها را انتخاب کنید");
      return;
    }

    setIsProcessing(true);
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast.success("حساب‌های سود و زیان با موفقیت بسته شدند");
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>بستن حساب‌های سود و زیانی</CardTitle>
        <CardDescription>
          در پایان دوره مالی، حساب‌های سود و زیان را ببندید و مانده به حساب‌های دائمی منتقل شود
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">تاریخ بستن حساب‌ها</label>
            <Input
              type="date"
              value={closingDate}
              onChange={(e) => setClosingDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={onCloseAccounts} 
              disabled={isProcessing || !closingDate}
              className="w-full"
            >
              <Calculator className="h-4 w-4 ml-2" />
              {isProcessing ? "در حال پردازش..." : "بستن حساب‌ها"}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold">حساب‌های سود و زیان</h3>
          <div className="grid gap-4">
            {profitLossAccounts.map((account) => (
              <div key={account.id} className="flex justify-between items-center p-3 border rounded-lg">
                <div>
                  <span className="font-medium">{account.name}</span>
                  <Badge variant="outline" className="mr-2">
                    {account.type === "REVENUE" ? "درآمد" : "هزینه"}
                  </Badge>
                </div>
                <div className="text-right">
                  <span className="persian-numbers font-medium">
                    {account.balance.toLocaleString("fa-IR")} تومان
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">جمع درآمدها:</span>
              <span className="persian-numbers font-medium text-green-600">
                {totalRevenue.toLocaleString("fa-IR")} تومان
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">جمع هزینه‌ها:</span>
              <span className="persian-numbers font-medium text-red-600">
                {totalExpense.toLocaleString("fa-IR")} تومان
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <span className="font-bold">سود/زیان خالص:</span>
              <span className={`persian-numbers font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {netProfit.toLocaleString("fa-IR")} تومان
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// گزارشات حسابداری
function JournalReports() {
  const reports = [
    { id: 1, name: "ترازنامه", description: "گزارش وضعیت مالی شرکت در یک تاریخ مشخص", icon: "📊" },
    { id: 2, name: "صورت سود و زیان", description: "گزارش عملکرد مالی شرکت در یک دوره", icon: "📈" },
    { id: 3, name: "صورت جریان نقدی", description: "گزارش جریان‌های نقدی ورودی و خروجی", icon: "💰" },
    { id: 4, name: "گزارش معاملات", description: "گزارش کامل معاملات و اسناد", icon: "📋" },
    { id: 5, name: "گزارش حساب‌ها", description: "گزارش مانده حساب‌های مختلف", icon: "📑" },
    { id: 6, name: "گزارش سود و زیان", description: "گزارش تحلیلی سود و زیان", icon: "📉" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {reports.map((report) => (
        <Card key={report.id} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="text-2xl">{report.icon}</div>
              <div>
                <CardTitle className="text-lg">{report.name}</CardTitle>
                <CardDescription className="text-sm">
                  {report.description}
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
      ))}
    </div>
  );
}