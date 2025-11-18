// components/AnimatedContent.tsx (Client Component)
"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { appConfig } from "@/config/app";

// Define props for the component (if using TypeScript)
interface AnimatedContentProps {
  isLoggedIn: boolean;
}

export default function AnimatedContent({ isLoggedIn }: AnimatedContentProps) {
  const router = useRouter();
  const mountCountRef = useRef(0);
  const lastMountTimeRef = useRef(Date.now());

  useEffect(() => {

    // Check for potential redirect loop
    const currentTime = Date.now();
    const timeSinceLastMount = currentTime - lastMountTimeRef.current;

    if (!isLoggedIn) {
      mountCountRef.current += 1;
    } else {
      mountCountRef.current = 0; // Reset if logged in
    }

    lastMountTimeRef.current = currentTime;

    // If component is mounting too frequently when logged out, we might be in a loop
    const potentialLoop =
      !isLoggedIn && mountCountRef.current > 2 && timeSinceLastMount < 5000;

    // Set a timer to perform the action after 2 seconds
    const timer = setTimeout(() => {
      if (isLoggedIn) {
        // Use replace to avoid the splash screen being in the browser history
        router.replace("/events");
      } else if (potentialLoop) {
        console.log(
          "Potential redirect loop detected, redirecting to home page"
        );
        router.replace("/events");
      } else {
        console.log("User is not logged in, redirecting to /sign-in");
        // Redirect to sign-in page or another appropriate page for logged-out users
        router.replace("/events");
      }
    }, 2000); // 2 seconds delay

    // Cleanup function to clear the timer if the component unmounts early
    return () => {
      console.log("AnimatedContent unmounting, clearing timer.");
      clearTimeout(timer);
    };
  }, [isLoggedIn, router]); // Dependencies for the effect

  return (
    // Animation remains the same
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center flex flex-col items-center"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="mb-4"
      >
        <div className="text-6xl font-bold audiowide">{appConfig.nameLowercase}</div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="text-gray-400 tracking-widest uppercase text-sm font-medium"
      >
        BY {appConfig.creator}
      </motion.p>
    </motion.div>
  );
}
