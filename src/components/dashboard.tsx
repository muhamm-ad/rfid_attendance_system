"use client";

import { useState, useTransition } from "react";
import {
  BarChart3,
  Camera,
  Clock,
  CreditCard,
  FileText,
  LogOutIcon,
  Settings,
  Users,
} from "lucide-react";
import PersonManagement from "@/components/dashboard-person";
import LogsTable from "@/components/dashboard-logs";
import PaymentManagement from "@/components/dashboard-payment";
import Statistics from "@/components/dashboard-statistics";
import Reports from "@/components/dashboard-reports";
import { UserRole } from "@/prisma/generated/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loading } from "#/src/components/loading";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function Dashboard() {
  const {
    data: session,
    status,
    update,
  } = useSession({
    required: true,
    onUnauthenticated: () => {
      router.push("/login");
    },
  });

  const userRole = session?.user.role as UserRole;

  const [activeTab, setActiveTab] = useState("logs");
  const router = useRouter();
  const [isSigningOut, startSignOut] = useTransition();

  const handleLogout = () => {
    startSignOut(async () => {
      await signOut({ redirect: false });
      router.push("/login");
      router.refresh();
    });
  };

  const tabs = [
    { id: "logs", label: "Attendance", icon: Clock },
    { id: "persons", label: "Persons", icon: Users },
    { id: "payments", label: "Payments", icon: CreditCard },
    { id: "stats", label: "Statistics", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
  ];

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 border-red-200";
      case "STAFF":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "VIEWER":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return status === "loading" ? (
    <Loading />
  ) : session ? (
    <div className="min-h-screen theme-page p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-3">
                  <Camera className="text-indigo-600" size={40} />
                  RFID Access Control System
                </h1>
                <Badge
                  variant="outline"
                  className={`${getRoleBadgeColor(userRole)} border font-semibold`}
                >
                  {userRole}
                </Badge>
              </div>
              <p className="text-gray-600 mt-2 text-lg">
                Automated entry and exit management with payment tracking
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {userRole === "ADMIN" && (
                <Button asChild variant="outline">
                  <Link href="/settings">
                    <Settings className="size-4" />
                    Settings
                  </Link>
                </Button>
              )}

              <Button
                onClick={handleLogout}
                disabled={isSigningOut}
                variant="destructive"
              >
                <LogOutIcon className="size-4" />
                {isSigningOut ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div className="flex border-b w-full justify-center flex-wrap">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 md:px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <tab.icon size={20} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === "logs" && <LogsTable />}
          {activeTab === "persons" && <PersonManagement />}
          {activeTab === "payments" && <PaymentManagement />}
          {activeTab === "stats" && <Statistics />}
          {activeTab === "reports" && <Reports />}
        </div>
      </div>
    </div>
  ) : (
    <div>
      <Button onClick={() => router.push("/login")}>Login</Button>
    </div>
  );
}
