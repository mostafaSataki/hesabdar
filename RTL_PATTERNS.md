# 🌍 RTL (Right-to-Left) Implementation Guide

## Project RTL Configuration

### HTML Setup
```html
<html lang="fa" dir="rtl">
```

### Tailwind Configuration
```typescript
// tailwind.config.ts
plugins: [tailwindcssAnimate, tailwindcssRtl]
```

### Global RTL CSS
```css
/* globals.css - Already implemented */
html[dir="rtl"] {
  text-align: right;
}

html[dir="rtl"] input,
html[dir="rtl"] textarea {
  text-align: right;
}

html[dir="rtl"] .text-left {
  text-align: right;
}

html[dir="rtl"] .text-right {
  text-align: left;
}

html[dir="rtl"] .justify-start {
  justify-content: flex-end;
}

html[dir="rtl"] .justify-end {
  justify-content: flex-start;
}

html[dir="rtl"] .space-x-1 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 0;
  margin-right: 0.25rem;
}

html[dir="rtl"] .space-x-2 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 0;
  margin-right: 0.5rem;
}

html[dir="rtl"] .space-x-4 > :not([hidden]) ~ :not([hidden]) {
  margin-left: 0;
  margin-right: 1rem;
}
```

## Critical RTL Patterns

### 1. Icon + Text Buttons (Most Common Issue)
```tsx
// ❌ WRONG - Icon will be on wrong side in RTL
<Button>
  <Save className="h-4 w-4 ml-2" />
  ذخیره
</Button>

// ✅ CORRECT - Icon positions correctly for RTL
<Button>
  <Save className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
  ذخیره
</Button>
```

### 2. Header Layouts
```tsx
// ❌ WRONG - Logo and nav won't reverse properly
<header className="flex justify-between items-center">
  <div className="flex items-center">
    <Logo />
    <div className="ml-4">
      <h1>عنوان</h1>
    </div>
  </div>
  <nav className="flex items-center space-x-4">
    <Button>راهنما</Button>
    <Button>خروج</Button>
  </nav>
</header>

// ✅ CORRECT - Proper RTL header layout
<header className="flex justify-between items-center rtl:flex-row-reverse">
  <div className="flex items-center rtl:flex-row-reverse">
    <Logo />
    <div className="ml-4 rtl:mr-4 rtl:ml-0">
      <h1>عنوان</h1>
    </div>
  </div>
  <nav className="flex items-center space-x-4 rtl:space-x-reverse">
    <Button>راهنما</Button>
    <Button>خروج</Button>
  </nav>
</header>
```

### 3. Card Headers with Actions
```tsx
// ❌ WRONG - Actions won't position correctly
<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
  <CardTitle>عنوان کارت</CardTitle>
  <Button size="sm">
    <Plus className="h-4 w-4 ml-2" />
    افزودن
  </Button>
</CardHeader>

// ✅ CORRECT - Proper RTL card header
<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 rtl:flex-row-reverse">
  <CardTitle>عنوان کارت</CardTitle>
  <Button size="sm">
    <Plus className="h-4 w-4 ml-2 rtl:mr-2 rtl:ml-0" />
    افزودن
  </Button>
</CardHeader>
```

### 4. Search Inputs
```tsx
// ❌ WRONG - Search icon on wrong side, padding incorrect
<div className="relative">
  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    placeholder="جستجو..."
    className="pl-10"
  />
</div>

// ✅ CORRECT - RTL search input
<div className="relative">
  <Search className="absolute left-3 rtl:right-3 rtl:left-auto top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
  <Input
    placeholder="جستجو..."
    className="pl-10 rtl:pr-10 rtl:pl-0"
  />
</div>
```

### 5. Navigation Menus
```tsx
// ❌ WRONG - Menu items won't align properly
<nav className="space-y-2">
  {modules.map((module) => (
    <Button className="w-full justify-start">
      <module.icon className="h-4 w-4 mr-2" />
      {module.name}
    </Button>
  ))}
</nav>

// ✅ CORRECT - RTL navigation menu
<nav className="space-y-2">
  {modules.map((module) => (
    <Button className="w-full justify-start rtl:justify-end">
      <module.icon className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
      {module.name}
    </Button>
  ))}
</nav>
```

