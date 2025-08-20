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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { 
  Settings, 
  Users, 
  Shield, 
  Bell, 
  Database, 
  Save, 
  Edit, 
  Trash2,
  Key,
  Mail,
  Phone
} from "lucide-react";
import { toast } from "sonner";

const userSchema = z.object({
  name: z.string().min(1, "نام کاربر الزامی است"),
  email: z.string().email("ایمیل معتبر وارد کنید"),
  role: z.string().min(1, "نقش کاربر الزامی است"),
  phone: z.string().optional(),
  status: z.boolean().default(true),
});

const systemSettingsSchema = z.object({
  companyName: z.string().min(1, "نام شرکت الزامی است"),
  companyPhone: z.string().optional(),
  companyEmail: z.string().email().optional().or(z.literal("")),
  companyAddress: z.string().optional(),
  fiscalYear: z.string().min(1, "سال مالی الزامی است"),
  currency: z.string().min(1, "واحد پول الزامی است"),
  autoBackup: z.boolean().default(true),
  notificationEnabled: z.boolean().default(true),
});

type UserFormData = z.infer<typeof userSchema>;
type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>;

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  status: boolean;
  lastLogin: string;
}

interface SystemSetting {
  key: string;
  value: string;
  description: string;
}

const roles = [
  { value: "ADMIN", label: "مدیر سیستم", description: "دسترسی کامل به تمام بخش‌ها" },
  { value: "MANAGER", label: "مدیر", description: "دسترسی به گزارشات و تأیید اسناد" },
  { value: "ACCOUNTANT", label: "حسابدار", description: "دسترسی به بخش حسابداری" },
  { value: "EMPLOYEE", label: "کارمند", description: "دسترسی محدود به بخش‌های مشخص" },
];

const currencies = [
  { value: "IRR", label: "ریال ایران" },
  { value: "IRT", label: "تومان ایران" },
  { value: "USD", label: "دلار آمریکا" },
  { value: "EUR", label: "یورو" },
];

const mockUsers: User[] = [
  {
    id: "1",
    name: "علی رضایی",
    email: "ali@example.com",
    role: "ADMIN",
    phone: "09123456789",
    status: true,
    lastLogin: "1403/12/01 14:30",
  },
  {
    id: "2",
    name: "مریم احمدی",
    email: "maryam@example.com",
    role: "ACCOUNTANT",
    phone: "09198765432",
    status: true,
    lastLogin: "1403/12/01 10:15",
  },
  {
    id: "3",
    name: "رضا محمدی",
    email: "reza@example.com",
    role: "MANAGER",
    phone: "09111223344",
    status: true,
    lastLogin: "1403/11/30 16:45",
  },
  {
    id: "4",
    name: "سارا حسینی",
    email: "sara@example.com",
    role: "EMPLOYEE",
    status: false,
    lastLogin: "1403/11/25 09:20",
  },
];

const mockSystemSettings: SystemSetting[] = [
  { key: "companyName", value: "شرکت حسابداری نمونه", description: "نام شرکت" },
  { key: "companyPhone", value: "021-12345678", description: "تلفن شرکت" },
  { key: "companyEmail", value: "info@example.com", description: "ایمیل شرکت" },
  { key: "fiscalYear", value: "1403", description: "سال مالی جاری" },
  { key: "currency", value: "IRT", description: "واحد پول پیش‌فرض" },
];

const rolePermissions = {
  ADMIN: ["دسترسی کامل به تمام بخش‌ها", "مدیریت کاربران", "تنظیمات سیستم", "گزارشات کامل"],
  MANAGER: ["مشاهده گزارشات", "تأیید اسناد", "مدیریت مشتریان و تأمین‌کنندگان", "دسترسی محدود به تنظیمات"],
  ACCOUNTANT: ["ثبت اسناد حسابداری", "مدیریت دریافت و پرداخت", "صدور فاکتور", "گزارشات مالی"],
  EMPLOYEE: ["ثبت پیش‌فاکتور", "مدیریت انبار", "مشاهده گزارشات محدود", "دسترسی به اطلاعات شخصی"],
};

