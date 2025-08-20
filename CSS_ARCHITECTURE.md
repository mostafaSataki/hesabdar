# 🎨 CSS Architecture Documentation

## Overview
This project uses a modern, enterprise-grade CSS architecture built on Tailwind CSS v4 with advanced features like OKLCH color space, RTL support, and type-safe component variants.

## Tech Stack
- **Tailwind CSS v4** (Latest)
- **OKLCH Color Space** (Advanced)
- **CVA (Class Variance Authority)** (Type-safe variants)
- **tailwindcss-rtl** (RTL support)
- **tailwindcss-animate** (Animations)
- **tw-animate-css** (Extended animations)

## Color System

### Primary Colors (OKLCH)
```css
/* Light Theme */
--background: oklch(1 0 0);
--foreground: oklch(0.145 0 0);
--primary: oklch(0.205 0 0);
--secondary: oklch(0.97 0 0);
--destructive: oklch(0.577 0.245 27.325);

/* Dark Theme */
--background: oklch(0.145 0 0);
--foreground: oklch(0.985 0 0);
--primary: oklch(0.922 0 0);
--secondary: oklch(0.269 0 0);
--destructive: oklch(0.704 0.191 22.216);
```

### Chart Colors
```css
--chart-1: oklch(0.646 0.222 41.116);  /* Orange */
--chart-2: oklch(0.6 0.118 184.704);   /* Cyan */
--chart-3: oklch(0.398 0.07 227.392);  /* Blue */
--chart-4: oklch(0.828 0.189 84.429);  /* Green */
--chart-5: oklch(0.769 0.188 70.08);   /* Yellow */
```

### Sidebar Colors
```css
--sidebar: oklch(0.985 0 0);
--sidebar-foreground: oklch(0.145 0 0);
--sidebar-primary: oklch(0.205 0 0);
--sidebar-accent: oklch(0.97 0 0);
--sidebar-border: oklch(0.922 0 0);
```

## Component Variants

### Button Variants
```typescript
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline: "border bg-background hover:bg-accent",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline"
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md gap-1.5 px-3",
        lg: "h-10 rounded-md px-6",
        icon: "size-9"
      }
    }
  }
)
```

## RTL Support Patterns

### Spacing Classes
```css
/* Left/Right Margins */
ml-2 → ml-2 rtl:mr-2 rtl:ml-0
mr-4 → mr-4 rtl:ml-4 rtl:mr-0

/* Left/Right Padding */
pl-10 → pl-10 rtl:pr-10 rtl:pl-0
pr-6 → pr-6 rtl:pl-6 rtl:pr-0

/* Text Alignment */
text-left → text-left rtl:text-right
text-right → text-right rtl:text-left

/* Flex Direction */
flex-row → flex-row rtl:flex-row-reverse
justify-start → justify-start rtl:justify-end
justify-end → justify-end rtl:justify-start

/* Space Between */
space-x-2 → space-x-2 rtl:space-x-reverse
space-x-4 → space-x-4 rtl:space-x-reverse

/* Positioning */
left-3 → left-3 rtl:right-3 rtl:left-auto
right-3 → right-3 rtl:left-3 rtl:right-auto
```

### Common RTL Patterns
```tsx
// Header with logo and navigation
<div className="flex justify-between items-center rtl:flex-row-reverse">
  <div className="flex items-center rtl:flex-row-reverse">
    <Logo />
    <div className="ml-4 rtl:mr-4 rtl:ml-0">Title</div>
  </div>
  <div className="flex items-center space-x-4 rtl:space-x-reverse">
    Navigation items
  </div>
</div>

// Button with icon
<Button className="justify-start rtl:justify-end">
  <Icon className="mr-2 rtl:ml-2 rtl:mr-0" />
  Text
</Button>

// Search input
<div className="relative">
  <Search className="absolute left-3 rtl:right-3 rtl:left-auto" />
  <Input className="pl-10 rtl:pr-10 rtl:pl-0" />
</div>

// Card with actions
<CardHeader className="flex flex-row items-center justify-between rtl:flex-row-reverse">
  <CardTitle>Title</CardTitle>
  <Button size="sm">
    <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
    Add
  </Button>
</CardHeader>
```

## Layout Patterns

### Dashboard Stats Cards
```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 rtl:flex-row-reverse">
    <CardTitle className="text-sm font-medium">Title</CardTitle>
    <Icon className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-2xl font-bold">Value</div>
    <p className="text-xs text-muted-foreground">Description</p>
  </CardContent>
</Card>
```