### 6. Table Headers and Cells
```tsx
// ❌ WRONG - Table content won't align for RTL
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-left">نام</TableHead>
      <TableHead className="text-left">مقدار</TableHead>
      <TableHead className="text-right">عملیات</TableHead>
    </TableRow>
  </TableHeader>
</Table>

// ✅ CORRECT - RTL table alignment
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-left rtl:text-right">نام</TableHead>
      <TableHead className="text-left rtl:text-right">مقدار</TableHead>
      <TableHead className="text-right rtl:text-left">عملیات</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

### 7. Form Layouts
```tsx
// ❌ WRONG - Form buttons won't position correctly
<div className="flex gap-2 justify-end">
  <Button variant="outline">انصراف</Button>
  <Button type="submit">
    <Save className="h-4 w-4 mr-2" />
    ذخیره
  </Button>
</div>

// ✅ CORRECT - RTL form layout
<div className="flex gap-2 justify-end rtl:justify-start">
  <Button variant="outline">انصراف</Button>
  <Button type="submit">
    <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
    ذخیره
  </Button>
</div>
```

### 8. Sidebar Layouts
```tsx
// ❌ WRONG - Sidebar content won't reverse
<div className="flex gap-8">
  <nav className="w-64 flex-shrink-0">
    {/* Sidebar content */}
  </nav>
  <main className="flex-1">
    {/* Main content */}
  </main>
</div>

// ✅ CORRECT - RTL sidebar layout
<div className="flex gap-8 rtl:flex-row-reverse">
  <nav className="w-64 flex-shrink-0">
    {/* Sidebar content */}
  </nav>
  <main className="flex-1">
    {/* Main content */}
  </main>
</div>
```

## Comprehensive RTL Class Mapping

### Margin Classes
```css
ml-1 → ml-1 rtl:mr-1 rtl:ml-0
ml-2 → ml-2 rtl:mr-2 rtl:ml-0
ml-3 → ml-3 rtl:mr-3 rtl:ml-0
ml-4 → ml-4 rtl:mr-4 rtl:ml-0
ml-6 → ml-6 rtl:mr-6 rtl:ml-0
ml-8 → ml-8 rtl:mr-8 rtl:ml-0

mr-1 → mr-1 rtl:ml-1 rtl:mr-0
mr-2 → mr-2 rtl:ml-2 rtl:mr-0
mr-3 → mr-3 rtl:ml-3 rtl:mr-0
mr-4 → mr-4 rtl:ml-4 rtl:mr-0
mr-6 → mr-6 rtl:ml-6 rtl:mr-0
mr-8 → mr-8 rtl:ml-8 rtl:mr-0
```

### Padding Classes
```css
pl-2 → pl-2 rtl:pr-2 rtl:pl-0
pl-3 → pl-3 rtl:pr-3 rtl:pl-0
pl-4 → pl-4 rtl:pr-4 rtl:pl-0
pl-6 → pl-6 rtl:pr-6 rtl:pl-0
pl-8 → pl-8 rtl:pr-8 rtl:pl-0
pl-10 → pl-10 rtl:pr-10 rtl:pl-0
pl-12 → pl-12 rtl:pr-12 rtl:pl-0

pr-2 → pr-2 rtl:pl-2 rtl:pr-0
pr-3 → pr-3 rtl:pl-3 rtl:pr-0
pr-4 → pr-4 rtl:pl-4 rtl:pr-0
pr-6 → pr-6 rtl:pl-6 rtl:pr-0
pr-8 → pr-8 rtl:pl-8 rtl:pr-0
pr-10 → pr-10 rtl:pl-10 rtl:pr-0
pr-12 → pr-12 rtl:pl-12 rtl:pr-0
```

### Position Classes
```css
left-0 → left-0 rtl:right-0 rtl:left-auto
left-1 → left-1 rtl:right-1 rtl:left-auto
left-2 → left-2 rtl:right-2 rtl:left-auto
left-3 → left-3 rtl:right-3 rtl:left-auto
left-4 → left-4 rtl:right-4 rtl:left-auto

