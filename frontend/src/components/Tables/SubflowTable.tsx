"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { Transition } from "@headlessui/react";
import { XIcon } from "@heroicons/react/solid";
import { Fragment } from "react";
import crypto from "crypto";
import { usePathname } from "next/navigation";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { sanitizeArrExtFile } from "@files-ui/react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  ReactFlowProvider,
  Controls,
  ControlButton,
  Background,
  useReactFlow,
  useOnSelectionChange,
  BackgroundVariant,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import { act } from "react-dom/test-utils";

const proOptions = { hideAttribution: true };

const SubflowTable = () => {
  const router = useRouter();
  const [subflows, setSubflows] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [allFlow, setAllFlow] = useState([]);
  const [deleted, setDeleted] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [playing, setPlaying] = useState(false);
  const [showNotification, setShowNotification] = useState({
    show: false,
    code: 200,
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [trLoading, setTrLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [subflowToDelete, setSubflowToDelete] = useState(null);
  const [configPopup, setConfigPopup] = useState(null);
  const [configRef, setConfigRef] = useState(null);
  const [scheduleValue, setScheduleValue] = useState("");
  const handleDeleteClick = (subflow) => {
    setSubflowToDelete(subflow);
    setShowConfirm(true);
  };
  const [viewPopup, setViewPopup] = useState(null);

  const handleTriggerType = async (e, flowID) => {
    let changeValue =
      e.target && e.target.value !== undefined ? e.target.value : "";
    const res = fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/scheduleType/set/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flow_id: flowID,
          scheduleType: changeValue,
        }),
      },
    );

    setSubflows((prevSubflows) => {
      const updatedSubflows = prevSubflows.map((subflow) => {
        if (subflow.id === flowID) {
          return {
            ...subflow,
            schueleType: changeValue,
          };
        }
        return subflow;
      });
      return updatedSubflows;
    });
  };

  // const handleActiveToggle = async (flowID) => {
  //   console.log("Toggled active status for flow with ID:", flowID);
  //   const res = fetch(
  //     process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/active/" + flowID,
  //     {
  //       method: "GET",
  //     },
  //   );
  //   setSubflows((prevSubflows) => {
  //     const updatedSubflows = prevSubflows.map((subflow) => {
  //       if (subflow.id === flowID) {
  //         return {
  //           ...subflow,
  //           active: !subflow.active,
  //         };
  //       }
  //       return subflow;
  //     });
  //     return updatedSubflows;
  //   });
  // };

  const configSchedule = async (e, flowID) => {
    setConfigPopup(null);
    let changeValue =
      e.target && e.target.value !== undefined ? e.target.value : "";
    const res = fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/scheduler/set/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flow_id: flowID,
          schedule: changeValue,
        }),
      },
    );
    setSubflows((prevSubflows) => {
      const updatedSubflows = prevSubflows.map((subflow) => {
        if (subflow.id === flowID) {
          return {
            ...subflow,
            schedule: changeValue,
          };
        }
        return subflow;
      });
      return updatedSubflows;
    });
  };

  const truncateText = (text, maxLength) => {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

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

  const doubleClickItemSubflow = async (flow_id) => {
    console.log("Double clicked on subflow with id:", flow_id);
    await router.push({
      pathname: "/subflowedit",
      query: { flowid: flow_id },
    });
  };

  const triggerID = crypto.randomBytes(8).toString("hex");
  let type = "Playground";
  let result = "Success";

  const getFlow = async (flow_id) => {
    let logData = {
      trigger_id: triggerID,
      flow_id: flow_id,
      type: type,
      result: result,
    };

    try {
      let post_data = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/flowid/" + flow_id,
        {
          method: "GET",
        },
      );

      post_data = await post_data.json();

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/flow/v2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: post_data.data.flowjson,
        },
      );

      const logRes = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/write/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(logData),
        },
      );

      console.log("TGhis is post_data", post_data);
      console.log(res.status);
      if (res.status === 450) {
        console.log("IN");
        setShowNotification({
          show: true,
          code: 450,
          message: "Failed analyzing the flow",
        });
        setTimeout(() => {
          setShowNotification({
            show: false,
            code: 450,
            message: "Failed analyzing the flow",
          });
        }, 3000);

        fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/failed/" + triggerID,
          {
            method: "GET",
          },
        );
      } else {
        const data = await res.json();

        console.log("from api", data);
        let tmp_id;
        for (let i = 0, l = data.steps.length; i < l; i++) {
          setPlaying(true);

          if (
            data.steps[i]["method"] === "POST" &&
            data.steps[i].api.includes("upload")
          ) {
            const formData = new FormData();
            formData.append("csv_file", data.steps[i].post_data.csv_file);
            await fetch(data.steps[i].api, {
              method: data.steps[i].method,
              body: formData,
            });
          }
          // if (data.steps[i]["method"] === "POST") {
          let curRes = await fetch(data.steps[i].api, {
            method: data.steps[i].method,
            headers: {
              "Content-Type": "application/json",
            },
            body:
              data.steps[i].method === "POST"
                ? JSON.stringify(data.steps[i].post_data)
                : null,
          });

          let resData = await curRes.json();

          let stepLog = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/step/",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                log_id: triggerID,
                api: data.steps[i].api,
                step: i + 1,
                result: JSON.stringify(resData),
              }),
            },
          );

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
    const fetchData = async () => {
      setTrLoading(true);
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/all/",
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
    fetchData().then(() => setTrLoading(false));
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

        setShowNotification({
          show: true,
          code: 200,
          message: "Flow deleted successfully!",
        });
        setTimeout(() => {
          setShowNotification({
            show: false,
            code: 200,
            message: "Flow deleted successfully!",
          });
        }, 3000);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const confirmDelete = async () => {
    setDeleted(true);
    if (subflowToDelete) {
      setShowConfirm(false);
      setDeleted(true);
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL +
            "/subflow/delete/" +
            subflowToDelete.id,
          {
            method: "GET",
          },
        );
        const data = await res.json();
        if (data && data.data) {
          setSubflows((prevSubflows) =>
            prevSubflows.filter((subflow) => subflow.id !== subflowToDelete.id),
          );
          setAllFlow((prevAllFlow) =>
            prevAllFlow.filter((subflow) => subflow.id !== subflowToDelete.id),
          );

          setShowNotification({
            show: true,
            code: 200,
            message: "Flow deleted successfully!",
          });
          setTimeout(() => {
            setShowNotification({
              show: false,
              code: 200,
              message: "Flow deleted successfully!",
            });
          }, 3000);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
  };

  let currentMenu = null;

  const tableRowContextMenu = (e, subflow) => {
    e.preventDefault();
    console.log("Right clicked on subflow with id:", subflow.id);

    // Remove the previous menu if it exists
    if (currentMenu) {
      currentMenu.remove();
      currentMenu = null;
    }

    const menu = [
      {
        label: "✏️ Edit",
        onClick: () => {
          router.push("/subflowedit?flowid=" + subflow.id);
          menuContainer.remove();
          currentMenu = null;
        },
      },
      {
        label: "🗑️ Delete",
        onClick: () => {
          handleDeleteClick(subflow);
          menuContainer.remove();
          currentMenu = null;
        },
      },
      {
        label: "▶️ Play ",
        onClick: () => {
          getFlow(subflow.id);
          menuContainer.remove();
          currentMenu = null;
        },
      },
    ];

    const menuContainer = document.createElement("div");
    menuContainer.className =
      "absolute z-50 bg-white dark:bg-boxdark dark:text-white";
    menuContainer.style.top = e.clientY + "px";
    menuContainer.style.left = e.clientX + "px";
    menuContainer.style.border = "1px solid #ccc";
    menuContainer.style.borderRadius = "5px";
    menuContainer.style.padding = "5px";
    menuContainer.style.boxShadow = "0 2px 5px rgba(0,0,0,0.1)";
    menuContainer.style.zIndex = "9999";

    menu.forEach((item) => {
      const menuItem = document.createElement("div");
      menuItem.className = "p-2 hover:bg-gray-100 cursor-pointer";
      menuItem.innerHTML = item.label;
      menuItem.onclick = item.onClick;
      menuContainer.appendChild(menuItem);
    });

    document.body.appendChild(menuContainer);
    currentMenu = menuContainer;

    const handleClickOutside = (event) => {
      if (!menuContainer.contains(event.target)) {
        menuContainer.remove();
        currentMenu = null;
        document.removeEventListener("click", handleClickOutside);
      }
    };

    document.addEventListener("click", handleClickOutside);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSubflows = subflows.slice(startIndex, endIndex);
  const handleFileChange = (event) => {
    setDeleted(true);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target.result;

        console.log("this is content", content);
        const data = JSON.parse(content);
        console.log("this is parsed data", data);
        let res = fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/write/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              name: "Imported Flow ",
              description: "This is imported flow on " + String(new Date()),
              flowjson: String(JSON.stringify(data)),
            }),
          },
        );
      };

      reader.readAsText(file);
    }
  };

  const handleButtonClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleActiveToggle = async (flowID) => {
    try {
      setSubflows((prevSubflows) => {
        const updatedSubflows = prevSubflows.map((subflow) => {
          if (subflow.id === flowID) {
            return {
              ...subflow,
              active: !subflow.active,
            };
          }
          return subflow;
        });
        return updatedSubflows;
      });

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/active/" + flowID,
        {
          method: "GET",
        },
      );

      if (res.status === 200) {
        const data = await res.json();
        console.log("Response from active toggle:", data);
        setShowNotification({
          show: true,
          code: 200,
          message: data.message,
        });
        setTimeout(() => {
          setShowNotification({
            show: false,
            code: 200,
            message: data.message,
          });
        }, 3000);
      } else {
        setSubflows((prevSubflows) => {
          const updatedSubflows = prevSubflows.map((subflow) => {
            if (subflow.id === flowID) {
              return {
                ...subflow,
                active: !subflow.active,
              };
            }
            return subflow;
          });
          return updatedSubflows;
        });
        setShowNotification({
          show: true,
          code: 500,
          message: "Failed to toggle active status",
        });
        setTimeout(() => {
          setShowNotification({
            show: false,
            code: 500,
            message: "Failed to toggle active status",
          });
        }, 3000);
      }
    } catch (error) {
      setSubflows((prevSubflows) => {
        const updatedSubflows = prevSubflows.map((subflow) => {
          if (subflow.id === flowID) {
            return {
              ...subflow,
              active: !subflow.active,
            };
          }
          return subflow;
        });
        return updatedSubflows;
      });
    }
  };

  return (
    // border border-stroke shadow-default
    <div className="rounded-sm  bg-white px-5 pb-2.5 pt-6  dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
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
      <div className="flex justify-between gap-x-4">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Flow List
        </h4>
        <button
          className="group relative flex items-center gap-2.5 rounded-lg px-4 py-4 text-sm font-medium font-semibold text-black duration-300 ease-in-out dark:text-white dark:hover:bg-meta-4"
          onClick={handleButtonClick}
        >
          📥 Import a Flow
        </button>
        <input
          type="file"
          id="fileInput"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </div>

      <input
        type="text"
        placeholder=" 🔍 Search flow by name or description"
        className="mb-6 h-10 w-full rounded-md border border-stroke px-3 dark:border-strokedark dark:bg-boxdark"
        onChange={(e) => {
          const searchValue = e.target.value.toLowerCase();
          const filteredSubflows = allFlow.filter((subflow) => {
            return (
              subflow.name.toLowerCase().includes(searchValue) ||
              subflow.description.toLowerCase().includes(searchValue)
            );
          });
          setSubflows(filteredSubflows);
        }}
      />
      {trLoading && (
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

      <div className="flex flex-col rounded-t-lg border	border-slate-300 text-black">
        <div className="grid grid-cols-8 divide-x divide-slate-300 rounded-t-lg border-b border-slate-300 bg-indigo-50 uppercase dark:bg-[#1E1E2F] dark:text-white sm:grid-cols-8">
          <div className="xl:bt-5 pb-2 pl-2.5 pt-3  xl:pb-2.5 xl:pl-2.5 ">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b> Name</b>
            </h5>
          </div>

          <div className="xl:bt-5 col-span-2 hidden pb-2 pl-2.5 pt-3  sm:block xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b> Description</b>
            </h5>
          </div>

          <div className="xl:bt-5 hidden pb-2 pl-2.5 pt-3 sm:block  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b> Update</b>
            </h5>
          </div>

          <div className="xl:bt-5 hidden pb-2 pl-2.5 pt-3 sm:block  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b> Active </b>
            </h5>
          </div>

          <div className="xl:bt-5 hidden pb-2 pl-2.5 pt-3 sm:block  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>scheduler </b>
            </h5>
          </div>

          <div className="xl:bt-5 col-span-2 hidden pb-2 pl-2.5 pt-3 sm:block  xl:pb-2.5 xl:pl-2.5">
            <h5 className=" text-sm font-medium xsm:text-sm">
              <b>Actions (V/E/P/D)</b>
            </h5>
          </div>
        </div>

        {currentSubflows.length === 0 && (
          <div className="grid grid-cols-8 divide-x divide-slate-300  border-b border-slate-300 dark:border-strokedark dark:bg-boxdark">
            <div className="col-span-8 flex items-center justify-center p-5">
              <p className="text-black dark:text-white">
                No flows found. Please create a new flow.
              </p>
            </div>
          </div>
        )}
        {currentSubflows.map((subflow, index) => (
          <div
            title={decodeURI(
              "Double Click - Edit Flow%0ARight Click - For more options",
            )}
            onContextMenu={(e) => {
              tableRowContextMenu(e, subflow);
            }}
            className={`grid  cursor-alias grid-cols-8  divide-x divide-slate-300 hover:bg-orange-50	 dark:hover:bg-black sm:grid-cols-8 ${
              index === subflows.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={subflow.id}
          >
            <div
              className="flex items-center gap-3 pl-2.5 "
              onDoubleClick={() => {
                setTrLoading(true);
                router.push("/subflowedit?flowid=" + subflow.id);
              }}
            >
              <p
                className="
              text-black dark:text-white sm:block"
              >
                {truncateText(subflow.name, 20)}
              </p>
            </div>

            <div
              className="col-span-2 flex hidden content-center items-center gap-3 pl-2.5 sm:block"
              onDoubleClick={() => {
                setTrLoading(true);
                router.push("/subflowedit?flowid=" + subflow.id);
              }}
            >
              <p className="hidden items-center  text-black  dark:text-white sm:block">
                {/* {subflow.id} */}
                {/* {subflow.schedule}
                {subflow.schueleType}
                {subflow.id} */}
                {subflow.description
                  ? truncateText(subflow.description, 55)
                  : "No Description"}
                {/* {truncateText(subflow.description, 55)} */}
              </p>
            </div>

            <div
              className="flex hidden items-center gap-3 pl-2.5 sm:block"
              onDoubleClick={() => {
                setTrLoading(true);
                router.push("/subflowedit?flowid=" + subflow.id);
              }}
            >
              <p
                className="hidden text-black dark:text-white sm:block"
                title={decodeURI(
                  "Double Click - Edit Flow%0ARight Click - For more options",
                )}
              >
                {formatDate(subflow.updated_at)}
              </p>
            </div>

            <div className="  mr-1  hidden items-center gap-1 pl-1.5 pt-2 sm:flex">
              <div
                className="flex cursor-pointer items-center"
                onClick={() => handleActiveToggle(subflow.id)}
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={subflow.active}
                    onClick={() => handleActiveToggle(subflow.id)}
                    className="sr-only"
                  />
                  <div
                    className={`block border border-slate-200 ${subflow.active ? "bg-green-500" : "bg-slate-500"} h-6 w-12 rounded-full`}
                  ></div>
                  <div
                    className={`dot  absolute top-1 h-5 w-5 rounded-full transition ${subflow.active ? "translate-x-6" : "translate-x-0"}`}
                  ></div>
                </div>
              </div>
              <span className="text-gray-700 hidden text-xs dark:text-white md:block">
                {subflow.active ? "Actived" : "Disabled"}
              </span>
            </div>

            <div className="flex hidden  items-center gap-3 sm:flex ">
              <button
                id={"config_" + subflow.id}
                key={"config_" + subflow.id}
                title={
                  subflow.active
                    ? "Configure Flow"
                    : "Please activate flow to configure"
                }
                className={`m-auto  mb-1 mt-1 rounded	border	border-slate-300 pl-2 pr-2 text-sm text-white   ${subflow.active ? "bg-zinc-500 " : "text-gray-500 cursor-not-allowed border-slate-200 bg-zinc-300"}`}
                onClick={() => setConfigPopup(subflow.id)}
                disabled={subflow.active ? false : true}
              >
                Config
              </button>

              {configPopup === subflow.id && (
                <div
                  key={"trigger_type_" + subflow.id}
                  id={"trigger_type_" + subflow.id}
                  className="bg-gray-900 fixed inset-0 z-50 flex items-center justify-center bg-opacity-50"
                >
                  <div className="divide-y divide-slate-300 rounded-lg bg-white p-4 shadow-lg">
                    <h2 className=" w-100 pb-4 pt-2 text-lg font-semibold">
                      🗓️ Trigger Configuration
                    </h2>
                    {subflow.id}
                    <div className="mt-2 pt-2">
                      <label
                        htmlFor="trigger"
                        className="text-gray-700 block text-sm font-medium"
                      >
                        Trigger Type
                      </label>
                      <select
                        id="trigger"
                        name="trigger"
                        className="mt-2 w-full rounded-md border border-slate-400 py-2 pl-3 pr-10 text-base outline-1 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                        onChange={(e) => handleTriggerType(e, subflow.id)}
                        defaultValue={subflow.schueleType}
                      >
                        <option value="Manual">On Demand</option>
                        <option value="Auto">On Schedule (Crontab) </option>
                      </select>
                      {subflow.schueleType === "Auto" && (
                        <div>
                          <label
                            className={`text-gray-700 } mt-2 block text-sm font-medium`}
                            htmlFor="scheduleConfig"
                          >
                            {" "}
                            Schedule Configuration
                            <span id="help link" className="pl-2 text-blue-500">
                              <a href="https://crontab.guru/" target="_blank">
                                (?)
                              </a>
                            </span>
                          </label>

                          <input
                            id="scheduleConfig"
                            className={`mt-2 w-full rounded-md border border-slate-400 py-2 pl-3 pr-10 text-base outline-1 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm `}
                            placeholder="Schedule Config e.g. 0 0 * * *"
                            defaultValue={subflow.schedule}
                            onChange={(e) => setScheduleValue(e)}
                          ></input>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 flex justify-end pt-4">
                      <button
                        className="mr-2 rounded-lg bg-slate-100 px-4 py-1"
                        onClick={() => setConfigPopup(null)}
                      >
                        Cancel
                      </button>
                      <button
                        className="rounded-lg bg-green-500 px-4 py-1 text-white"
                        onClick={() =>
                          configSchedule(scheduleValue, subflow.id)
                        }
                      >
                        Config
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className=" hidden items-center gap-1 pl-2.5 sm:flex">
              <p className="hidden text-black dark:text-white sm:block">
                <div className="flex gap-1">
                  <button
                    className="font-sans bg-gray-900 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg text-center align-middle text-xs font-medium uppercase text-white  transition-all hover:shadow-lg focus:opacity-[0.85] focus:shadow-none active:opacity-[0.85] active:shadow-none disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    title="View Subflow"
                    onClick={() => setViewPopup(subflow)}
                  >
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 1024 1024"
                        xmlns="http://www.w3.org/2000/svg"
                        className="dark:fill-current"
                      >
                        <path d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352zm0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288zm0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448zm0 64a160.192 160.192 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160z" />
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
                      title="Edit Subflow"
                      className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr text-center align-middle text-xs font-medium uppercase text-white transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                      type="button"
                    >
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          className="dark:fill-current"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.56078 20.2501L20.5608 8.25011L15.7501 3.43945L3.75012 15.4395V20.2501H8.56078ZM15.7501 5.56077L18.4395 8.25011L16.5001 10.1895L13.8108 7.50013L15.7501 5.56077ZM12.7501 8.56079L15.4395 11.2501L7.93946 18.7501H5.25012L5.25012 16.0608L12.7501 8.56079Z"
                          />
                        </svg>
                      </span>
                    </button>
                  </Link>

                  <button
                    id={subflow.id + "_play"}
                    title="Play Subflow"
                    className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr text-center align-middle text-xs font-medium uppercase text-white  transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    onClick={() => getFlow(subflow.id)}
                  >
                    {playing ? (
                      <img
                        src={"/images/general/loading.gif"}
                        alt="Loading"
                        className="mx-auto h-6 w-6 animate-spin"
                      />
                    ) : (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 16 16"
                          xmlns="http://www.w3.org/2000/svg"
                          className="dark:fill-current"
                        >
                          <path d="M2.78 2L2 2.41v12l.78.42 9-6V8l-9-6zM3 13.48V3.35l7.6 5.07L3 13.48z" />
                          <path d="M6 14.683l8.78-5.853V8L6 2.147V3.35l7.6 5.07L6 13.48v1.203z" />
                        </svg>
                      </span>
                    )}
                  </button>
                  <button
                    className="font-sans from-gray-900 to-gray-800 shadow-gray-900/10 hover:shadow-gray-900/20 relative mr-2 h-10 max-h-[40px] w-10 max-w-[40px] select-none rounded-lg bg-gradient-to-tr pl-6 text-center align-middle text-xs font-medium uppercase text-white  transition-all hover:shadow-lg active:opacity-[0.85] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none"
                    type="button"
                    title="Delete Subflow"
                    onClick={() => handleDeleteClick(subflow)}
                  >
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        className="dark:fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.0038 17.9792L18.7155 8.56456C18.8322 7.9227 18.8906 7.60178 18.7282 7.51633C18.5659 7.43088 18.3344 7.66067 17.8714 8.12025L16.985 9L12 10L6.99621 9L6.13263 8.13478C5.66847 7.66974 5.43639 7.43722 5.27345 7.5225C5.1105 7.60778 5.16927 7.931 5.28681 8.57744L6.99621 17.9792C6.99868 17.9927 7.00522 18.0052 7.01497 18.015C9.76813 20.7681 14.2319 20.7681 16.985 18.015C16.9948 18.0052 17.0013 17.9927 17.0038 17.9792Z"
                          className="fill-current"
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
              </p>
            </div>

            {trLoading && (
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

            {showConfirm && (
              <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-10">
                <div className="w-2/4 divide-y divide-slate-300 rounded-lg bg-white p-4 shadow-lg">
                  <h2 className=" pb-4 pt-2 text-lg font-semibold">
                    ⚠️ Deleting a flow
                  </h2>
                  {/* <hr /> */}
                  <div className="pb-2 pt-2">
                    <p> You have selected to delete a flow.</p>
                    <p>
                      Are you sure you want to delete the flow "
                      {subflowToDelete.name}" with ID {subflowToDelete.id}?
                    </p>
                    <p>
                      {" "}
                      Work flow Description -{" "}
                      {subflowToDelete.description.length < 1
                        ? "No description"
                        : subflowToDelete.description}
                    </p>
                  </div>
                  {/* <hr /> */}

                  <div className="mt-4 flex justify-end pt-4">
                    <button
                      className="mr-2 rounded-lg bg-slate-100 px-4 py-1"
                      onClick={() => setShowConfirm(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="rounded-lg bg-rose-500 px-4 py-1 text-white"
                      onClick={confirmDelete}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {viewPopup && (
          <div className="fixed inset-0 flex items-center justify-center bg-slate-900 bg-opacity-50">
            <div className="grid w-3/4 grid-cols-3 divide-y divide-slate-300 rounded-lg bg-white p-4  shadow-lg lg:ml-60">
              <div className="h-96">
                <h2 className=" pb-4 pt-2 text-lg font-semibold">
                  📄 Subflow Details
                </h2>
                <div className="col-span-1 h-96 pb-2 pt-2">
                  <p>
                    <b>Flow ID:</b> {viewPopup.id}
                  </p>
                  <p>
                    <b>Flow Name:</b> {viewPopup.name}
                  </p>
                  <p>
                    <b>Flow Description:</b>{" "}
                    {viewPopup.description.length < 1
                      ? "No description"
                      : viewPopup.description}
                  </p>

                  <p>
                    <b>Active Status:</b>{" "}
                    {viewPopup.active ? "Active 🟢" : "Inactive 🚫"}
                  </p>

                  {viewPopup.active && (
                    <p>
                      <b>Scheduler:</b> {viewPopup.schedule}
                    </p>
                  )}

                  <p>
                    <b>Created At:</b> {formatDate(viewPopup.created_at)}
                  </p>
                  <p>
                    <b>Updated At:</b> {formatDate(viewPopup.updated_at)}
                  </p>
                  {selectedNode && (
                    <div className="mt-4">
                      <p>
                        <b>Selected Node ID:</b>
                      </p>
                      <p>{selectedNode.id}</p>
                      {/* <p>{JSON.stringify(selectedNode.data.inputs)}</p> */}
                      {/* <p>{JSON.stringify(selectedNode.data.length)}</p> */}
                      {selectedNode.data.inputs && (
                        <div>
                          <p className="break-words">
                            <b>Node Input Data:</b>
                          </p>
                          {selectedNode.data.inputs.map((data, index) => (
                            <p key={index} className="break-words">
                              <b>{data.label}:</b> {data.value}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex justify-start pt-4">
                  <button
                    className="rounded-lg bg-slate-500 px-4 py-1 text-white"
                    onClick={() => {
                      setViewPopup(null);
                      setTrLoading(true);
                      router.push("/subflowedit?flowid=" + viewPopup.id);
                    }}
                  >
                    Edit Flow
                  </button>
                </div>
              </div>

              <div className="col-span-2">
                <h3 className="text-center text-lg font-semibold">
                  Flow Diagram
                </h3>

                <div className="z-20 mt-1 h-96 w-full border border-stroke">
                  <ReactFlow
                    nodes={JSON.parse(viewPopup.flowjson).nodes}
                    edges={JSON.parse(viewPopup.flowjson).edges}
                    proOptions={proOptions}
                    onInit={() => setSelectedNode(null)}
                    onNodesChange={(changedNodes) => {
                      const changedNodeId = changedNodes[0]?.id;
                      const matchedNode = JSON.parse(
                        viewPopup.flowjson,
                      ).nodes.find((node) => node.id === changedNodeId);
                      if (matchedNode) {
                        setSelectedNode(matchedNode);
                      }
                    }}
                  >
                    {" "}
                    <Background id="2" color="#333" />
                    <Controls showInteractive={false} />
                  </ReactFlow>
                </div>
                <div className="mt-4 flex justify-end pt-4">
                  <button
                    className="rounded-lg bg-rose-400 px-4 py-1 text-white"
                    onClick={() => setViewPopup(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
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

export default SubflowTable;
