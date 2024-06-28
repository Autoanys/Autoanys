"use client";
import { useState, useEffect, Component } from "react";
import Link from "next/link";
import {
  useSignal,
  useComputed,
  useSignalEffect,
  signal,
} from "@preact/signals";

const LoggingTable = () => {
  const [logData, setLogData] = useState([]);
  const [allFlow, setAllFlow] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [collapsedIndex, setCollapsedIndex] = useState(null);
  const [resultLoading, setResultLoading] = useState(false);

  const toggleCollapse = (index) => {
    setCollapsedIndex(collapsedIndex === index ? null : index);
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  useEffect(() => {
    const fetchData = async () => {
      setResultLoading(true);
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/all/",
        );
        const data = await res.json();
        if (data && data.data) {
          setLogData(data.data);
          setAllFlow(data.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData().then(() => setResultLoading(false));
    setDeleted(false);
  }, [deleted]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentLog = logData.slice(startIndex, endIndex);
  const [logDetails, setLogDetails] = useState({});
  const [detailPopup, setDetailPopup] = useState(false);

  function formatDate(dateString) {
    const date = new Date(dateString);

    const dateOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    const timeOptions = {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };

    const formattedDate = date.toLocaleDateString(undefined, dateOptions);
    const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

    return `${formattedDate}, ${formattedTime}`;
  }
  const getLog = (triggerID) => {
    fetch(process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/step/" + triggerID, {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        setLogDetails(data.data);
        setDetailPopup(true);
      })
      .then(() => setResultLoading(false))
      .catch((err) => console.error("Error fetching data:", err));
  };

  const closePopup = () => {
    setDetailPopup(false);
  };

  const handleClickOutside = (event) => {
    if (event.target === event.currentTarget) {
      closePopup();
    }
  };

  return (
    <div className="rounded-sm  bg-white px-5 pb-2.5 pt-6  dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Execution Logging
      </h4>

      <input
        type="text"
        placeholder=" 🔍 Search Logging by Trigger ID or Datetime"
        className="mb-6 h-10 w-full rounded-md border border-stroke px-3 dark:border-strokedark dark:bg-boxdark"
        onChange={(e) => {
          const searchValue = e.target.value.toLowerCase();
          const filteredLog = allFlow.filter((log) => {
            return (
              log.triggerID.toLowerCase().includes(searchValue) ||
              log.created_at.toLowerCase().includes(searchValue)
            );
          });
          setLogData(filteredLog);
        }}
      />

      <div className="flex flex-col rounded-t-lg border	border-slate-300 text-black">
        <div className="grid grid-cols-9 divide-x divide-slate-300 rounded-t-lg bg-indigo-50 uppercase dark:bg-white sm:grid-cols-9">
          <div className="xl:bt-5 col-span-2 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Triggered ID</b>
            </h5>
          </div>
          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Execution</b>
            </h5>
          </div>

          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Type</b>
            </h5>
          </div>

          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Flow Type</b>
            </h5>
          </div>

          <div className="xl:bt-5 col-span-3 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Log DateTime</b>
            </h5>
          </div>

          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Actions</b>
            </h5>
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

        {currentLog.length === 0 && (
          <div className="grid grid-cols-8 divide-x divide-slate-300 rounded-b-lg border-b border-slate-300 dark:border-strokedark dark:bg-boxdark">
            <div className="col-span-8 flex items-center justify-center p-5">
              <p className="text-black dark:text-white">
                No logs found, try searching with different keyword
              </p>
            </div>
          </div>
        )}

        {currentLog.map((log, index) => (
          <div
            onDoubleClick={() => {
              setResultLoading(true);
              getLog(log.triggerID);
            }}
            className={`grid grid-cols-9 divide-x divide-slate-300 hover:bg-orange-50 dark:hover:bg-black	 sm:grid-cols-9 ${
              index === log.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={log.triggerID}
          >
            <div className="col-span-2 flex items-center gap-2 pl-2.5 ">
              <p
                className="text-bla ck
              hidden dark:text-white sm:block"
              >
                {truncateText(log.triggerID, 20)}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-2.5 ">
              <p
                className={`hidden font-semibold text-black dark:text-white sm:block ${
                  log.result === "Success" ? "text-green-500" : "text-rose-500"
                }`}
              >
                {/* {subflow.id} */}
                {truncateText(
                  log.result === "Success" ? "Success" : " Failed",
                  15,
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-2.5 ">
              <p className="hidden text-black dark:text-white sm:block">
                {/* {subflow.id} */}
                {truncateText(log.type, 15)}
              </p>
            </div>

            <div className="flex items-center gap-3 pl-2.5 ">
              <p className="hidden text-black dark:text-white sm:block">
                {/* {subflow.id} */}
                {truncateText(log.flowType, 15)}
              </p>
            </div>

            <div className="col-span-3 flex items-center gap-3 pl-2.5 ">
              <p
                className="hidden text-black dark:text-white sm:block"
                title={log.result}
              >
                {/* {truncateText(log.created_at, 23)} */}
                {formatDate(log.created_at)}
              </p>
            </div>

            <div className="col-span-1 flex items-center gap-4 pl-3 ">
              <p className="hidden text-black dark:text-white sm:block">
                <div className="flex gap-4">
                  <button
                    className="font-sans bg-gray-900 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[25px] w-10 max-w-[25px] select-none rounded-lg text-center align-middle text-xs font-medium uppercase text-white shadow-md transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    onClick={() => {
                      setResultLoading(true);
                      getLog(log.triggerID);
                    }}
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
                </div>
              </p>
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
              Page {currentPage} of {Math.ceil(logData.length / itemsPerPage)}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  prev < Math.ceil(logData.length / itemsPerPage)
                    ? prev + 1
                    : prev,
                )
              }
              disabled={
                currentPage === Math.ceil(logData.length / itemsPerPage)
              }
              className={
                currentPage === Math.ceil(logData.length / itemsPerPage)
                  ? "cursor-not-allowed"
                  : "text-blue-700	"
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {detailPopup && (
        <div
          id="popup"
          className="popup fixed inset-0 z-999 flex w-full items-center justify-center bg-black bg-opacity-50"
          onClick={handleClickOutside}
        >
          <div className="relative h-3/5 w-1/2 rounded-lg bg-white p-4 shadow-lg">
            <button
              className="absolute right-2 top-2 text-black"
              onClick={closePopup}
            >
              Close
            </button>
            {logDetails ? (
              <div>
                <h2 className="mb-4 text-xl font-bold">🧾 Log Details</h2>
                <p className="mb-4">
                  {logDetails.length > 0 && (
                    <strong>Flow ID : {logDetails[0].logID}</strong>
                  )}
                </p>
                <p className="mb-4">
                  {logDetails.length > 0 && (
                    <strong>
                      Triggered Date Time :
                      {formatDate(logDetails[0].created_at)}{" "}
                    </strong>
                  )}
                </p>
                <div className="space-y-2">
                  {logDetails.length === 0 && (
                    <p>No Step logs found for this trigger ID</p>
                  )}
                  {logDetails.map((item, index) => {
                    let result = {};
                    try {
                      result = JSON.parse(item.result);
                    } catch (e) {
                      console.error("Failed to parse result", e);
                    }
                    return (
                      <div key={item.id} className="rounded-lg border">
                        <div
                          className="text-gray-900 bg-gray-100 flex cursor-pointer justify-between rounded-lg px-4 py-2 text-left text-sm font-medium"
                          onClick={() => toggleCollapse(index)}
                        >
                          <span className="font-semibold">
                            Step {item.step}
                          </span>
                          <span
                            className="transform transition-transform duration-300"
                            onClick={() => toggleCollapse(index)}
                          >
                            {collapsedIndex === index ? "-" : "+"}
                          </span>
                        </div>
                        {collapsedIndex === index && (
                          <div className="text-gray-500 px-4 pb-2 pt-1 text-sm">
                            <p>
                              <strong>API:</strong> {item.api}
                            </p>
                            <p className="">
                              <strong>Result:</strong> {result.message}
                              <p className="inline">
                                {result.preview && (
                                  <button className="ml-5 inline rounded-lg bg-blue-500 px-2 py-1 text-white">
                                    <a href={result.preview} target="_blank">
                                      {" "}
                                      Image Preview{" "}
                                    </a>
                                  </button>
                                )}
                              </p>
                              {item.result.preview && (
                                <img src={item.result.preview} />
                              )}
                            </p>
                            <p>
                              <strong>Created At:</strong>{" "}
                              {new Date(item.created_at).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoggingTable;
