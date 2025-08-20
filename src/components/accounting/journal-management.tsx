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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Save, 
  Edit, 
  Trash2, 
  Eye, 
  FileText, 
  Calculator,
  CheckCircle,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Send
} from "lucide-react";
import { toast } from "sonner";

// Validation schema for journal entry
const journalEntrySchema = z.object({
  number: z.string().min(1, "شماره سند الزامی است"),
  date: z.string().min(1, "تاریخ سند الزامی است"),
  description: z.string().min(1, "توضیحات سند الزامی است"),
  periodId: z.string().min(1, "دوره مالی الزامی است"),
  items: z.array(z.object({
    accountId: z.string().min(1, "حساب الزامی است"),
    debit: z.string().min(0, "بدهکار باید عدد مثبت باشد"),
    credit: z.string().min(0, "بستانکار باید عدد مثبت باشد"),
    description: z.string().optional(),
  })).min(2, "حداقل دو آیتم الزامی است"),
});

type JournalEntryFormData = z.infer<typeof journalEntrySchema>;

// Interfaces
interface JournalEntry {
  id: string;
  number: string;
  date: string;
  description: string;
  periodId: string;
  periodName: string;
  status: "DRAFT" | "POSTED" | "CANCELLED";
  totalDebit: number;
  totalCredit: number;
  createdById: string;
  createdByName: string;
  items: JournalEntryItem[];
  createdAt: string;
  updatedAt: string;
}

interface JournalEntryItem {
  id: string;
  accountId: string;
  accountName: string;
  accountCode: string;
  debit: number;
  credit: number;
  description: string;
}

interface Account {
  id: string;
  code: string;
  name: string;
  type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE";
}

interface Period {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
}

// Mock data
const mockAccounts: Account[] = [
  { id: "1101", code: "1101", name: "چکهای دریافتنی", type: "ASSET" },
  { id: "1201", code: "1201", name: "حسابهای دریافتنی", type: "ASSET" },
  { id: "2101", code: "2101", name: "حسابهای پرداختنی", type: "LIABILITY" },
  { id: "3101", code: "3101", name: "صندوق", type: "ASSET" },
  { id: "3201", code: "3201", name: "بانک", type: "ASSET" },
  { id: "4101", code: "4101", name: "فروش کالا", type: "REVENUE" },
  { id: "5101", code: "5101", name: "خرید کالا", type: "EXPENSE" },
  { id: "5201", code: "5201", name: "هزینه‌های اداری", type: "EXPENSE" },
  { id: "5301", code: "5301", name: "هزینه‌های فروش", type: "EXPENSE" },
];

const mockPeriods: Period[] = [
  { id: "1", name: "دی 1403", startDate: "2024-12-01", endDate: "2024-12-31", isClosed: false },
  { id: "2", name: "آذر 1403", startDate: "2024-11-01", endDate: "2024-11-30", isClosed: false },
  { id: "3", name: "آبان 1403", startDate: "2024-10-01", endDate: "2024-10-31", isClosed: true },
];

const statusOptions = [
  { value: "DRAFT", label: "پیش‌نویس", color: "secondary" },
  { value: "POSTED", label: "ثبت شده", color: "default" },
  { value: "CANCELLED", label: "لغو شده", color: "destructive" },
];

