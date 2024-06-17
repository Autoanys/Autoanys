"use client";
import { useState, useEffect, Component } from "react";
import Link from "next/link";
import {
  useSignal,
  useComputed,
  useSignalEffect,
  signal,
} from "@preact/signals";

const ComponentTable = () => {
  const [subflows, setSubflows] = useState([]);
  const [allFlow, setAllFlow] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  const getFlow = (flow_id) => {
    return async () => {
      try {
        let post_data = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL +
            "/components/componentID/" +
            flow_id,
          {
            method: "GET",
          },
        );

        console.log("Check return post_data", await post_data.json());
        // get the data and flowjson within the post_data json
        let flowdata = await post_data.json();

        //console.log(post_data, "post_data");
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/flow/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: post_data.flowjson,
          },
        );
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
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/components/all/",
        );
        const data = await res.json();
        if (data && data.data) {
          setSubflows(data.data);
          setAllFlow(data.data); // Ensure allFlow is set initially
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
    setDeleted(false);
  }, [deleted]); // Removed allFlow dependency

  const deleteFlow = (id) => async () => {
    setDeleted(true);
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/delete/" + id,
        {
          method: "GET",
        },
      );
      const data = await res.json();
      if (data && data.data) {
        console.log("Before update:", subflows);
        setSubflows((prevSubflows) => {
          const updatedSubflows = prevSubflows.filter(
            (subflow) => subflow.id !== id,
          );
          console.log("Updated subflows:", updatedSubflows);
          return updatedSubflows;
        });
        setAllFlow((prevAllFlow) => {
          const updatedAllFlow = prevAllFlow.filter(
            (subflow) => subflow.id !== id,
          );
          console.log("Updated allFlow:", updatedAllFlow);
          return updatedAllFlow;
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubflows = subflows.slice(startIndex, endIndex);

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Custom Components
      </h4>

      <div className="flex flex-col rounded-t-lg border	border-slate-300 text-black">
        <div className="grid grid-cols-4 rounded-sm bg-indigo-50 uppercase dark:bg-white sm:grid-cols-4">
          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Component Name</b>
            </h5>
          </div>

          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            {" "}
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Component ID</b>
            </h5>
          </div>

          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            {" "}
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Component Description</b>
            </h5>
          </div>

          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            {" "}
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Actions (V/E/P/D)</b>
            </h5>
          </div>
        </div>

        {currentSubflows.map((subflow, index) => (
          <div
            className={`grid grid-cols-4 sm:grid-cols-4 ${
              index === subflows.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={subflow.id}
          >
            <div className="flex items-center gap-3 pl-2.5 ">
              <p
                className="text-bla ck
              hidden dark:text-white sm:block"
              >
                {subflow.name}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-2.5 ">
              <p className="hidden text-black dark:text-white sm:block">
                {/* {subflow.id} */}
                {truncateText(subflow.id, 15)}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-2.5 ">
              <p
                className="hidden text-black dark:text-white sm:block"
                title={subflow.description}
              >
                {truncateText(subflow.description, 30)}
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
                      pathname: "/componentedit",
                      query: { componentid: subflow.id },
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
                    className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr text-center align-middle text-xs font-medium uppercase text-white shadow-md transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    onClick={getFlow(subflow.id)}
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
      <div className="mt-4 flex items-center justify-between">
        <div>
          <label htmlFor="itemsPerPage" className="mr-2 font-bold	">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={(e) => {
              setItemsPerPage(Number(e.target.value));
              setCurrentPage(1); // Reset to first page when items per page change
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
        <div>
          <div className="mt-4 flex items-center justify-end">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={
                currentPage === 1 ? "cursor-not-allowed" : "text-blue-700	"
              }
            >
              Previous
            </button>
            <span className="mx-2">
              Page {currentPage} of {Math.ceil(subflows.length / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(subflows.length / itemsPerPage)
                    ? prev + 1
                    : prev,
                )
              }
              disabled={
                currentPage === Math.ceil(subflows.length / itemsPerPage)
              }
              className={
                currentPage === Math.ceil(subflows.length / itemsPerPage)
                  ? "cursor-not-allowed"
                  : "text-blue-700	"
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComponentTable;
