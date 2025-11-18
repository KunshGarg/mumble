"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Calendar, QrCode, ArrowLeft } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { appConfig } from "@/config/app";

export function AdminHeader() {
  const pathname = usePathname();

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/events", label: "Events", icon: Calendar },
    { href: "/admin/scan", label: "Scan", icon: QrCode },
  ];

  return (
    <header className="sticky top-0 z-50 bg-black border-b border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/" className="flex items-center text-gray-400 hover:text-white">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Site
            </Link>

            <h1 className="text-xl font-bold text-white">{appConfig.adminName}</h1>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-2 ${
                    isActive
                      ? "text-purple-400"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <UserButton afterSignOutUrl="/" />
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center space-x-6 mt-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 ${
                  isActive ? "text-purple-400" : "text-gray-400 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
