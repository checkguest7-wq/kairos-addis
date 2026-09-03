import { useState, useEffect } from 'react';
import { WarrantyDetails, PortalVehicle } from '../types';

export interface WarrantyTimeCountdown {
  isExpired: boolean;
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalDays: number;
  percentElapsed: number;
  percentRemaining: number;
  currentYearOfTotal: number;
  formattedRemaining: string;
  formattedDetailed: string;
}

export interface WarrantyMileageCoverage {
  currentKm: number;
  limitKm: number;
  remainingKm: number;
  percentUsed: number;
  percentRemaining: number;
  isExceeded: boolean;
  formattedUsed: string;
  formattedRemaining: string;
}

export interface DynamicWarrantyStatus {
  vehicleWarranty: WarrantyTimeCountdown;
  batteryWarranty: WarrantyTimeCountdown;
  batteryMileage: WarrantyMileageCoverage;
  vehicleMileage: WarrantyMileageCoverage;
  overallStatus: 'ACTIVE' | 'EXPIRED' | 'PENDING';
  now: Date;
}

/**
 * Safely parses any date string (ISO, RFC, or Human readable like "January 14, 2030")
 */
export function parseDateSafe(dateString?: string | null): Date | null {
  if (!dateString) return null;
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) {
    // Try timestamp if number
    const num = Number(dateString);
    if (!isNaN(num)) {
      const numDate = new Date(num);
      return isNaN(numDate.getTime()) ? null : numDate;
    }
    return null;
  }
  return parsed;
}

/**
 * Calculates dynamic time countdown between now and target date
 */
