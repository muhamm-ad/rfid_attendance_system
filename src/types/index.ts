// @/types/index.ts

import {
  Person as PrismaPerson,
  Attendance as PrismaAttendance,
  Payment as PrismaPayment,
  StudentPayment as PrismaStudentPayment,
  UserRole,
  User,
  PersonType,
} from "@/prisma/generated/client";
import { LinkProps } from "next/link";
import { NextResponse } from "next/server";

// Re-export Prisma types for consumers that need them
export { UserRole as UserRoleEnum, PersonType as PersonTypeEnum } from "@/prisma/generated/client";
export type { UserRole, User, PersonType };

// ======================= AUTHENTICATION TYPES ======================

export type AuthMethod = "SESSION" | "API_KEY" | "JWT";

export type AuthUser = {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  authMethod: AuthMethod;
  iat?: number;
  exp?: number;
};

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  MANAGER: 1,
  CASHIER: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
};

/**
 * Returns true when `userRole` meets or exceeds `minimumRole` in the hierarchy.
 * e.g. hasRole("SUPER_ADMIN", "ADMIN") → true
 *      hasRole("CASHIER", "ADMIN")     → false
 *      hasRole("ADMIN", "CASHIER")     → true
 */
export function hasRole(
  userRole: UserRole | undefined | null,
  minimumRole: UserRole,
): boolean {
  if (!userRole) return false;
  return (ROLE_HIERARCHY[userRole] ?? 0) >= ROLE_HIERARCHY[minimumRole];
}

/** Result type for authentication middlewares */
export type AuthResult =
  | { auth_user: AuthUser; error: null }
  | { auth_user: null; error: NextResponse };

// ======================= DATA TYPES ======================

type SerializeDates<T> = {
  [K in keyof T]: T[K] extends Date ? string : T[K];
};

export type Person = SerializeDates<
  Omit<PrismaPerson, "attendance" | "student_payments">
>;

export type Attendance = SerializeDates<Omit<PrismaAttendance, "person">>;

export type Payment = SerializeDates<Omit<PrismaPayment, "student_payments">>;

export type StudentPayment = Omit<PrismaStudentPayment, "student" | "payment">;

// Extended types for API responses
export type PersonWithPayments = Person & {
  trimester1_paid: boolean;
  trimester2_paid: boolean;
  trimester3_paid: boolean;
};

export interface ScanResult {
  success: boolean;
  access_granted: boolean;
  person: PersonWithPayments | null;
  message: string;
  timestamp: string;
  current_trimester?: number;
  action?: "in" | "out";
}

export interface AttendanceLog {
  id: number;
  person_id: number;
  action: "in" | "out";
  status: "success" | "failed";
  timestamp: string; // API returns this as timestamp (aliased from attendance_date)
  first_name: string;
  last_name: string;
  type: string;
  rfid_uuid: string;
  photo?: string;
}

// ======================= UI TYPES ======================

export type SetState<T> = React.Dispatch<React.SetStateAction<T>>;

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
}

type BaseNavItem = {
  title: string;
  badge?: string;
  icon?: React.ElementType;
};

type NavLink = BaseNavItem & {
  url: LinkProps["href"] | (string & {});
  items?: never;
};

type NavCollapsible = BaseNavItem & {
  items: (BaseNavItem & { url: LinkProps["href"] | (string & {}) })[];
  url?: never;
};

type NavItem = NavCollapsible | NavLink;

type NavGroup = {
  title: string;
  items: NavItem[];
};

type SidebarData = {
  user: User;
  navGroups: NavGroup[];
};

export type { SidebarData, NavGroup, NavItem, NavCollapsible, NavLink };
