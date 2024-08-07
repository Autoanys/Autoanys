"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import Flowbar from "@/components/FlowBar";

import { useTranslation } from "react-i18next";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t } = useTranslation();

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (inputRef.current && !inputRef.current.contains(event.target)) {
  //       setIsPromptVisible(false);
  //     }
  //   };

  //   const handleEsc = (event: React.KeyboardEvent<HTMLInputElement>) => {
  //     if (event.key === "Escape") {
  //       setIsPromptVisible(false);
  //     }
  //   };

  //   document.addEventListener("mousedown", handleClickOutside);
  //   document.addEventListener("keydown", handleEsc);

  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //     document.removeEventListener("keydown", handleEsc);
  //   };
  // }, []);

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
