"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, 
  Receipt, 
  Package, 
  Users, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  FileText,
  Settings as SettingsIcon,
  Bell,
  Search,
  Menu
} from "lucide-react";
import { Sidebar } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { JournalEntryForm } from "@/components/accounting/journal-entry-form";
import { ReceiptsPayments } from "@/components/accounting/receipts-payments";
import { InventorySuppliers } from "@/components/accounting/inventory-suppliers";
import { SalesCustomers } from "@/components/accounting/sales-customers";
import { PayrollEmployees } from "@/components/accounting/payroll-employees";
import { Reports } from "@/components/accounting/reports";
import { Settings } from "@/components/accounting/settings";

export default function AccountingDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");

  const financialStats = [
    {
      title: "کل درآمد",
      value: "۱۲۵,۰۰۰,۰۰۰ تومان",
      change: "+۱۲٪",
      trend: "up",
      icon: TrendingUp,
    },
    {
      title: "کل هزینه‌ها",
      value: "۸۵,۰۰۰,۰۰۰ تومان",
      change: "-۵٪",
      trend: "down",
      icon: TrendingDown,
    },
    {
      title: "سود خالص",
      value: "۴۰,۰۰۰,۰۰۰ تومان",
      change: "+۲۵٪",
      trend: "up",
      icon: DollarSign,
    },
    {
      title: "تراکنش‌ها",
      value: "۱,۲۳۴",
      change: "+۸٪",
      trend: "up",
      icon: FileText,
    },
  ];

  const recentTransactions = [
    {
      id: 1,
      description: "فاکتور فروش به مشتری الف",
      amount: "۵,۰۰۰,۰۰۰ تومان",
      date: "۱۴۰۳/۱۲/۰۱",
      type: "درآمد",
      status: "تکمیل شده",
    },
    {
      id: 2,
      description: "خرید مواد اولیه",
      amount: "۲,۰۰۰,۰۰۰ تومان",
      date: "۱۴۰۳/۱۲/۰۲",
      type: "هزینه",
      status: "تکمیل شده",
    },
    {
      id: 3,
      description: "دریافت چک از مشتری ب",
      amount: "۱۰,۰۰۰,۰۰۰ تومان",
      date: "۱۴۰۳/۱۲/۰۳",
      type: "درآمد",
      status: "در انتظار",
    },
  ];

  const menuItems = [
    { id: "dashboard", label: "داشبورد", icon: TrendingUp },
    { id: "accounting", label: "حسابداری", icon: Calculator },
    { id: "receipts", label: "دریافت و پرداخت", icon: Receipt },
    { id: "inventory", label: "انبار و تأمین‌کنندگان", icon: Package },
    { id: "sales", label: "فروش و مشتریان", icon: Users },
    { id: "payroll", label: "حقوق و دستمزد", icon: DollarSign },
    { id: "reports", label: "گزارشات", icon: FileText },
    { id: "settings", label: "تنظیمات", icon: SettingsIcon },
  ];

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full rtl">
        <Sidebar className="w-64 border-l sidebar-rtl" side="right">
          <div className="p-6 text-right rtl-align-right">
            <h2 className="text-xl font-bold mb-6 rtl-align-right">حسابداری جامع</h2>
            <nav className="space-y-2 nav-rtl">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors btn-rtl ${
                      activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="rtl-align-right">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </Sidebar>

        <SidebarInset className="flex-1">
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 header-rtl">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex items-center gap-2">
                <Menu className="h-5 w-5" />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold rtl-align-right">
                    {menuItems.find(item => item.id === activeTab)?.label}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon">
                    <Search className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Bell className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 p-6 overflow-auto min-h-0 main-rtl">
            {activeTab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {financialStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <Card key={stat.title} className="card-rtl">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium rtl-align-right">
                            {stat.title}
                          </CardTitle>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold persian-numbers rtl-align-right">
                            {stat.value}
                          </div>
                          <p className="text-xs text-muted-foreground rtl-align-right">
                            <span
                              className={
                                stat.trend === "up"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {stat.change}
                            </span>{" "}
                            نسبت به ماه گذشته
                          </p>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                  <Card className="col-span-4 card-rtl">
                    <CardHeader>
                      <CardTitle className="rtl-align-right">تراکنش‌های اخیر</CardTitle>
                      <CardDescription className="rtl-align-right">
                        آخرین تراکنش‌های ثبت شده در سیستم
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentTransactions.map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-2 h-2 rounded-full bg-green-500"></div>
                              <div>
                                <p className="font-medium rtl-align-right">
                                  {transaction.description}
                                </p>
                                <p className="text-sm text-muted-foreground rtl-align-right">
                                  {transaction.date}
                                </p>
                              </div>
                            </div>
                            <div>
                              <p className="font-medium persian-numbers rtl-align-left">
                                {transaction.amount}
                              </p>
                              <Badge
                                variant={
                                  transaction.status === "تکمیل شده"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs badge-rtl"
                              >
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="col-span-3 card-rtl">
                    <CardHeader>
                      <CardTitle className="rtl-align-right">خلاصه وضعیت</CardTitle>
                      <CardDescription className="rtl-align-right">
                        نمای کلی از وضعیت مالی شرکت
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="rtl-align-right">موجودی نقدی</span>
                          <span className="font-medium persian-numbers rtl-align-left">
                            ۲۵,۰۰۰,۰۰۰ تومان
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="rtl-align-right">حساب‌های دریافتنی</span>
                          <span className="font-medium persian-numbers rtl-align-left">
                            ۱۵,۰۰۰,۰۰۰ تومان
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="rtl-align-right">حساب‌های پرداختنی</span>
                          <span className="font-medium persian-numbers rtl-align-left">
                            ۸,۰۰۰,۰۰۰ تومان
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="rtl-align-right">ارزش انبار</span>
                          <span className="font-medium persian-numbers rtl-align-left">
                            ۳۲,۰۰۰,۰۰۰ تومان
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === "accounting" && (
              <div className="space-y-6">
                <JournalEntryForm />
              </div>
            )}

            {activeTab === "receipts" && (
              <div className="space-y-6">
                <ReceiptsPayments />
              </div>
            )}

            {activeTab === "inventory" && (
              <div className="space-y-6">
                <InventorySuppliers />
              </div>
            )}

            {activeTab === "sales" && (
              <div className="space-y-6">
                <SalesCustomers />
              </div>
            )}

            {activeTab === "payroll" && (
              <div className="space-y-6">
                <PayrollEmployees />
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-6">
                <Reports />
              </div>
            )}

            {activeTab === "settings" && (
              <div className="space-y-6">
                <Settings />
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}