"use client";
import { useState, useEffect, use } from "react";
import { Fragment } from "react";
import {
  ExclamationCircleIcon,
  XIcon,
  CheckCircleIcon,
} from "@heroicons/react/outline";
import { Transition } from "@headlessui/react";

import Link from "next/link";
import { get } from "http";
import { plugin } from "postcss";
// import Notification from "../common/Notification";

const ExtensionsGrid = () => {
  const [plugins, setPlugins] = useState([]);
  const [tabMenu, setTabMenu] = useState("builtIn");
  const [resultLoading, setResultLoading] = useState(true);
  const [showNotification, setShowNotification] = useState({
    show: false,
    code: 200,
    message: "",
  });

  const notify = async (code, message) => {
    setShowNotification({
      show: true,
      code: code,
      message: message,
    });
    setTimeout(() => {
      setShowNotification({
        show: false,
        code: 200,
        message: "",
      });
    }, 3000);
  };

  useEffect(() => {
    const fetchDatas = async () => {
      setResultLoading(true);
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/plugins/",
          {
            method: "GET",
          },
        );

        const data = await res.json();

        setPlugins(data.plugins);
        // console.log("TTE", data.total_workflows);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas().then(() => {
      setResultLoading(false);
    });
  }, []);

  const handleActiveToggle = (extenID) => {
    console.log("extenID", extenID);
    try {
      const res = fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/plugins/active/" + extenID,
        {
          method: "GET",
        },
      );
      // if (res.status !== 200) {
      //   notify(res.status, "Error in activating plugin");
      // }

      let plugTF;

      setPlugins((prevPlugins) => {
        const updatedPlugins = prevPlugins.map((plugin) => {
          if (plugin.id === extenID) {
            return {
              ...plugin,
              active: !plugin.active,
            };
          }
          plugTF = plugin.active;
          return plugin;
        });
        notify("200", "Successful");
        return updatedPlugins;
      });
    } catch (error) {
      notify(res.status, "Error in activating plugin");
    }
  };

  return (
    <div className="max-w-200 mx-auto">
      {showNotification.show && (
        <div
          aria-live="assertive"
          className="pointer-events-none fixed inset-0 z-999 mt-30 flex items-end px-4 py-6 sm:items-start sm:p-6"
        >
          <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
            <Transition
              show={showNotification.show}
              as={Fragment}
              enter="transform ease-out duration-300 transition"
              enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
              enterTo="translate-y-0 opacity-100 sm:translate-x-0"
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="pointer-events-auto w-1/3 overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      {showNotification.code == 200 ? (
                        <CheckCircleIcon
                          className="h-6 w-6 text-emerald-700"
                          aria-hidden="true"
                        />
                      ) : (
                        <ExclamationCircleIcon
                          className="h-6 w-6 text-red"
                          aria-hidden="true"
                        />
                      )}
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p
                        className={`text-sm font-medium ${showNotification.code == 200 ? "text-emerald-700" : "text-red"} `}
                      >
                        {showNotification.code}
                      </p>
                      <p className="text-gray-500 mt-1 text-sm">
                        {showNotification.message}
                      </p>
                    </div>
                    <div className="ml-4 flex flex-shrink-0">
                      <button
                        className="text-gray-400 hover:text-gray-500 inline-flex rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        onClick={() => {
                          setShowNotification({
                            show: false,
                            code: 200,
                            message: "",
                          });
                        }}
                      >
                        <span className="sr-only">Close</span>
                        <XIcon className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-gray-900 mt-6 text-xl font-semibold">
          {tabMenu === "builtIn" ? "Built-In Extensions" : "Marketplace"}
        </h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setTabMenu("builtIn")}
            className={`${
              tabMenu === "builtIn"
                ? "bg-indigo-400 text-white"
                : "text-gray-500"
            } rounded-lg px-3 py-1`}
          >
            Built-in
          </button>
          <button
            onClick={() => setTabMenu("custom")}
            className={`${
              tabMenu === "custom"
                ? "bg-indigo-400 text-white"
                : "text-gray-500"
            } rounded-lg px-3 py-1`}
          >
            Marketplace
          </button>
        </div>
      </div>

      {resultLoading && (
        <div className="bg-gray-900 fixed inset-0 flex items-center justify-center bg-opacity-50">
          <p className="hidden text-black dark:text-white sm:block">
            <img
              src={"/images/general/loading.gif"}
              alt="Loading"
              className="mx-auto h-10 w-10 animate-spin"
            />
          </p>
        </div>
      )}

      {tabMenu === "custom" && <div>Marketplace Coming Soon</div>}
      {tabMenu === "builtIn" && (
        <ul
          role="list"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          {plugins.map((plugin) => (
            <li
              key={plugin.name}
              className="col-span-1  divide-y divide-slate-100 rounded-lg bg-white shadow-xl dark:divide-slate-600 dark:bg-boxdark dark:text-white"
            >
              <div className="flex w-full items-center justify-between space-x-6 p-6">
                <div className="flex-1 truncate">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-gray-900 truncate text-sm font-medium">
                      {plugin.name}
                    </h3>
                    {/* <span className="inline-block flex-shrink-0 rounded-full bg-red px-2 py-0.5 text-xs font-medium text-green-800">
                  {plugin.role}
                </span> */}
                  </div>
                  <p className="text-gray-500 mt-1 truncate text-sm">
                    {plugin.title}
                  </p>
                </div>
                <img
                  className="bg-gray-300 h-10 w-10 flex-shrink-0 rounded-full"
                  src={plugin.imageUrl}
                  alt=""
                />
              </div>
              <div className="grid grid-cols-2">
                <div className="divide-gray-200 col-span-1 -mt-px flex">
                  <div className="flex w-0 flex-1 hover:bg-slate-100">
                    <a
                      href={plugin.doc}
                      target="_blank"
                      className="text-gray-700 hover:text-gray-500 relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium"
                    >
                      {/* <MailIcon
                    className="text-gray-400 h-5 w-5"
                    aria-hidden="true"
                  /> */}

                      <svg
                        width="20px"
                        height="20px"
                        viewBox="-274.15 0 1200 1200"
                        xmlns="http://www.w3.org/2000/svg"
                        className="cf-icon-svg fill-current"
                      >
                        <path d="M30 161c-16.5 0-30 13.5-30 30v827.8c0 16.5 13.5 30 30 30h591.7c16.5 0 30-13.5 30-30V343.7L469 161H30zm389.6 60v134.8c0 19.9 16.3 36.2 36.2 36.2h135.9v596.8H60V221h359.6z" />
                        <path d="M123.8 768.6h394.8v50H123.8zm0-124.6h394.8v50H123.8zm0-124.5h394.8v50H123.8z" />
                        <circle cx="194" cy="382.3" r="60" />
                      </svg>

                      <span className="ml-3">Docs</span>
                    </a>
                  </div>
                </div>

                <div className="col-span-1 m-auto flex cursor-pointer items-center">
                  <div
                    className="relative"
                    onClick={() => handleActiveToggle(plugin.id)}
                  >
                    <input
                      type="checkbox"
                      checked={plugin.active}
                      onClick={() => handleActiveToggle(plugin.id)}
                      className="sr-only"
                    />

                    <div
                      className={`block border border-slate-200 ${plugin.active ? "bg-green-500" : "bg-slate-500"} h-6 w-12 rounded-full`}
                    ></div>
                    <div
                      className={`dot  absolute top-1 h-5 w-5 rounded-full transition ${plugin.active ? "translate-x-6" : "translate-x-0"}`}
                    ></div>
                  </div>
                  <span className="text-gray-700 hidden pl-2 text-xs dark:text-white md:block">
                    {plugin.active ? "Active" : "Disabled"}
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExtensionsGrid;