right-0 → right-0 rtl:left-0 rtl:right-auto
right-1 → right-1 rtl:left-1 rtl:right-auto
right-2 → right-2 rtl:left-2 rtl:right-auto
right-3 → right-3 rtl:left-3 rtl:right-auto
right-4 → right-4 rtl:left-4 rtl:right-auto
```

### Flex and Grid Classes
```css
justify-start → justify-start rtl:justify-end
justify-end → justify-end rtl:justify-start
flex-row → flex-row rtl:flex-row-reverse
space-x-1 → space-x-1 rtl:space-x-reverse
space-x-2 → space-x-2 rtl:space-x-reverse
space-x-3 → space-x-3 rtl:space-x-reverse
space-x-4 → space-x-4 rtl:space-x-reverse
space-x-6 → space-x-6 rtl:space-x-reverse
space-x-8 → space-x-8 rtl:space-x-reverse
```

### Text Alignment
```css
text-left → text-left rtl:text-right
text-right → text-right rtl:text-left
```

### Border Classes
```css
border-l → border-l rtl:border-r rtl:border-l-0
border-r → border-r rtl:border-l rtl:border-r-0
border-l-2 → border-l-2 rtl:border-r-2 rtl:border-l-0
border-r-2 → border-r-2 rtl:border-l-2 rtl:border-r-0
```

## Component-Specific Patterns

### Tab Lists
```tsx
// ✅ CORRECT - RTL tab implementation
<TabsList className="grid w-full grid-cols-4 rtl:flex-row-reverse">
  <TabsTrigger value="security">امنیت</TabsTrigger>
  <TabsTrigger value="system">تنظیمات سیستم</TabsTrigger>
  <TabsTrigger value="roles">نقش‌ها و دسترسی‌ها</TabsTrigger>
  <TabsTrigger value="users">کاربران</TabsTrigger>
</TabsList>
```

### Dialog and Modal Headers
```tsx
// ✅ CORRECT - RTL dialog implementation
<DialogHeader className="rtl:text-right">
  <DialogTitle className="flex items-center gap-2 rtl:flex-row-reverse">
    <Icon className="h-5 w-5" />
    عنوان دیالوگ
  </DialogTitle>
</DialogHeader>
```

### Transaction Lists
```tsx
// ✅ CORRECT - RTL transaction item
<div className="flex items-center justify-between rtl:flex-row-reverse">
  <div className="flex items-center space-x-4 rtl:space-x-reverse">
    <div className="flex items-center space-x-2 rtl:space-x-reverse">
      <TransactionIcon className="h-4 w-4" />
    </div>
    <div>
      <p className="font-medium">نوع تراکنش</p>
      <p className="text-sm text-muted-foreground">توضیحات</p>
    </div>
  </div>
  <div className="flex items-center space-x-2 rtl:space-x-reverse">
    <span className="font-medium">مبلغ</span>
    <Badge>وضعیت</Badge>
  </div>
</div>
```

## Testing RTL Implementation

### Browser Testing
1. Set `html` element `dir="rtl"`
2. Check all spacing and alignment
3. Verify icon positions
4. Test form submissions
5. Validate table alignments

### Common Issues to Check
- ✅ Icons beside text
- ✅ Search input positioning  
- ✅ Form button alignment
- ✅ Table header alignment
- ✅ Navigation menu layout
- ✅ Sidebar positioning
- ✅ Card header layouts
- ✅ Tab order and direction

## Migration Checklist

### Priority 1: Critical Layout
- [ ] Header layout and logo positioning
- [ ] Main navigation structure  
- [ ] Sidebar layout direction
- [ ] Card header layouts

### Priority 2: Interactive Elements
- [ ] All button icons (ml-2, mr-2)
- [ ] Form submission buttons
- [ ] Action buttons in tables
- [ ] Navigation menu items

### Priority 3: Form Elements
- [ ] Search input positioning
- [ ] Form field alignments
- [ ] Input padding corrections
- [ ] Label positioning

### Priority 4: Data Display
- [ ] Table header alignment
- [ ] Table cell content
- [ ] List item layouts
- [ ] Statistics cards

### Priority 5: Details
- [ ] Tooltip positioning
- [ ] Dropdown alignments
- [ ] Modal positioning
- [ ] Toast notifications

## Performance Notes

### RTL Plugin Benefits
- ✅ Automatic class generation
- ✅ Build-time optimization
- ✅ No runtime overhead
- ✅ Tree-shaking friendly

### Best Practices
- Use `rtl:` prefix consistently
- Leverage global CSS for common patterns
- Test with real RTL content
- Consider reading patterns (right-to-left flow)

This guide provides comprehensive patterns for implementing RTL support throughout the entire application.