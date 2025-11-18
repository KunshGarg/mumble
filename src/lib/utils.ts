import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number | string): string {
  const numericAmount = Number(amount);
  if (isNaN(numericAmount)) {
    console.error("Invalid amount passed to formatCurrency:", amount);
    return "₹0";
  }
  return `₹${numericAmount.toFixed(2).replace(/\.00$/, "")}`;
}


export function formatDate(date: Date, showDate = true, showTime = false): string {
  if (!(date instanceof Date)) {
    date = new Date(date)
  }
  
  const options: Intl.DateTimeFormatOptions = {}
  
  if (showDate) {
    options.day = 'numeric'
    options.month = 'short'
    
    // Check if the date is today
    const today = new Date()
    if (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    ) {
      return `Today, ${date.getDate()} ${date.toLocaleString('default', { month: 'short' })}`
    }
  }
  
  if (showTime) {
    options.hour = 'numeric'
    options.minute = 'numeric'
    options.hour12 = true
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    })
  }
  
  return date.toLocaleDateString('en-US', options)
}

