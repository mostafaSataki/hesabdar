import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Mock data - in real app, use database
let accountingPeriods = [
  {
    id: '1',
    name: 'دی ماه ۱۴۰۳',
    startDate: '2024-12-21',
    endDate: '2025-01-19',
    isClosed: false,
    totalRevenue: 125000000,
    totalExpenses: 95000000,
    netIncome: 30000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'بهمن ماه ۱۴۰۳',
    startDate: '2024-11-21',
    endDate: '2024-12-20',
    isClosed: true,
    closedAt: '2024-12-25T10:30:00Z',
    closedBy: 'admin',
    totalRevenue: 110000000,
    totalExpenses: 88000000,
    netIncome: 22000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'آبان ماه ۱۴۰۳',
    startDate: '2024-10-22',
    endDate: '2024-11-20',
    isClosed: true,
    closedAt: '2024-11-25T14:15:00Z',
    closedBy: 'admin',
    totalRevenue: 98000000,
    totalExpenses: 76000000,
    netIncome: 22000000,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const periodSchema = z.object({
  name: z.string().min(1, 'Period name is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
});

const closingSchema = z.object({
  closingDate: z.string().min(1, 'Closing date is required'),
  description: z.string().min(1, 'Description is required'),
});

// GET all accounting periods
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isClosed = searchParams.get('isClosed');

    let filteredPeriods = accountingPeriods;

    if (isClosed !== null) {
      const closedFilter = isClosed === 'true';
      filteredPeriods = filteredPeriods.filter(period => period.isClosed === closedFilter);
    }

    // Sort by start date (newest first)
    filteredPeriods.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

    return NextResponse.json(filteredPeriods);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch accounting periods' },
      { status: 500 }
    );
  }
}

// POST create new accounting period
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = periodSchema.parse(body);

    // Check for overlapping periods
    const newStartDate = new Date(validatedData.startDate);
    const newEndDate = new Date(validatedData.endDate);

    const overlappingPeriod = accountingPeriods.find(period => {
      const existingStart = new Date(period.startDate);
      const existingEnd = new Date(period.endDate);
      
      return (
        (newStartDate >= existingStart && newStartDate <= existingEnd) ||
        (newEndDate >= existingStart && newEndDate <= existingEnd) ||
        (newStartDate <= existingStart && newEndDate >= existingEnd)
      );
    });

    if (overlappingPeriod) {
      return NextResponse.json(
        { error: 'Period overlaps with existing period' },
        { status: 400 }
      );
    }

    // Validate that end date is after start date
    if (newEndDate <= newStartDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const newPeriod = {
      id: Date.now().toString(),
      ...validatedData,
      isClosed: false,
      totalRevenue: 0,
      totalExpenses: 0,
      netIncome: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    accountingPeriods.push(newPeriod);

    return NextResponse.json(newPeriod, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create accounting period' },
      { status: 500 }
    );
  }
}