export function Settings() {
  const [activeTab, setActiveTab] = useState("users");
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "EMPLOYEE",
      phone: "",
      status: true,
    },
  });

  const systemSettingsForm = useForm<SystemSettingsFormData>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      companyName: "شرکت حسابداری نمونه",
      companyPhone: "021-12345678",
      companyEmail: "info@example.com",
      companyAddress: "",
      fiscalYear: "1403",
      currency: "IRT",
      autoBackup: true,
      notificationEnabled: true,
    },
  });

  const onUserSubmit = (data: UserFormData) => {
    console.log("User Data:", data);
    toast.success(editingUser ? "کاربر با موفقیت ویرایش شد" : "کاربر جدید با موفقیت ثبت شد");
    userForm.reset();
    setEditingUser(null);
  };

  const onSystemSettingsSubmit = (data: SystemSettingsFormData) => {
    console.log("System Settings Data:", data);
    toast.success("تنظیمات سیستم با موفقیت ذخیره شد");
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    userForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      status: user.status,
    });
  };

  const toggleUserStatus = (userId: string, currentStatus: boolean) => {
    toast.success(`وضعیت کاربر ${currentStatus ? 'غیرفعال' : 'فعال'} شد`);
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getRoleDescription = (role: string) => {
    return roles.find(r => r.value === role)?.description || "";
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">کاربران</TabsTrigger>
          <TabsTrigger value="roles">نقش‌ها و دسترسی‌ها</TabsTrigger>
          <TabsTrigger value="system">تنظیمات سیستم</TabsTrigger>
          <TabsTrigger value="security">امنیت</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                {editingUser ? "ویرایش کاربر" : "ایجاد کاربر جدید"}
              </CardTitle>
              <CardDescription>
                مدیریت کاربران سیستم و دسترسی‌های آن‌ها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام کاربر</FormLabel>
                          <FormControl>
                            <Input placeholder="نام کاربر" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ایمیل</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="user@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={userForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تلفن</FormLabel>
                          <FormControl>
                            <Input placeholder="09123456789" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={userForm.control}
                      name="role"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نقش</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="نقش کاربر را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {roles.map((role) => (
                                <SelectItem key={role.value} value={role.value}>
                                  {role.label}
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
                    control={userForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>وضعیت فعال</FormLabel>
                          <FormDescription className="text-sm">
                            کاربر می‌تواند به سیستم وارد شود
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2" />
                      {editingUser ? "ویرایش کاربر" : "ایجاد کاربر"}
                    </Button>
                    {editingUser && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingUser(null);
                          userForm.reset();
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

          <Card>
            <CardHeader>
              <CardTitle>لیست کاربران</CardTitle>
              <CardDescription>
                مدیریت کاربران ثبت شده در سیستم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام</TableHead>
                    <TableHead>ایمیل</TableHead>
                    <TableHead>نقش</TableHead>
                    <TableHead>تلفن</TableHead>
                    <TableHead>وضعیت</TableHead>
                    <TableHead>آخرین ورود</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <div>
                          <div>{getRoleLabel(user.role)}</div>
                          <div className="text-sm text-muted-foreground">
                            {getRoleDescription(user.role)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant={user.status ? "default" : "secondary"}>
                          {user.status ? "فعال" : "غیرفعال"}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => editUser(user)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleUserStatus(user.id, user.status)}
                          >
                            <Key className="h-4 w-4" />
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

        <TabsContent value="roles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                نقش‌ها و دسترسی‌ها
              </CardTitle>
              <CardDescription>
                مدیریت نقش‌های کاربری و سطح دسترسی‌ها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {roles.map((role) => (
                  <Card key={role.value}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{role.label}</span>
                        <Badge variant="outline">{role.value}</Badge>
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">دسترسی‌ها:</h4>
                        <ul className="space-y-1">
                          {rolePermissions[role.value as keyof typeof rolePermissions].map((permission, index) => (
                            <li key={index} className="text-sm flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              {permission}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                تنظیمات سیستم
              </CardTitle>
              <CardDescription>
                تنظیمات کلی سیستم حسابداری
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemSettingsForm}>
                <form onSubmit={systemSettingsForm.handleSubmit(onSystemSettingsSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={systemSettingsForm.control}
                      name="companyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>نام شرکت</FormLabel>
                          <FormControl>
                            <Input placeholder="نام شرکت" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemSettingsForm.control}
                      name="companyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>تلفن شرکت</FormLabel>
                          <FormControl>
                            <Input placeholder="021-12345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={systemSettingsForm.control}
                      name="companyEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ایمیل شرکت</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="info@company.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemSettingsForm.control}
                      name="fiscalYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>سال مالی</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="سال مالی را انتخاب کنید" />
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
                  </div>
                  <FormField
                    control={systemSettingsForm.control}
                    name="companyAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>آدرس شرکت</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="آدرس شرکت..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={systemSettingsForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>واحد پول</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="واحد پول را انتخاب کنید" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {currencies.map((currency) => (
                                <SelectItem key={currency.value} value={currency.value}>
                                  {currency.label}
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
                      control={systemSettingsForm.control}
                      name="autoBackup"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>پشتیبان‌گیری خودکار</FormLabel>
                            <FormDescription className="text-sm">
                              تهیه نسخه پشتیبان به صورت خودکار
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={systemSettingsForm.control}
                      name="notificationEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>اعلان‌ها</FormLabel>
                            <FormDescription className="text-sm">
                              فعال‌سازی اعلان‌های سیستم
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Save className="h-4 w-4 ml-2" />
                      ذخیره تنظیمات
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                امنیت و حریم خصوصی
              </CardTitle>
              <CardDescription>
                تنظیمات امنیتی و مدیریت دسترسی‌ها
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">احراز هویت دو مرحله‌ای</h4>
                    <p className="text-sm text-muted-foreground">
                      افزایش امنیت ورود به سیستم
                    </p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">لاگین فعالیت‌ها</h4>
                    <p className="text-sm text-muted-foreground">
                      ثبت تمام فعالیت‌های کاربران
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">قفل حساب پس از تلاش‌های ناموفق</h4>
                    <p className="text-sm text-muted-foreground">
                      قفل خودکار حساب پس از ۵ تلاش ناموفق
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">تغییر رمز عبور دوره‌ای</h4>
                    <p className="text-sm text-muted-foreground">
                      درخواست تغییر رمز عبور هر ۹۰ روز
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}