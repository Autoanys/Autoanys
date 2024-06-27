"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import SidebarLinkGroup from "./SidebarLinkGroup";
import { FormattedMessage, useIntl } from "react-intl";
import { useRouter } from "next/router";
import {
  HomeIcon,
  PluginIcon,
  SubFlowIcon,
  MainFlowIcon,
  ComponentIcon,
  LoggingIcon,
  SettingIcon,
  UncollapseIcon,
  CollapseIcon,
} from "./icon";

import Head from "next/head";
import { useTranslation } from "react-i18next";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (arg: boolean) => void;
}

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const pathname = usePathname();
  const trigger = useRef(null);
  const sidebar = useRef(null);
  const { t, i18n } = useTranslation("sidebar");

  const storedSidebarExpanded = localStorage.getItem("sidebar-expanded");
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? true : storedSidebarExpanded === "true",
  );

  const sideBarItem = [
    {
      name: t("sidebar_main_dashboard"),
      icon: <HomeIcon />,
      link: "/",
      sn: "/",
    },
    {
      name: t("sidebar_main_mainflow"),
      icon: <MainFlowIcon />,
      link: "/mainflow",
      sn: "main",
    },
    {
      name: t("sidebar_main_subflow"),
      icon: <SubFlowIcon />,
      link: "/subflow",
      sn: "sub",
    },
    {
      name: t("sidebar_main_custom_component"),
      icon: <ComponentIcon />,
      link: "/customcomponents",
      sn: "component",
    },
    {
      name: t("sidebar_main_plugins_extensions"),
      icon: <PluginIcon />,
      link: "/plugins",
      sn: "plugin",
    },
    {
      name: t("sidebar_main_logging"),
      icon: <LoggingIcon />,
      link: "/logging",
      sn: "log",
    },
    {
      name: t("sidebar_main_settings"),
      icon: <SettingIcon />,
      link: "/settings",
      sn: "setting",
    },
  ];

  // close on click outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!sidebar.current || !trigger.current) return;

      if (
        !sidebarOpen ||
        sidebar.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setSidebarOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ key }) => {
      if (!sidebarOpen || key !== "Escape") return;
      setSidebarOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    localStorage.setItem("sidebar-expanded", sidebarExpanded.toString());
    if (sidebarExpanded) {
      document.querySelector("body").classList.add("sidebar-expanded");
    } else {
      document.querySelector("body").classList.remove("sidebar-expanded");
    }
  }, [sidebarExpanded]);

  return (
    <aside
      ref={sidebar}
      className={`fixed left-0 top-0 z-40 h-screen flex-col overflow-y-hidden bg-slate-50 duration-300 ease-linear dark:bg-slate-900  ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:static lg:translate-x-0 ${sidebarExpanded ? "w-64" : "w-25"}`}
    >
      <div
        className={`flex items-center justify-between gap-2 bg-slate-50 px-6 py-4 shadow-1 drop-shadow-1 dark:bg-slate-900 dark:drop-shadow 
        ${sidebarExpanded ? " pb-7" : " pb-8"}`}
      >
        <Link href="/">
          <Image
            className="dark:hidden"
            width={sidebarExpanded ? 245 : 50}
            height={50}
            src={
              sidebarExpanded
                ? "/images/logo/newLogo.png"
                : "/images/logo/logo-icon.svg"
            }
            alt="Logo"
            priority
          />

          <Image
            className="hidden dark:block"
            width={sidebarExpanded ? 245 : 50}
            height={50}
            src={
              sidebarExpanded
                ? "/images/logo/logo-dark.png"
                : "/images/logo/logo-icon.svg"
            }
            alt="Logo"
            priority
          />
        </Link>
        <button
          ref={trigger}
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-controls="sidebar"
          aria-expanded={sidebarOpen}
          className="block lg:hidden"
        >
          <svg
            className="fill-current"
            width="20"
            height="18"
            viewBox="0 0 20 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19 8.175H2.98748L9.36248 1.6875C9.69998 1.35 9.69998 0.825 9.36248 0.4875C9.02498 0.15 8.49998 0.15 8.16248 0.4875L0.399976 8.3625C0.0624756 8.7 0.0624756 9.225 0.399976 9.5625L8.16248 17.4375C8.31248 17.5875 8.53748 17.7 8.76248 17.7C8.98748 17.7 9.17498 17.625 9.36248 17.475C9.69998 17.1375 9.69998 16.6125 9.36248 16.275L3.02498 9.8625H19C19.45 9.8625 19.825 9.4875 19.825 9.0375C19.825 8.55 19.45 8.175 19 8.175Z"
              fill=""
            />
          </svg>
        </button>
        <button
          onClick={() => setSidebarExpanded(!sidebarExpanded)}
          className="hidden lg:block"
        >
          {sidebarExpanded ? <CollapseIcon /> : <UncollapseIcon />}
        </button>
      </div>

      <div className="no-scrollbar flex h-full flex-col overflow-y-auto duration-300 ease-linear">
        <nav className="mt-5 px-4 py-4 lg:mt-9 lg:px-6">
          <div>
            {sidebarExpanded && (
              <h3 className="mb-4 ml-4 text-sm font-semibold text-bodydark2 dark:text-white">
                {t("sidebar_welcome")}
              </h3>
            )}

            <ul className="mb-6 flex flex-col gap-1.5">
              {sideBarItem.map((item, index) => (
                <li key={index}>
                  <Link
                    href={item.link}
                    className={`gbold group relative flex items-center gap-2.5 rounded-lg px-4 py-4 text-sm font-medium font-semibold text-black duration-300 ease-in-out hover:bg-white hover:shadow-2xl dark:text-[#FFFFFF] dark:hover:bg-meta-4 ${
                      (pathname === item.link ||
                        (item.link !== "/" && pathname.includes(item.sn))) &&
                      "bg-white shadow-2xl dark:bg-[#2C2C3E]"
                    }`}
                  >
                    {item.icon}
                    {sidebarExpanded && item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="fixed bottom-0 m-auto items-center justify-center text-sm text-black">
            <span
              className={`pb-12 font-medium dark:text-white ${sidebarExpanded ? "ml-4" : "ml-0"}`}
            >
              {/* <span className={`  ${sidebarExpanded ? "" : "hidden"}`}> */}

              <span className={``}>
                {" "}
                {sidebarExpanded ? "© 2023-2024 ⚙️ AutoAnys" : "AutoAnys"}
              </span>
            </span>
          </div>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