export function calculateWarrantyCountdown(
  endDateString?: string,
  startDateString?: string,
  durationYears = 5,
  currentDate: Date = new Date()
): WarrantyTimeCountdown {
  const endDate = parseDateSafe(endDateString);
  
  if (!endDate) {
    return {
      isExpired: false,
      years: durationYears,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: durationYears * 365,
      percentElapsed: 0,
      percentRemaining: 100,
      currentYearOfTotal: 1,
      formattedRemaining: `${durationYears} Years`,
      formattedDetailed: `${durationYears} Years, 0 Months, 0 Days`,
    };
  }

  // Derive start date if not provided
  let startDate = parseDateSafe(startDateString);
  if (!startDate) {
    startDate = new Date(endDate);
    startDate.setFullYear(startDate.getFullYear() - durationYears);
  }

  const now = currentDate;
  const endMs = endDate.getTime();
  const startMs = startDate.getTime();
  const nowMs = now.getTime();

  if (nowMs >= endMs) {
    return {
      isExpired: true,
      years: 0,
      months: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalDays: 0,
      percentElapsed: 100,
      percentRemaining: 0,
      currentYearOfTotal: durationYears,
      formattedRemaining: 'Coverage Expired',
      formattedDetailed: 'Expired',
    };
  }

  // Exact calendar difference calculation from now to endDate
  let temp = new Date(nowMs);
  let years = 0;
  while (true) {
    const nextYear = new Date(temp);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    if (nextYear <= endDate) {
      years++;
      temp = nextYear;
    } else {
      break;
    }
  }

  let months = 0;
  while (true) {
    const nextMonth = new Date(temp);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    if (nextMonth <= endDate) {
      months++;
      temp = nextMonth;
    } else {
      break;
    }
  }

  let days = 0;
  while (true) {
    const nextDay = new Date(temp);
    nextDay.setDate(nextDay.getDate() + 1);
    if (nextDay <= endDate) {
      days++;
      temp = nextDay;
    } else {
      break;
    }
  }

  const diffMs = endMs - temp.getTime();
  const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
  const seconds = Math.floor((diffMs / 1000) % 60);

  const totalRemainingMs = Math.max(0, endMs - nowMs);
  const totalDays = Math.floor(totalRemainingMs / (1000 * 60 * 60 * 24));

  // Elapsed calculations
  const totalDurationMs = Math.max(1, endMs - startMs);
  const elapsedMs = Math.max(0, nowMs - startMs);
  const percentElapsed = Math.min(100, Math.max(0, (elapsedMs / totalDurationMs) * 100));
  const percentRemaining = Math.max(0, 100 - percentElapsed);

  const elapsedYears = elapsedMs / (365.25 * 24 * 60 * 60 * 1000);
  const currentYearOfTotal = Math.min(durationYears, Math.max(1, Math.floor(elapsedYears) + 1));

  // Formatted strings
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} ${years === 1 ? 'Year' : 'Years'}`);
  if (months > 0) parts.push(`${months} ${months === 1 ? 'Month' : 'Months'}`);
  if (days > 0 || parts.length === 0) parts.push(`${days} ${days === 1 ? 'Day' : 'Days'}`);

  const formattedRemaining = parts.slice(0, 2).join(', ');
  const formattedDetailed = parts.join(', ');

  return {
    isExpired: false,
    years,
    months,
    days,
    hours,
    minutes,
    seconds,
    totalDays,
    percentElapsed: Number(percentElapsed.toFixed(1)),
    percentRemaining: Number(percentRemaining.toFixed(1)),
    currentYearOfTotal,
    formattedRemaining,
    formattedDetailed,
  };
}

/**
 * Calculates dynamic mileage coverage
 */
export function calculateMileageCoverage(
  currentMileage = 0,
  mileageLimit = 160000
): WarrantyMileageCoverage {
  const currentKm = Math.max(0, currentMileage);
  const limitKm = Math.max(1, mileageLimit);
  const remainingKm = Math.max(0, limitKm - currentKm);
  const percentUsed = Math.min(100, Math.max(0, (currentKm / limitKm) * 100));
  const percentRemaining = Math.max(0, 100 - percentUsed);
  const isExceeded = currentKm >= limitKm;

  return {
    currentKm,
    limitKm,
    remainingKm,
    percentUsed: Number(percentUsed.toFixed(1)),
    percentRemaining: Number(percentRemaining.toFixed(1)),
    isExceeded,
    formattedUsed: `${currentKm.toLocaleString()} / ${limitKm.toLocaleString()} KM`,
    formattedRemaining: `${remainingKm.toLocaleString()} KM remaining`,
  };
}

/**
 * React hook to get real-time dynamic warranty computations with live ticker
 */
export function useDynamicWarranty(
  warranty: WarrantyDetails | null | undefined,
  vehicle?: PortalVehicle | null
): DynamicWarrantyStatus {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    // Update every second for dynamic countdowns
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const currentVehicleKm = vehicle?.mileageKm ?? warranty?.currentKm ?? 0;
  const vehicleStart = warranty?.vehicleWarrantyStartDate || warranty?.startDate;
  const batteryStart = warranty?.batteryWarrantyStartDate || warranty?.startDate;

  const vehicleWarranty = calculateWarrantyCountdown(
    warranty?.vehicleWarrantyEndDate,
    vehicleStart,
    warranty?.vehicleWarrantyYears || 5,
    now
  );

  const batteryWarranty = calculateWarrantyCountdown(
    warranty?.batteryWarrantyEndDate,
    batteryStart,
    warranty?.batteryWarrantyYears || 8,
    now
  );

  const batteryMileage = calculateMileageCoverage(
    currentVehicleKm,
    warranty?.batteryWarrantyKm || 160000
  );

  const vehicleMileage = calculateMileageCoverage(
    currentVehicleKm,
    warranty?.vehicleWarrantyKm || 100000
  );

  const overallStatus =
    !warranty
      ? 'PENDING'
      : vehicleWarranty.isExpired && batteryWarranty.isExpired && batteryMileage.isExceeded
      ? 'EXPIRED'
      : warranty.status || 'ACTIVE';

  return {
    vehicleWarranty,
    batteryWarranty,
    batteryMileage,
    vehicleMileage,
    overallStatus,
    now,
  };
}