### Form Layouts
```tsx
<Form>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField />
    <FormField />
  </div>
  <div className="flex gap-2 justify-end rtl:justify-start">
    <Button variant="outline">Cancel</Button>
    <Button type="submit">
      <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
      Save
    </Button>
  </div>
</Form>
```

### Table Layouts
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead className="text-left rtl:text-right">Name</TableHead>
      <TableHead className="text-left rtl:text-right">Value</TableHead>
      <TableHead className="text-right rtl:text-left">Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Content</TableCell>
      <TableCell>Content</TableCell>
      <TableCell className="text-right rtl:text-left">
        <Button size="sm">
          <Edit className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
          Edit
        </Button>
      </TableCell>
    </TableRow>
  </TableBody>
</Table>
```

## Component Architecture

### Using CVA for Components
```typescript
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-styles",
        alternative: "alternative-styles"
      },
      size: {
        sm: "small-styles",
        lg: "large-styles"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "sm"
    }
  }
)

function Component({ className, variant, size, ...props }: ComponentProps) {
  return (
    <div
      className={cn(componentVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

## Dark Mode Implementation

### CSS Variables Approach
```css
:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
}
```

### Component Usage
```tsx
<div className="bg-background text-foreground">
  Content automatically adapts to theme
</div>
```

## Animation Patterns

### Common Transitions
```css
transition-all         /* All properties */
transition-colors      /* Color changes */
transition-transform   /* Movement/scaling */
transition-opacity     /* Fade effects */
```

### Hover States
```tsx
<Button className="hover:bg-accent hover:text-accent-foreground transition-colors">
  Hover me
</Button>
```

## Responsive Design

### Breakpoint Usage
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  Responsive grid
</div>
```

### Common Patterns
```tsx
// Mobile-first responsive text
<h1 className="text-xl md:text-2xl lg:text-3xl">Title</h1>

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">Content</div>

// Responsive visibility
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>
```

## Accessibility Features

### Focus States
```css
focus-visible:ring-2
focus-visible:ring-ring
focus-visible:ring-offset-2
```

### ARIA Support
```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

## Performance Optimization

### CSS-in-JS Best Practices
- Use `cn()` utility for conditional classes
- Leverage CVA for variant management
- Minimize runtime class generation

### Bundle Size Optimization
- Tailwind purges unused styles automatically
- Component variants are tree-shakeable
- OKLCH colors are future-proof

## Migration Patterns

### From Standard CSS
```css
/* Old way */
.button {
  background: blue;
  color: white;
  padding: 8px 16px;
}

/* New way */
className="bg-primary text-primary-foreground px-4 py-2"
```

### RTL Migration
```tsx
// Before
<div className="ml-4 text-left">

// After  
<div className="ml-4 rtl:mr-4 rtl:ml-0 text-left rtl:text-right">
```

## Troubleshooting

### Common Issues
1. **Colors not changing in dark mode**: Check CSS variable mapping
2. **RTL not working**: Ensure `dir="rtl"` on html element
3. **Animations not smooth**: Add appropriate transition classes
4. **Components not responsive**: Use mobile-first breakpoints

### Debugging Tools
- Browser DevTools for CSS variables
- Tailwind CSS IntelliSense extension
- React DevTools for component inspection

## Best Practices

### Do's
- ✅ Use semantic color tokens (primary, secondary, etc.)
- ✅ Follow mobile-first responsive design
- ✅ Implement proper RTL support
- ✅ Use CVA for component variants
- ✅ Leverage CSS variables for theming

### Don'ts
- ❌ Don't use hardcoded colors
- ❌ Don't ignore RTL layouts
- ❌ Don't mix CSS-in-JS libraries
- ❌ Don't skip accessibility features
- ❌ Don't use deprecated Tailwind patterns

## Quick Reference

### Most Used Classes
```css
/* Layout */
flex, grid, container, mx-auto

/* Spacing */
p-4, m-4, gap-4, space-y-4, space-x-4

/* Colors */
bg-background, text-foreground, border-border

/* Typography */
text-sm, text-lg, font-medium, font-semibold

/* Interactive */
hover:bg-accent, focus-visible:ring-2, transition-colors
```

This documentation serves as a comprehensive guide for maintaining consistency and best practices across the entire application.