"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SalesCustomers } from "@/components/accounting/sales-customers";
import { ReceiptsPayments } from "@/components/accounting/receipts-payments";
import { AccountingClosing } from "@/components/accounting/accounting-closing";
import { CheckManagement } from "@/components/accounting/check-management";
import { BankReconciliation } from "@/components/accounting/bank-reconciliation";
import { InventoryAdjustment } from "@/components/accounting/inventory-adjustment";
import { PayrollManagement } from "@/components/accounting/payroll-management";
import { PurchaseManagement } from "@/components/accounting/purchase-management";
import { JournalManagement } from "@/components/accounting/journal-management";
import { Reports } from "@/components/accounting/reports";
import { Settings } from "@/components/accounting/settings";
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  Calculator, 
  Banknote, 
  Package, 
  Settings as SettingsIcon,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Receipt,
  CreditCard,
  Building2,
  UserCheck
} from "lucide-react";

export default function Home() {
  const [activeModule, setActiveModule] = useState("dashboard");

  const modules = [
    { id: "dashboard", name: "داشبورد", icon: BarChart3 },
    { id: "sales", name: "فروش و مشتریان", icon: ShoppingCart },
    { id: "purchases", name: "خرید و تأمین‌کنندگان", icon: Package },
    { id: "journal", name: "اسناد حسابداری", icon: FileText },
    { id: "receipts", name: "دریافت‌ها و پرداخت‌ها", icon: Receipt },
    { id: "checks", name: "مدیریت چک‌ها", icon: CreditCard },
    { id: "banking", name: "بانک و reconcile", icon: Building2 },
    { id: "inventory", name: "انبار و موجودی", icon: Package },
    { id: "payroll", name: "حقوق و دستمزد", icon: UserCheck },
    { id: "closing", name: "بستن حسابها", icon: Calculator },
    { id: "reports", name: "گزارشات", icon: FileText },
    { id: "settings", name: "تنظیمات", icon: SettingsIcon },
  ];

  const stats = [
    { title: "کل فروش", value: "۱۲۵,۰۰۰,۰۰۰", change: "+۱۲%", icon: TrendingUp },
    { title: "مشتریان", value: "۸۴", change: "+۵", icon: Users },
    { title: "چک‌های در انتظار", value: "۱۲", change: "-۳", icon: Clock },
    { title: "موجودی انبار", value: "۲۳۴", change: "+۱۸", icon: Package },
  ];

  const recentTransactions = [
    { id: 1, type: "فروش", amount: "۵,۰۰۰,۰۰۰", customer: "شرکت الف", date: "۱۴۰۳/۱۲/۰۱", status: "completed" },
    { id: 2, type: "دریافت", amount: "۲,۰۰۰,۰۰۰", customer: "فروشگاه ب", date: "۱۴۰۳/۱۲/۰۲", status: "pending" },
    { id: 3, type: "خرید", amount: "۱,۵۰۰,۰۰۰", customer: "تأمین‌کننده ج", date: "۱۴۰۳/۱۲/۰۳", status: "completed" },
    { id: 4, type: "پرداخت", amount: "۸۰۰,۰۰۰", customer: "شرکت د", date: "۱۴۰۳/۱۲/۰۴", status: "bounced" },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default" className="bg-green-500">تکمیل شده</Badge>;
      case "pending":
        return <Badge variant="secondary">در انتظار</Badge>;
      case "bounced":
        return <Badge variant="destructive">برگشت خورده</Badge>;
      default:
        return <Badge variant="outline">نامشخص</Badge>;
    }
  };

  const renderModuleContent = () => {
    switch (activeModule) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-green-600">{stat.change}</span> نسبت به ماه گذشته
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>آخرین تراکنش‌ها</CardTitle>
                  <CardDescription>آخرین فعالیت‌های مالی سیستم</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            {transaction.type === "فروش" && <ShoppingCart className="h-4 w-4" />}
                            {transaction.type === "دریافت" && <Banknote className="h-4 w-4" />}
                            {transaction.type === "خرید" && <Package className="h-4 w-4" />}
                            {transaction.type === "پرداخت" && <CreditCard className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{transaction.type}</p>
                            <p className="text-sm text-muted-foreground">{transaction.customer}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{transaction.amount}</span>
                          {getStatusBadge(transaction.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>خلاصه وضعیت</CardTitle>
                  <CardDescription>بررسی سریع وضعیت مالی</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>فاکتورهای پرداخت شده</span>
                      </div>
                      <span className="font-medium text-green-600">۱۲۴</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span>فاکتورهای در انتظار</span>
                      </div>
                      <span className="font-medium text-yellow-600">۲۳</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        <span>چک‌های برگشتی</span>
                      </div>
                      <span className="font-medium text-red-600">۵</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span>رشد فروش</span>
                      </div>
                      <span className="font-medium text-blue-600">۱۲٪</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case "sales":
        return <SalesCustomers />;

      case "purchases":
        return <PurchaseManagement />;

      case "journal":
        return <JournalManagement />;

      case "receipts":
        return <ReceiptsPayments />;

      case "closing":
        return <AccountingClosing />;

      case "checks":
        return <CheckManagement />;

      case "banking":
        return <BankReconciliation />;

      case "inventory":
        return <InventoryAdjustment />;

      case "payroll":
        return <PayrollManagement />;

      case "reports":
        return <Reports />;

      case "settings":
        return <Settings />;

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>ماژول در حال توسعه</CardTitle>
              <CardDescription>این ماژول در حال توسعه می‌باشد</CardDescription>
            </CardHeader>
            <CardContent>
              <p>محتوای مربوط به {modules.find(m => m.id === activeModule)?.name} به زودی اضافه خواهد شد.</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calculator className="h-8 w-8 text-blue-600" />
              </div>
              <div className="mr-4">
                <h1 className="text-xl font-semibold text-gray-900">سیستم حسابداری حسابدار</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                راهنما
              </Button>
              <Button variant="outline" size="sm">
                خروج
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="text-lg font-semibold mb-4">ماژول‌ها</h2>
              <div className="space-y-2">
                {modules.map((module) => (
                  <Button
                    key={module.id}
                    variant={activeModule === module.id ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveModule(module.id)}
                  >
                    <module.icon className="h-4 w-4 mr-2" />
                    {module.name}
                  </Button>
                ))}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">
                  {modules.find(m => m.id === activeModule)?.name}
                </h1>
                <p className="text-gray-600 mt-1">
                  {activeModule === "dashboard" && "نمای کلی از وضعیت مالی و فعالیت‌های اخیر"}
                  {activeModule === "sales" && "مدیریت مشتریان و فاکتورهای فروش"}
                  {activeModule === "purchases" && "مدیریت تأمین‌کنندگان و فاکتورهای خرید"}
                  {activeModule === "journal" && "ثبت و مدیریت اسناد حسابداری"}
                  {activeModule === "receipts" && "ثبت و مدیریت دریافت‌ها و پرداخت‌ها"}
                  {activeModule === "closing" && "بستن حسابهای دوره‌های مالی و گزارشات اختتامیه"}
                  {activeModule === "checks" && "مدیریت چک‌ها، تسویه و پیگیری"}
                  {activeModule === "banking" && "Reconciliation بانکی و مدیریت مغایرت‌ها"}
                  {activeModule === "inventory" && "مدیریت انبار، تنظیمات موجودی و گزارشات"}
                  {activeModule === "payroll" && "محاسبات حقوق، پاداش و مرخصی کارمندان"}
                </p>
              </div>
              {renderModuleContent()}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}