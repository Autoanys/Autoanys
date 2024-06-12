"use client";
import { useState, useEffect, use } from "react";
import Link from "next/link";
import { get } from "http";

const ExtensionsGrid = () => {
  const [subflows, setSubflows] = useState([]);
  const [allFlow, setAllFlow] = useState([]);
  const [plugins, setPlugins] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const getFlow = async () => {
    try {
      //console.log("Flow Data", JSON.stringify({ nodes, edges }, null, 2));
      let post_data = JSON.stringify({ nodes, edges }, null, 2);

      //console.log(post_data, "post_data");
      const res = await fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/flow/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: post_data,
      });
      console.log(res.status);
      if (res.status === 450) {
        console.log("IN");
        setShowNotification(true);
        setTimeout(() => {
          setShowNotification(false);
        }, 3000);
      } else {
        const data = await res.json();

        console.log("from api", data);
        let tmp_id;
        for (let i = 0, l = data.steps.length; i < l; i++) {
          setPlaying(true);
          console.log("i wor", i + 1);
          console.log("datastep", data.steps[i]);

          await fetch(data.steps[i], {
            method: "GET",
          });

          if (i === data.steps.length - 1) {
            setPlaying(false);
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

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
        console.log("GridData", data);
        const overviewData = JSON.parse(data);
        console.log("TTE", overviewData);
        setPlugins(data);
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

  const deleteFlow = (id) => {
    return async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/delete/" + id,
          {
            method: "GET",
          },
        );
        const data = await res.json();
        if (data && data.data) {
          try {
            setSubflows(data.data);
            setAllFlow(data.data);
          } catch (err) {
            console.log(err);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  };

  useEffect(() => {
    console.log(subflows);
  }, [subflows]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(process.env.NEXT_PUBLIC_BACKEND_URL);
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/all/",
        );
        const data = await res.json();
        if (data && data.data) {
          setSubflows(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, [allFlow]);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <ul
        role="list"
        className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4"
      >
        {plugins.map((plugin) => (
          <li
            key={plugin.doc}
            className="col-span-1  divide-y divide-slate-100 rounded-lg bg-white shadow-xl"
          >
            <div className="flex w-full items-center justify-between space-x-6 p-6">
              <div className="flex-1 truncate">
                <div className="flex items-center space-x-3">
                  <h3 className="text-gray-900 truncate text-sm font-medium">
                    {plugin.name}
                  </h3>
                  <span className="inline-block flex-shrink-0 rounded-full bg-red px-2 py-0.5 text-xs font-medium text-green-800">
                    {plugin.role}
                  </span>
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
            <div>
              <div className="divide-gray-200 -mt-px flex ">
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
                      fill="#000000"
                      width="20px"
                      height="20px"
                      viewBox="-274.15 0 1200 1200"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cf-icon-svg"
                    >
                      <path d="M30 161c-16.5 0-30 13.5-30 30v827.8c0 16.5 13.5 30 30 30h591.7c16.5 0 30-13.5 30-30V343.7L469 161H30zm389.6 60v134.8c0 19.9 16.3 36.2 36.2 36.2h135.9v596.8H60V221h359.6z" />
                      <path d="M123.8 768.6h394.8v50H123.8zm0-124.6h394.8v50H123.8zm0-124.5h394.8v50H123.8z" />
                      <circle cx="194" cy="382.3" r="60" />
                    </svg>

                    <span className="ml-3">Docs</span>
                  </a>
                </div>
                <div className="-ml-px flex w-0 flex-1">
                  <a
                    href={`tel:${plugin.telephone}`}
                    className="text-gray-700 hover:text-gray-500 relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium"
                  >
                    {/* <PhoneIcon
                        className="text-gray-400 h-5 w-5"
                        aria-hidden="true"
                      /> */}
                    <span className="ml-3">Call</span>
                  </a>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Sub Flow
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-3">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium  xsm:text-base">
              <b>Flow ID</b>
              {/* uppercase */}
            </h5>
          </div>

          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium  xsm:text-base">
              <b>Flow Name</b>
            </h5>
          </div>

          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium  xsm:text-base">
              <b>Actions</b>
            </h5>
          </div>
          {/* Add headers for other columns here */}
        </div>

        {subflows.map((subflow, index) => (
          <div
            className={`grid grid-cols-3 sm:grid-cols-3 ${
              index === subflows.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={index}
          >
            <div className="flex items-center gap-3 pl-2.5 ">
              <p
                className="text-bla ck
              hidden dark:text-white sm:block"
              >
                {subflow.id}
                {/* // xl:p-5 */}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-2.5 ">
              <p className="hidden text-black dark:text-white sm:block">
                {subflow.name}
              </p>
            </div>

            <div className="flex items-center gap-4 pl-2.5 ">
              <p className="hidden text-black dark:text-white sm:block">
                <div className="flex gap-4">
                  <button
                    className="font-sans bg-gray-900 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle text-xs font-medium uppercase text-white shadow-md transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                  >
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fill="#000000"
                          d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z"
                        />
                      </svg>
                    </span>
                  </button>

                  <Link
                    href={{
                      pathname: "/subflowedit",
                      query: { flowid: subflow.id },
                    }}
                  >
                    <button
                      className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr text-center align-middle text-xs font-medium uppercase text-white shadow-md transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button"
                    >
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z"
                            fill="#080341"
                          />
                        </svg>
                      </span>
                    </button>
                  </Link>

                  <button
                    onClick={getFlow(subflow.id)}
                    className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr text-center align-middle text-xs font-medium uppercase text-white shadow-md transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                  >
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 16 16"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="#000000"
                      >
                        <path d="M2.78 2L2 2.41v12l.78.42 9-6V8l-9-6zM3 13.48V3.35l7.6 5.07L3 13.48z" />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M6 14.683l8.78-5.853V8L6 2.147V3.35l7.6 5.07L6 13.48v1.203z"
                        />
                      </svg>
                    </span>
                  </button>
                </div>
              </p>

              <button
                className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr text-center align-middle text-xs font-medium uppercase text-white shadow-md transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                type="button"
                onClick={deleteFlow(subflow.id)}
              >
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.0038 17.9792L18.7155 8.56456C18.8322 7.9227 18.8906 7.60178 18.7282 7.51633C18.5659 7.43088 18.3344 7.66067 17.8714 8.12025L16.985 9L12 10L6.99621 9L6.13263 8.13478C5.66847 7.66974 5.43639 7.43722 5.27345 7.5225C5.1105 7.60778 5.16927 7.931 5.28681 8.57744L6.99621 17.9792C6.99868 17.9927 7.00522 18.0052 7.01497 18.015C9.76813 20.7681 14.2319 20.7681 16.985 18.015C16.9948 18.0052 17.0013 17.9927 17.0038 17.9792Z"
                      fill="#2A4157"
                      fill-opacity="0.24"
                    />
                    <ellipse
                      cx="12"
                      cy="7"
                      rx="7"
                      ry="3"
                      stroke="#222222"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                    <path
                      d="M5 7L6.99621 17.9792C6.99868 17.9927 7.00522 18.0052 7.01497 18.015V18.015C9.76813 20.7681 14.2319 20.7681 16.985 18.015V18.015C16.9948 18.0052 17.0013 17.9927 17.0038 17.9792L19 7"
                      stroke="#222222"
                      stroke-width="1.2"
                      stroke-linecap="round"
                    />
                  </svg>
                </span>
              </button>
            </div>

            {/* Render other columns here */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtensionsGrid;
