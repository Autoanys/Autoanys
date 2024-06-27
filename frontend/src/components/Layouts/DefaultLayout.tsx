"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Flowbar from "@/components/FlowBar";
import { useHotkeys } from "react-hotkeys-hook";
import { useTranslation } from "react-i18next";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPromptVisible, setIsPromptVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();
  useHotkeys("ctrl+k, cmd+k", (event) => {
    event.preventDefault();
    if (inputRef.current) {
      inputRef.current.focus();
      setIsPromptVisible(true);
    }
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        setIsPromptVisible(false);
      }
    };

    const handleEsc = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        setIsPromptVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  return (
    <>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Start ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <Flowbar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Start ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden bg-white dark:bg-[#1E1E2F]">
          {/* <!-- ===== Header Start ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

          {/* <div className="relative">
            <input
              type="text"
              placeholder="Type to search..."
              className="w-full bg-white p-2 pl-12 pr-4 font-medium focus:outline-none xl:w-125"
              ref={inputRef}
              onFocus={() => setIsPromptVisible(true)}
            />
            <div className="text-gray-500 absolute right-4 top-1/2 -translate-y-1/2 transform">
              {navigator.platform.includes("Mac") ? "⌘+K" : "Ctrl+K"}
            </div>
            {isPromptVisible && (
              <div className="border-gray-300 absolute left-0 top-full z-10 w-full border bg-white p-4 shadow-lg">
                <p className="text-gray-700">Search Prompt...</p>
              </div>
            )}
          </div> */}

          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Start ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl bg-white p-4 dark:bg-[#1E1E2F] md:p-6 2xl:p-10">
              {children}
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
