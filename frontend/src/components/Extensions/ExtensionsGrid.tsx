"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { get } from "http";

const ExtensionsGrid = () => {
  const [plugins, setPlugins] = useState([]);
  const [tabMenu, setTabMenu] = useState("builtIn");

  useEffect(() => {
    const fetchDatas = async () => {
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
    console.log("TTE", plugins);
    fetchDatas();

    console.log("DASDASDSA", plugins);
    // console.log("ASD");
  }, []);

  const handleActiveToggle = async (extenID) => {
    console.log("extenID", extenID);
    const res = fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/plugins/active/" + extenID,
      {
        method: "GET",
      },
    );
    setPlugins((prevPlugins) => {
      const updatedPlugins = prevPlugins.map((plugin) => {
        if (plugin.id === extenID) {
          return {
            ...plugin,
            active: !plugin.active,
          };
        }
        return plugin;
      });
      return updatedPlugins;
    });
  };

  return (
    <div className="mx-auto max-w-270">
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
      {tabMenu === "custom" && <div>Marketplace Coming Soon</div>}
      {tabMenu === "builtIn" && (
        <ul
          role="list"
          className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
        >
          {plugins.map((plugin) => (
            <li
              key={plugin.name}
              className="col-span-1  divide-y divide-slate-100 rounded-lg bg-white shadow-xl dark:bg-boxdark dark:text-white"
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
                  <div className="flex w-0 flex-1">
                    <a
                      href={`mailto:${plugin.doc}`}
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
