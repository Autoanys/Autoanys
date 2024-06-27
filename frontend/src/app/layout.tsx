"use client";
import "jsvectormap/dist/css/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";

import "./i18n";
import { useTranslation } from "next-i18next";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);
  const { t, i18n } = useTranslation();
  // const pathname = usePathname();

  let lang = localStorage.getItem("langSelect") || "en";
  useEffect(() => {
    i18n.changeLanguage(localStorage.getItem("langSelect"));

    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang={lang}>
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? <Loader /> : children}
        </div>
      </body>
    </html>
  );
}
