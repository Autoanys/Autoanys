"use client";
import React, { useState, useRef, useCallback, useEffect, use } from "react";
import "reactflow/dist/style.css";
import "./styles.css";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/outline";
import Link from "next/link";
import path from "path";
import {
  useSignal,
  useComputed,
  useSignalEffect,
  signal,
} from "@preact/signals";
import Editor, { DiffEditor, useMonaco, loader } from "@monaco-editor/react";
import comConfig from "./comConfig";
import { useRouter, useParams, useSearchParams } from "next/navigation";

const componentKey = signal("new-component");

const ComponentsEditor = (editing, componentID) => {
  const [codingValue, setCodingValue] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [componentDescription, setComponentDescription] = useState("");
  const popupRef = useRef(null);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const [codeValidate, setCodeValidate] = useState("");
  const [componentInfo, setcCmponentInfo] = useState({
    component_name: "test",
    component_category: "test",
    component_description: "test",
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      setExportDropdownOpen(false);
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  const parms = useSearchParams();
  const router = useRouter();

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(event.target.component_name.value);
    componentKey.value = event.target.component_description.value;
    setComponentDescription(event.target.component_description.value);
    setIsPopupOpen(false);
  };

  const validateCoding = async () => {
    try {
      let res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/components/validate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            component_coding: codingValue,
          }),
        },
      );

      let data = await res.json();
      if (data.message.includes("invalid")) {
        await setCodeValidate("failed");
        console.log("Failed");
      } else {
        await setCodeValidate("success");
        console.log("Sesc");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const onDragStart = (event, key) => {
    console.log("dragging", key);
    event.dataTransfer.setData("text", comConfig[key].value);
  };

  const onDropOver = (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text");
    console.log("data", data);
    const el = document.getElementById(data);
    const text = el.innerText;
    const start = event.target.selectionStart;
    const end = event.target.selectionEnd;
    const before = codingValue.substring(0, start);
    const after = codingValue.substring(end);
    setCodingValue(before + text + after);
  };

  useEffect(() => {
    console.log("Editing", editing);

    if (editing && componentID) {
      const fetchData = async () => {
        try {
          const res = await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL +
              "/components/componentID/" +
              parms.get("componentid"),
          );

          const data = await res.json();
          setCodingValue(data.coding);
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      };

      fetchData();
    }
  }, []);

  const codingUpdate = (newValue, e) => {
    console.log(newValue);
    setCodingValue(newValue);
    // console.log(codingValue.value);
  };

  const saveComponent = async () => {
    try {
      const saveRes = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/components/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            component_name: componentKey ? componentKey : "new-component",
            component_category: componentInfo.component_category,
            component_description: componentDescription
              ? componentDescription
              : "",
            component_coding: codingValue,
          }),
        },
      );

      let data = await saveRes.json();
      if (saveRes.status === 450) {
        alert("The code cannot be validate");
      }
      if (saveRes.status === 200 && data) {
        // alert("Component saved successfully");
        // alert(JSON.stringify(response.body));
        console.log("Data", data);
        console.log("data.id", data.id);
        const idMatch = data.message.match(/id='([^']+)'/);
        await router.push("/componentedit?componentid=" + idMatch[1], {
          scroll: false,
        });
      } else {
        alert(JSON.stringify(response.body));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="absolute inset-0">
      <div className="grid h-full grid-cols-5 gap-3">
        <div className="border-r-2 border-slate-200 pt-20">
          <aside>
            <div className="description p-2 pb-4">
              <div className="m-2 mx-auto	 max-w-md rounded-lg border-2 border-slate-200">
                <div className="relative flex h-7 w-full items-center overflow-hidden rounded-lg bg-white focus-within:shadow-lg">
                  <div className="text-gray-300 grid h-full w-12 place-items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>

                  <input
                    className="text-gray-700 peer h-full w-full pr-2 text-sm outline-none"
                    type="text"
                    id="search"
                    placeholder="Search features"
                  />
                </div>
              </div>
              <span className="">
                Check{" "}
                <a
                  className="font-bold text-sky-700"
                  target="_blank"
                  href="/plugins"
                >
                  here
                </a>{" "}
                make sure you have enabled for more plugins.
              </span>

              <div className="ml-1 mr-1">
                <div className="ml-1 mr-1">
                  {Object.keys(comConfig).map((key) => (
                    <div
                      key={key}
                      className="start mt-2 border border-slate-400"
                      onDragStart={(event) => onDragStart(event, key)}
                      draggable
                    >
                      <div className="content flex py-2">
                        <img
                          className="ml-2 h-5 w-5"
                          src={comConfig[key].icon}
                          alt={`${comConfig[key].label} icon`}
                        />
                        <p className="pl-2 text-sm">{comConfig[key].label}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>

        <div className="col-span-4">
          <div className="mt-24 h-10 bg-black">
            <div className="items-right flex w-full justify-end gap-1 border-b border-slate-300 bg-white p-0 ">
              <div className="mr-auto">
                <button
                  onClick={() => router.push("/components")}
                  className={`mb-2 ml-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white 
                  `}
                >
                  ↩️ Back
                </button>
                <button
                  onClick={() => saveComponent()}
                  className={`mb-2 ml-1 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white `}
                >
                  💾 Save
                </button>

                <button
                  onClick={togglePopup}
                  className={`mb-2 ml-1 rounded border border-blue-500 bg-transparent px-3 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white 
                  `}
                >
                  ⚙️
                </button>
              </div>

              {/* <button className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white">
                ⏹️ Auto-Layout
              </button> */}

              {/* <button className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white">
                🔣 Variables
              </button> */}
              {codeValidate === "success" ? (
                <div className="flex items-center">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  <p className="text-green-500">Code validated successfully</p>
                </div>
              ) : codeValidate === "failed" ? (
                <div className="flex items-center">
                  <XCircleIcon className="h-5 w-5 text-rose-700" />
                  <p className="text-rose-700">Code validation failed</p>
                </div>
              ) : (
                <div className="flex items-center">
                  <p className="text-rose-700">Code not yet validate</p>
                </div>
              )}

              <button className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white">
                🐞 Debug
              </button>

              <button
                onClick={() => validateCoding()}
                className={`mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white 
                `}
              >
                📝 Validate
              </button>
              <button className="mb-2 mr-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white">
                📁 Export
              </button>
            </div>
          </div>

          <div className="mr-2 mt-5 h-4/5 border border-slate-300 pt-5">
            <p className="inline pl-6   ">Custom Component / </p>
            <p className="inline   font-semibold">
              {parms?.get("componentid")
                ? parms.get("componentid")
                : "New Component"}
            </p>
            <Editor
              defaultValue={codingValue}
              value={codingValue}
              className="mb-10 pt-6"
              defaultLanguage="python"
              theme="light"
              onChange={codingUpdate}
              onDropOver={onDropOver}
            />
          </div>
        </div>
        {isPopupOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div
              ref={popupRef}
              className="w-2/5 rounded bg-white p-6 shadow-lg"
            >
              <h2 className="mb-4 text-xl font-semibold">Component Setting</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  {parms.get("componentid") && (
                    <label
                      className="text-gray-700 mb-2 block text-sm font-bold"
                      htmlFor="website-url"
                    >
                      Component ID : {parms}
                    </label>
                  )}
                </div>
                <div className="mb-4">
                  <label
                    className="text-gray-700 mb-2 block text-sm font-bold"
                    htmlFor="website-parm"
                  >
                    Component Name :
                  </label>
                  <input
                    className="text-gray-900 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                    id="component_name"
                    type="text"
                    placeholder="Component name"
                    defaultValue={componentKey}
                  />
                </div>

                <div className="mb-4">
                  <label
                    className="text-gray-700 mb-2 block text-sm font-bold"
                    htmlFor="flow_description"
                  >
                    Component Description :
                  </label>
                  <textarea
                    className="text-gray-900 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                    id="component_description"
                    placeholder="Component Description"
                    defaultValue={componentDescription}
                    rows="5"
                  ></textarea>
                </div>

                <div className="flex items-center justify-between">
                  <button
                    className="focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none"
                    type="submit"
                  >
                    Save
                  </button>
                  <button
                    className="hover:bg-red-700 focus:shadow-outline rounded bg-rose-500 px-4 py-2 font-bold text-white focus:outline-none"
                    onClick={togglePopup}
                    type="button"
                  >
                    Close
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ComponentsEditorWrapper = () => <ComponentsEditor />;

export default ComponentsEditorWrapper;
