import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";

const vazir = Vazirmatn({
  variable: "--font-vazir",
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "نرم افزار حسابداری جامع",
  description: "نرم افزار حسابداری جامع با پشتیبانی از راست به چپ و زبان فارسی",
  keywords: ["حسابداری", "نرم افزار حسابداری", "مدیریت مالی", "صورتحساب", "انبار"],
  authors: [{ name: "تیم توسعه حسابداری" }],
  openGraph: {
    title: "نرم افزار حسابداری جامع",
    description: "نرم افزار حسابداری جامع با پشتیبانی از راست به چپ و زبان فارسی",
    siteName: "حسابداری جامع",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" suppressHydrationWarning>
      <body
        className={`${vazir.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
