"use client";
import React from "react";
import { useTheme } from "next-themes";

const ContactPage = () => {
  const { theme } = useTheme();

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="container mx-auto p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-semibold mb-4 text-center">Contact Us</h1>
        <p className="text-lg mb-6 text-center">
          If you have any queries, please feel free to reach out to us at:
        </p>
        <div className="text-center">
          <a
            href="mailto:queries@example.com"
            className="text-blue-500 hover:underline text-xl"
          >
            queries@example.com
          </a>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
