"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Menu } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { appConfig } from "@/config/app"

export function Navbar() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false) // In a real app, this would come from auth state

  const handleLogin = () => {
    router.push("/login")
  }

  const handleSignup = () => {
    router.push("/signup")
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full border-b border-purple-900/40 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/60"
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="bg-gray-900 text-white">
              <SheetHeader>
                <SheetTitle className="text-left text-white">Menu</SheetTitle>
              </SheetHeader>
              <nav className="grid gap-4 py-6">
                <Link href="/" className="group flex items-center gap-2 text-lg font-medium hover:text-purple-400">
                  Home
                </Link>
                <Link
                  href="/events"
                  className="group flex items-center gap-2 text-lg font-medium hover:text-purple-400"
                >
                  Explore Events
                </Link>
                <Link
                  href="/create-event"
                  className="group flex items-center gap-2 text-lg font-medium hover:text-purple-400"
                >
                  Create Event
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-purple-600 text-transparent bg-clip-text">
              {appConfig.name}
            </span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-6">
          <Link href="/" className="text-sm font-medium hover:text-purple-400">
            Home
          </Link>
          <Link href="/events" className="text-sm font-medium hover:text-purple-400">
            Explore Events
          </Link>
          <Link href="/create-event" className="text-sm font-medium hover:text-purple-400">
            Create Event
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="bg-purple-700">JD</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-900 text-white border-purple-700">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-gray-800">Profile</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800">Settings</DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800">My Events</DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem onClick={handleLogout} className="hover:bg-gray-800">
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" onClick={handleLogin} className="hidden sm:flex hover:text-purple-400">
                Login
              </Button>
              <Button onClick={handleSignup} className="bg-purple-700 hover:bg-purple-600">
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.header>
  )
}

