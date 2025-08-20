# 📋 Project Context for LLMs

## Project Overview
**Persian Accounting System (حسابدار)** - A comprehensive accounting application built with modern web technologies, designed for Persian/Farsi users with full RTL (Right-to-Left) support.

## Tech Stack
- **Framework**: Next.js 15.3.5 with TypeScript
- **Styling**: Tailwind CSS v4 with OKLCH color space
- **UI Components**: shadcn/ui with Radix UI primitives  
- **Forms**: React Hook Form with Zod validation
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js v4
- **Icons**: Lucide React
- **Animations**: Tailwind CSS Animate + tw-animate-css
- **RTL Support**: tailwindcss-rtl plugin
- **Fonts**: Geist Sans & Geist Mono

## Project Structure
```
src/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # Root layout with RTL setup
│   ├── page.tsx           # Main dashboard page
│   ├── globals.css        # Global styles with RTL support
│   └── api/               # API routes for all modules
├── components/
│   ├── ui/                # Base UI components (shadcn/ui)
│   └── accounting/        # Business logic components
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and database
└── middleware.ts          # Authentication middleware
```

## Key Features
### Accounting Modules
1. **Dashboard (داشبورد)** - Financial overview and statistics
2. **Sales & Customers (فروش و مشتریان)** - Customer management and sales invoices
3. **Purchase Management (خرید و تأمین‌کنندگان)** - Supplier and purchase management
4. **Journal Entries (اسناد حسابداری)** - Accounting document management
5. **Receipts & Payments (دریافت‌ها و پرداخت‌ها)** - Cash flow management
6. **Check Management (مدیریت چک‌ها)** - Check tracking and clearance
7. **Bank Reconciliation (بانک و reconcile)** - Bank statement reconciliation
8. **Inventory (انبار و موجودی)** - Stock management and adjustments
9. **Payroll (حقوق و دستمزد)** - Employee salary management
10. **Accounting Closing (بستن حسابها)** - Period closing procedures
11. **Reports (گزارشات)** - Financial and operational reporting
12. **Settings (تنظیمات)** - System configuration

## Current Status
### ✅ Implemented
- Modern CSS architecture with Tailwind v4
- Complete UI component library
- All accounting module interfaces
- Basic RTL support structure
- Dark mode implementation
- Form validation with Zod
- TypeScript throughout

### 🔧 Needs Work  
- **324 RTL issues** requiring systematic fixes:
  - Icon positioning (ml-2 → ml-2 rtl:mr-2 rtl:ml-0)
  - Flex container direction (add rtl:flex-row-reverse)
  - Search input positioning
  - Table alignment
  - Form button layouts

## RTL Implementation Status
### Foundation (✅ Complete)
- HTML lang="fa" dir="rtl"
- tailwindcss-rtl plugin configured
- Global RTL CSS utilities
- Color system with OKLCH

### Application Layer (🔧 Needs Systematic Fixes)
- **Critical (45 issues)**: Main layout, header, navigation
- **High (89 issues)**: Button icons, action elements  
- **Medium (124 issues)**: Search inputs, table headers
- **Low (66 issues)**: Minor positioning adjustments

## Persian Language Support
### Text Content
- All UI text in Persian/Farsi
- Persian number formatting (۱۲۳۴۵۶۷۸۹۰)
- Persian date formatting (۱۴۰۳/۱۲/۰۱)
- Accounting terminology in Persian

### RTL Layout Requirements
- Right-to-left reading flow
- Icon positioning on correct side
- Form layouts mirrored
- Table content alignment
- Navigation menu direction

## Development Guidelines

### CSS Architecture
- Use CVA (Class Variance Authority) for component variants
- Leverage OKLCH color space for consistent colors
- Follow Tailwind v4 patterns with @theme inline
- Implement proper RTL classes systematically

### Component Patterns
```tsx
// Button with icon (RTL-ready)
<Button>
  <Icon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
  متن فارسی
</Button>

// Card header (RTL-ready)
<CardHeader className="flex flex-row items-center justify-between rtl:flex-row-reverse">
  <CardTitle>عنوان</CardTitle>
  <Button>عملیات</Button>
</CardHeader>

// Search input (RTL-ready)
<div className="relative">
  <Search className="absolute left-3 rtl:right-3 rtl:left-auto" />
  <Input className="pl-10 rtl:pr-10 rtl:pl-0" placeholder="جستجو..." />
</div>
```

### Form Validation
- All forms use react-hook-form + Zod
- Persian error messages
- RTL form layouts
- Proper field alignment

### Data Handling
- Persian number formatting
- Jalali calendar support (planned)
- Currency formatting (Toman)
- Persian text search

## Common Issues & Solutions

### RTL Layout Problems
**Problem**: Icons appear on wrong side
```tsx
// Wrong
<Save className="h-4 w-4 ml-2" />

// Correct  
<Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
```

**Problem**: Flex containers don't reverse
```tsx
// Wrong
<div className="flex justify-between">

// Correct
<div className="flex justify-between rtl:flex-row-reverse">
```

**Problem**: Search inputs position incorrectly
```tsx
// Wrong
<Search className="absolute left-3" />
<Input className="pl-10" />

// Correct
<Search className="absolute left-3 rtl:right-3 rtl:left-auto" />
<Input className="pl-10 rtl:pr-10 rtl:pl-0" />
```

### Performance Considerations
- Tailwind purges unused RTL classes automatically
- OKLCH colors provide better performance than RGB
- CVA optimizes component variants at build time
- Next.js 15 optimizations for Persian text rendering

## API Structure
RESTful API design with proper Persian content handling:
- `/api/customers` - Customer management
- `/api/invoices` - Invoice operations  
- `/api/payments` - Payment processing
- `/api/reports` - Report generation
- All responses support Persian text encoding

## Database Schema
Prisma-based schema with Persian text support:
- Proper UTF-8 encoding for Persian text
- Persian naming conventions in display
- Jalali date handling (planned)
- Currency fields for Rial/Toman

## Testing Strategy
### RTL Testing Checklist
1. Visual inspection with dir="rtl"
2. Icon positioning verification
3. Form submission flow testing
4. Table alignment validation
5. Mobile responsive RTL testing

### Accessibility
- Proper ARIA labels in Persian
- Keyboard navigation RTL-aware
- Screen reader Persian support
- Color contrast compliance

## Deployment Notes
- Static export compatible
- Persian font loading optimization
- RTL CSS bundle optimization
- Persian SEO considerations

## Future Enhancements
1. **Jalali Calendar Integration** - Persian calendar system
2. **Advanced Reporting** - Charts with Persian labels
3. **Multi-tenancy** - Support for multiple companies
4. **Mobile App** - React Native with RTL support
5. **Offline Mode** - PWA with Persian caching

## Quick Start for LLMs
When working on this project:

1. **Always consider RTL** - Every layout change needs RTL classes
2. **Use Persian text** - All user-facing content in Farsi
3. **Follow established patterns** - Check CSS_ARCHITECTURE.md and RTL_PATTERNS.md
4. **Test systematically** - RTL issues affect entire layouts
5. **Maintain consistency** - Follow CVA patterns for components

## Key Files for Reference
- `CSS_ARCHITECTURE.md` - Complete CSS system documentation
- `RTL_PATTERNS.md` - RTL implementation patterns  
- `src/app/globals.css` - Global styles and RTL utilities
- `tailwind.config.ts` - Tailwind configuration
- `src/components/ui/` - Base component library
- `src/components/accounting/` - Business logic components

This context enables any LLM to understand the project structure, current status, and development patterns for effective contributions.