export function JournalManagement() {
  const [activeTab, setActiveTab] = useState("entries");
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [entryItems, setEntryItems] = useState([
    { accountId: "", debit: "", credit: "", description: "" },
    { accountId: "", debit: "", credit: "", description: "" },
  ]);

  const entryForm = useForm<JournalEntryFormData>({
    resolver: zodResolver(journalEntrySchema),
    defaultValues: {
      number: "",
      date: new Date().toISOString().split('T')[0],
      description: "",
      periodId: "",
      items: entryItems,
    },
  });

  // Load journal entries
  useEffect(() => {
    loadJournalEntries();
  }, []);

  const loadJournalEntries = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/journal-entries');
      const result = await response.json();
      if (result.success) {
        setJournalEntries(result.data);
      }
    } catch (error) {
      toast.error("خطا در دریافت لیست اسناد حسابداری");
    } finally {
      setLoading(false);
    }
  };

  const addEntryItem = () => {
    setEntryItems([...entryItems, { accountId: "", debit: "", credit: "", description: "" }]);
  };

  const removeEntryItem = (index: number) => {
    if (entryItems.length > 2) {
      setEntryItems(entryItems.filter((_, i) => i !== index));
    }
  };

  const updateEntryItem = (index: number, field: string, value: string) => {
    const newItems = [...entryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    setEntryItems(newItems);
  };

  const getTotalDebit = () => {
    return entryItems.reduce((sum, item) => sum + (parseFloat(item.debit) || 0), 0);
  };

  const getTotalCredit = () => {
    return entryItems.reduce((sum, item) => sum + (parseFloat(item.credit) || 0), 0);
  };

  const isBalanced = () => {
    return Math.abs(getTotalDebit() - getTotalCredit()) < 0.01;
  };

  const getStatusBadge = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return (
      <Badge variant={statusOption?.color as any || "secondary"}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const onEntrySubmit = async (data: JournalEntryFormData) => {
    if (!isBalanced()) {
      toast.error("مجموع بدهکار و بستانکار باید برابر باشند");
      return;
    }

    const hasEmptyItems = entryItems.some(item => !item.accountId || (!item.debit && !item.credit));
    if (hasEmptyItems) {
      toast.error("لطفا تمام آیتم‌ها را تکمیل کنید");
      return;
    }

    const hasDebit = entryItems.some(item => parseFloat(item.debit) > 0);
    const hasCredit = entryItems.some(item => parseFloat(item.credit) > 0);
    if (!hasDebit || !hasCredit) {
      toast.error("حداقل یک آیتم بدهکار و یک آیتم بستانکار الزامی است");
      return;
    }

    try {
      const payload = {
        ...data,
        items: entryItems,
      };

      const url = editingEntry ? `/api/journal-entries/${editingEntry.id}` : '/api/journal-entries';
      const method = editingEntry ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(editingEntry ? "سند حسابداری با موفقیت ویرایش شد" : "سند حسابداری با موفقیت ثبت شد");
        entryForm.reset();
        setEntryItems([
          { accountId: "", debit: "", credit: "", description: "" },
          { accountId: "", debit: "", credit: "", description: "" },
        ]);
        setEditingEntry(null);
        loadJournalEntries();
      } else {
        toast.error(result.error || "خطا در ثبت سند حسابداری");
      }
    } catch (error) {
      toast.error("خطا در ثبت سند حسابداری");
    }
  };

  const editEntry = (entry: JournalEntry) => {
    setEditingEntry(entry);
    const items = entry.items.map(item => ({
      accountId: item.accountId,
      debit: item.debit.toString(),
      credit: item.credit.toString(),
      description: item.description,
    }));
    setEntryItems(items);
    
    entryForm.reset({
      number: entry.number,
      date: entry.date,
      description: entry.description,
      periodId: entry.periodId,
      items: items,
    });
  };

  const deleteEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/journal-entries/${entryId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (result.success) {
        toast.success("سند حسابداری با موفقیت حذف شد");
        loadJournalEntries();
      } else {
        toast.error(result.error || "خطا در حذف سند حسابداری");
      }
    } catch (error) {
      toast.error("خطا در حذف سند حسابداری");
    }
  };

  const postEntry = async (entryId: string) => {
    try {
      const response = await fetch(`/api/journal-entries/${entryId}`, {
        method: 'POST',
      });

      const result = await response.json();

      if (result.success) {
        toast.success("سند حسابداری با موفقیت ثبت نهایی شد");
        loadJournalEntries();
      } else {
        toast.error(result.error || "خطا در ثبت نهایی سند حسابداری");
      }
    } catch (error) {
      toast.error("خطا در ثبت نهایی سند حسابداری");
    }
  };

  const calculateStats = () => {
    const totalEntries = journalEntries.length;
    const draftEntries = journalEntries.filter(e => e.status === "DRAFT").length;
    const postedEntries = journalEntries.filter(e => e.status === "POSTED").length;
    const totalDebit = journalEntries.reduce((sum, e) => sum + e.totalDebit, 0);
    const totalCredit = journalEntries.reduce((sum, e) => sum + e.totalCredit, 0);

    return { totalEntries, draftEntries, postedEntries, totalDebit, totalCredit };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6" dir="rtl">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entries">اسناد حسابداری</TabsTrigger>
          <TabsTrigger value="chart">جدول حساب‌ها</TabsTrigger>
          <TabsTrigger value="reports">گزارشات</TabsTrigger>
        </TabsList>

        <TabsContent value="entries" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کل اسناد</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalEntries}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">پیش‌نویس</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.draftEntries}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">ثبت شده</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.postedEntries}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مجموع بدهکار</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {stats.totalDebit.toLocaleString("fa-IR")}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">مجموع بستانکار</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">
                  {stats.totalCredit.toLocaleString("fa-IR")}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create/Edit Entry Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                {editingEntry ? "ویرایش سند حسابداری" : "ایجاد سند حسابداری جدید"}
              </CardTitle>
              <CardDescription>
                اطلاعات سند حسابداری را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...entryForm}>
                <form onSubmit={entryForm.handleSubmit(onEntrySubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={entryForm.control}
                      name="number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>شماره سند</FormLabel>
                          <FormControl>
                            <Input placeholder="س-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={entryForm.control}
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
                      control={entryForm.control}
                      name="periodId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>دوره مالی</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="دوره مالی را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {mockPeriods.map((period) => (
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
                  </div>

                  <FormField
                    control={entryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>توضیحات</FormLabel>
                        <FormControl>
                          <Textarea placeholder="توضیحات سند" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Entry Items */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">آیتم‌های سند</h3>
                      <Button type="button" variant="outline" size="sm" onClick={addEntryItem}>
                        <Plus className="h-4 w-4 ml-2" />
                        افزودن آیتم
                      </Button>
                    </div>
                    
                    {entryItems.map((item, index) => (
                      <Card key={index} className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                          <div>
                            <label className="text-sm font-medium">حساب</label>
                            <Select 
                              value={item.accountId} 
                              onValueChange={(value) => updateEntryItem(index, "accountId", value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="حساب را انتخاب کنید" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockAccounts.map((account) => (
                                  <SelectItem key={account.id} value={account.id}>
                                    {account.code} - {account.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className="text-sm font-medium">بدهکار</label>
                            <Input
                              type="number"
                              value={item.debit}
                              onChange={(e) => updateEntryItem(index, "debit", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">بستانکار</label>
                            <Input
                              type="number"
                              value={item.credit}
                              onChange={(e) => updateEntryItem(index, "credit", e.target.value)}
                              placeholder="0"
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium">توضیحات</label>
                            <Input
                              value={item.description}
                              onChange={(e) => updateEntryItem(index, "description", e.target.value)}
                              placeholder="توضیحات"
                            />
                          </div>
                          <div className="flex items-end">
                            {entryItems.length > 2 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeEntryItem(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>

                  {/* Balance Summary */}
                  <Card className="p-4">
                    <div className="flex justify-between items-center">
                      <div className="space-y-2">
                        <div className="flex justify-between gap-8">
                          <span>مجموع بدهکار:</span>
                          <span className="font-medium">{getTotalDebit().toLocaleString("fa-IR")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span>مجموع بستانکار:</span>
                          <span className="font-medium">{getTotalCredit().toLocaleString("fa-IR")}</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span>تفاوت:</span>
                          <span className={`font-medium ${isBalanced() ? "text-green-600" : "text-red-600"}`}>
                            {Math.abs(getTotalDebit() - getTotalCredit()).toLocaleString("fa-IR")}
                          </span>
                        </div>
                      </div>
                      <div className="text-center">
                        <div className={`text-lg font-bold ${isBalanced() ? "text-green-600" : "text-red-600"}`}>
                          {isBalanced() ? "موزون" : "ناموزون"}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2" />
                      {editingEntry ? "ویرایش سند" : "ایجاد سند"}
                    </Button>
                    {editingEntry && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingEntry(null);
                          entryForm.reset();
                          setEntryItems([
                            { accountId: "", debit: "", credit: "", description: "" },
                            { accountId: "", debit: "", credit: "", description: "" },
                          ]);
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

          {/* Entries List */}
          <Card>
            <CardHeader>
              <CardTitle>لیست اسناد حسابداری</CardTitle>
              <CardDescription>
                مدیریت اسناد حسابداری ثبت شده
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>شماره سند</TableHead>
                    <TableHead>تاریخ</TableHead>
                    <TableHead>توضیحات</TableHead>
                    <TableHead>دوره مالی</TableHead>
                    <TableHead>مجموع</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journalEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="font-medium">{entry.number}</TableCell>
                      <TableCell>{entry.date}</TableCell>
                      <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                      <TableCell>{entry.periodName}</TableCell>
                      <TableCell className="font-medium">
                        {entry.totalDebit.toLocaleString("fa-IR")}
                      </TableCell>
                      <TableCell>{getStatusBadge(entry.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editEntry(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {entry.status === "DRAFT" && (
                            <Button variant="ghost" size="sm" onClick={() => postEntry(entry.id)}>
                              <Send className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => deleteEntry(entry.id)}>
                            <Trash2 className="h-4 w-4" />
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

        <TabsContent value="chart" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>جدول حساب‌ها</CardTitle>
              <CardDescription>
                لیست حساب‌های حسابداری و کدهای آنها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>کد حساب</TableHead>
                    <TableHead>نام حساب</TableHead>
                    <TableHead>نوع حساب</TableHead>
                    <TableHead>وضعیت</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {account.type === "ASSET" && "دارایی"}
                          {account.type === "LIABILITY" && "بدهی"}
                          {account.type === "EQUITY" && "حقوق"}
                          {account.type === "REVENUE" && "درآمد"}
                          {account.type === "EXPENSE" && "هزینه"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default">فعال</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>گزارشات حسابداری</CardTitle>
              <CardDescription>
                گزارشات مالی و تحلیل اسناد حسابداری
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">گزارشات حسابداری</h3>
                <p className="text-gray-500">
                  بخش گزارشات حسابداری در حال توسعه می‌باشد
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}