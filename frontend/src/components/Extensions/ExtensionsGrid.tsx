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

  const handleButtonClick = () => {
    document.getElementById("extensionImport").click();
  };

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
          {tabMenu === "builtIn" ? "Extensions" : "Marketplace"}
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

      <input
        type="text"
        placeholder={` 🔍 Search Extension / Plugin by name or description`}
        className="mb-6 h-10 w-full rounded-md border border-stroke px-3 dark:border-strokedark dark:bg-boxdark"
        onChange={(e) => {
          const search = e.target.value;
          setPlugins((prevPlugins) => {
            return prevPlugins.filter((plugin) => {
              return (
                plugin.name.toLowerCase().includes(search.toLowerCase()) ||
                plugin.title.toLowerCase().includes(search.toLowerCase())
              );
            });
          });
          if (search === "") {
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
          }
        }}
      />

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
          className="grid grid-cols-1 gap-2 sm:grid-cols-3 lg:grid-cols-3"
        >
          {plugins.map((plugin) => (
            <li
              key={plugin.name}
              className="col-span-1 rounded-lg bg-white  shadow-lg hover:shadow-xl dark:divide-slate-600 dark:bg-boxdark dark:text-white"
            >
              <div className="flex w-full p-6">
                {/* First Column */}
                <div className="flex-1 pr-4">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-gray-900 truncate text-sm font-semibold dark:text-white">
                      {plugin.name}
                      {plugin.type == "BuiltIn" ? (
                        <span className="pl-1 font-normal">(Built-in)</span>
                      ) : (
                        <span className="pl-1 font-normal">(Imported)</span>
                      )}
                    </h3>
                  </div>
                  <p className="text-gray-500 mt-1  text-sm dark:text-slate-300">
                    {plugin.title}
                  </p>
                  <div className="mt-4 ">
                    <a
                      href={plugin.doc}
                      target="_blank"
                      className="text-gray-700 hover:text-gray-500 inline-flex items-center text-sm font-medium"
                    >
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
                      <span className="ml-3 hover:text-blue-500">Docs</span>
                    </a>
                  </div>
                  {plugin.setting && (
                    <div className="">
                      <a
                        href={"/plugins/settings?id=" + plugin.id}
                        target="_blank"
                        className="text-gray-700 hover:text-gray-500 inline-flex items-center text-sm font-medium"
                      >
                        <svg
                          className="cf-icon-svg fill-current"
                          height="20px"
                          width="20px"
                          version="1.1"
                          id="Capa_1"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="-5 -5 64 64"
                        >
                          <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                          <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                          ></g>
                          <g id="SVGRepo_iconCarrier">
                            <g>
                              <path d="M51.22,21h-5.052c-0.812,0-1.481-0.447-1.792-1.197s-0.153-1.54,0.42-2.114l3.572-3.571 c0.525-0.525,0.814-1.224,0.814-1.966c0-0.743-0.289-1.441-0.814-1.967l-4.553-4.553c-1.05-1.05-2.881-1.052-3.933,0l-3.571,3.571 c-0.574,0.573-1.366,0.733-2.114,0.421C33.447,9.313,33,8.644,33,7.832V2.78C33,1.247,31.753,0,30.22,0H23.78 C22.247,0,21,1.247,21,2.78v5.052c0,0.812-0.447,1.481-1.197,1.792c-0.748,0.313-1.54,0.152-2.114-0.421l-3.571-3.571 c-1.052-1.052-2.883-1.05-3.933,0l-4.553,4.553c-0.525,0.525-0.814,1.224-0.814,1.967c0,0.742,0.289,1.44,0.814,1.966l3.572,3.571 c0.573,0.574,0.73,1.364,0.42,2.114S8.644,21,7.832,21H2.78C1.247,21,0,22.247,0,23.78v6.439C0,31.753,1.247,33,2.78,33h5.052 c0.812,0,1.481,0.447,1.792,1.197s0.153,1.54-0.42,2.114l-3.572,3.571c-0.525,0.525-0.814,1.224-0.814,1.966 c0,0.743,0.289,1.441,0.814,1.967l4.553,4.553c1.051,1.051,2.881,1.053,3.933,0l3.571-3.572c0.574-0.573,1.363-0.731,2.114-0.42 c0.75,0.311,1.197,0.98,1.197,1.792v5.052c0,1.533,1.247,2.78,2.78,2.78h6.439c1.533,0,2.78-1.247,2.78-2.78v-5.052 c0-0.812,0.447-1.481,1.197-1.792c0.751-0.312,1.54-0.153,2.114,0.42l3.571,3.572c1.052,1.052,2.883,1.05,3.933,0l4.553-4.553 c0.525-0.525,0.814-1.224,0.814-1.967c0-0.742-0.289-1.44-0.814-1.966l-3.572-3.571c-0.573-0.574-0.73-1.364-0.42-2.114 S45.356,33,46.168,33h5.052c1.533,0,2.78-1.247,2.78-2.78V23.78C54,22.247,52.753,21,51.22,21z M52,30.22 C52,30.65,51.65,31,51.22,31h-5.052c-1.624,0-3.019,0.932-3.64,2.432c-0.622,1.5-0.295,3.146,0.854,4.294l3.572,3.571 c0.305,0.305,0.305,0.8,0,1.104l-4.553,4.553c-0.304,0.304-0.799,0.306-1.104,0l-3.571-3.572c-1.149-1.149-2.794-1.474-4.294-0.854 c-1.5,0.621-2.432,2.016-2.432,3.64v5.052C31,51.65,30.65,52,30.22,52H23.78C23.35,52,23,51.65,23,51.22v-5.052 c0-1.624-0.932-3.019-2.432-3.64c-0.503-0.209-1.021-0.311-1.533-0.311c-1.014,0-1.997,0.4-2.761,1.164l-3.571,3.572 c-0.306,0.306-0.801,0.304-1.104,0l-4.553-4.553c-0.305-0.305-0.305-0.8,0-1.104l3.572-3.571c1.148-1.148,1.476-2.794,0.854-4.294 C10.851,31.932,9.456,31,7.832,31H2.78C2.35,31,2,30.65,2,30.22V23.78C2,23.35,2.35,23,2.78,23h5.052 c1.624,0,3.019-0.932,3.64-2.432c0.622-1.5,0.295-3.146-0.854-4.294l-3.572-3.571c-0.305-0.305-0.305-0.8,0-1.104l4.553-4.553 c0.304-0.305,0.799-0.305,1.104,0l3.571,3.571c1.147,1.147,2.792,1.476,4.294,0.854C22.068,10.851,23,9.456,23,7.832V2.78 C23,2.35,23.35,2,23.78,2h6.439C30.65,2,31,2.35,31,2.78v5.052c0,1.624,0.932,3.019,2.432,3.64 c1.502,0.622,3.146,0.294,4.294-0.854l3.571-3.571c0.306-0.305,0.801-0.305,1.104,0l4.553,4.553c0.305,0.305,0.305,0.8,0,1.104 l-3.572,3.571c-1.148,1.148-1.476,2.794-0.854,4.294c0.621,1.5,2.016,2.432,3.64,2.432h5.052C51.65,23,52,23.35,52,23.78V30.22z"></path>
                              <path d="M27,18c-4.963,0-9,4.037-9,9s4.037,9,9,9s9-4.037,9-9S31.963,18,27,18z M27,34c-3.859,0-7-3.141-7-7s3.141-7,7-7 s7,3.141,7,7S30.859,34,27,34z"></path>
                            </g>
                          </g>
                        </svg>

                        <span className="ml-3 hover:text-blue-500">
                          Settings
                        </span>
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex flex-col items-center justify-between">
                  <img
                    className="bg-gray-300 h-10 w-10 flex-shrink-0 rounded-full"
                    src={plugin.imageUrl}
                    alt=""
                  />

                  <div
                    className="relative mt-4"
                    onClick={() => handleActiveToggle(plugin.id)}
                  >
                    <input
                      type="checkbox"
                      checked={plugin.active}
                      onChange={() => handleActiveToggle(plugin.id)}
                      className="sr-only"
                    />
                    <div
                      className={`block h-6 w-12 rounded-full border border-slate-200 ${
                        plugin.active ? "bg-green-500" : "bg-slate-500"
                      }`}
                    ></div>
                    <div
                      className={`dot absolute top-1 h-5 w-5 rounded-full transition ${
                        plugin.active ? "translate-x-6" : "translate-x-0"
                      }`}
                    ></div>
                  </div>
                  <span className="text-gray-700 mt-1 hidden pl-2 text-xs dark:text-white md:block">
                    {plugin.active ? "Plugin Activated" : "Plugin Disabled"}
                  </span>
                </div>
              </div>
            </li>
          ))}

          {!resultLoading && (
            <li
              className="col-span-1 flex cursor-pointer items-center justify-center rounded-lg bg-white shadow-lg hover:text-slate-800 hover:shadow-xl dark:divide-slate-600 dark:bg-boxdark dark:text-white"
              onClick={handleButtonClick}
            >
              <div className="flex items-center justify-center gap-x-4">
                <button
                  className="group relative flex items-center gap-2.5 rounded-lg	px-4
 py-4 text-xl text-black text-slate-500 duration-300 ease-in-out hover:text-slate-800 dark:text-white dark:hover:bg-meta-4"
                >
                  📥 Import Extension
                </button>
                <input
                  type="file"
                  id="extensionImport"
                  accept=".zip"
                  style={{ display: "none" }}
                />
              </div>
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default ExtensionsGrid;
