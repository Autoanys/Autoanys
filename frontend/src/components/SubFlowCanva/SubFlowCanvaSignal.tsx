"use client";
import React, { useState, useRef, useCallback, useEffect, use } from "react";
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
  Panel,
} from "reactflow";
import { getRectOfNodes, getTransformForBounds } from "reactflow";
import { Dropzone, FileMosaic } from "@files-ui/react";
import { saveSubFlow } from "@/lib/saveSubFlow";
import "reactflow/dist/style.css";
import "./styles.css"; // Import the CSS file
import { startNode, endNode } from "./InitNodes";
import { usePathname } from "next/navigation";
import { InputNode, DefaultNode, OutputNode, CustomNode } from "./CustomNodes";
import { WaitSecondNode } from "./GeneralNodes";
import GenericNode from "./GenericNode";
import nodeConfigInit from "./nodeConfig";
import CustomEdge from "./CustomEdge";
import {
  CloseBrowser,
  OpenBrowserNode,
  OpenBrowswerLinkNode,
  findElementNode,
} from "./BrowserNodes";
import { start } from "repl";
import { Fragment } from "react";
import { Transition } from "@headlessui/react";
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  TrashIcon,
} from "@heroicons/react/outline";
import { XIcon } from "@heroicons/react/solid";
import { prisma } from "@/lib/prisma";
import { toPng } from "html-to-image";
import variableConfig from "./variableConfig";
import Link from "next/link";
import SidebarLinkGroup from "../Sidebar/SidebarLinkGroup";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import path from "path";
import {
  useSignal,
  useComputed,
  useSignalEffect,
  signal,
} from "@preact/signals";

const proOptions = { hideAttribution: true };
const addOnChangeToNodeConfig = (config, handleChange) => {
  const updatedConfig = { ...config };
  Object.keys(updatedConfig).forEach((key) => {
    updatedConfig[key].onChange = handleChange;
  });
  return updatedConfig;
};

const initialNodes = [
  {
    id: "start-node",
    type: "start",
    position: { x: 400, y: 200 },
    data: {
      label: "Start",
      value: "",
      description: "This is an start node",
      onChange: (id, value) => handleNodeChange(id, value),
    },
  },
  {
    id: "end-node",
    type: "end",
    position: { x: 400, y: 550 },
    data: { label: "End", result: "End for this node" },
  },
];
const edgeTypes = { custom: CustomEdge };
const { setViewport } = useReactFlow();
const pathname = usePathname();

let storedSidebarExpanded = "true";

const flowKeys = signal("gdsarated-flow");
const playing = signal(false);
const nodes = signal(initialNodes);
const selectedNodes = signal([]);
const selectedEdges = signal([]);
const flowbar = signal(false);
const rfInstance = signal(null);
const playingPreviewSideBar = signal(false);
const autoSaving = signal(false);
const flowDescription = signal("");
const inputs = signal([]);
const sidebarExpanded = signal(
  storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
);
const file = signal(null);
const files = signal([]);
const isPopupOpen = signal(false);
const currentIndex = signal(0);

const variables = signal([]);
const currentStep = signal({
  step: 0,
  total: 0,
  result: { type: "text", value: "" },
});
const currentResult = signal([]);
const isPopupVisible = signal(false);
const popupImage = signal(null);
const previewButton = signal(false);
const edges = signal([]);
const showNotification = signal({
  show: false,
  code: 200,
  message: "",
});

const SubFlowCanva = (editing, flowid) => {
  const popupRef = useRef(null);

  useEffect(() => {
    variables.value = variableConfig;
  }, []);

  const togglePopup = () => {
    isPopupOpen.value = !isPopupOpen.value;
  };

  const toggleSection = (category) => {
    collapsedSections.value = {
      ...collapsedSections.value,
      [category]: !collapsedSections.value[category],
    };
  };

  const parms = useSearchParams();

  const updateFiles = (incommingFiles) => {
    files.value = incommingFiles;
  };

  const handleNodeChange = (id, newValue) => {
    nodes.value = nodes.value.map((node) =>
      node.id === id
        ? { ...node, data: { ...node.data, value: newValue } }
        : node,
    );
  };

  const nodeConfig = addOnChangeToNodeConfig(nodeConfigInit, handleNodeChange);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        isPopupOpen.value = false;
      }
    };

    if (isPopupOpen.value) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen]);

  const addOnChangeHandler = (nodes) => {
    return nodes.value.map((node) => {
      const nodeConfigItem = nodeConfig[node.type];
      if (nodeConfigItem) {
        return { ...node, data: { ...node.data, onChange: handleNodeChange } };
      }
      return node;
    });
  };

  const nodeTypesInit = {
    start: startNode,
    end: endNode,
  };

  const nodeTypes = { ...nodeTypesInit };
  Object.keys(nodeConfig).forEach((key) => {
    nodeTypes[key] = CustomNode;
  });

  useEffect(() => {
    if (editing && flowid) {
      if (parms.get("flowid")) {
        const fetchData = async () => {
          try {
            const res = await fetch(
              process.env.NEXT_PUBLIC_BACKEND_URL +
                "/subflow/flowid/" +
                parms.get("flowid"),
            );
            const data = await res.json();
            console.log("0d0d", data);
            const flowData = JSON.parse(data.data.flowjson);
            flowKeys.value = data.data.name;
            flowDescription.value = data.data.description;

            if (data && flowData) {
              const { x = 0, y = 0, zoom = 1 } = flowData.viewport;
              const updatedNodes = addOnChangeHandler(flowData.nodes || []);
              nodes.value = updatedNodes;
              edges.value = flowData.edges || [];
              setViewport({ x, y, zoom });
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };

        fetchData();
      }
    }
  }, []);

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      selectedNodes.value = nodes.value.map((node) => node.id);
      selectedEdges.value = edges.value.map((edge) => edge.id);
    },
  });

  const getNodeDoc = (selectedNodes) => {
    console.log("Doc lei", selectedNodes);
    console.log("Doc lei", selectedNodes);
    console.log(
      "Doc lei",
      nodes.value.find((node) => node.id == selectedNodes.value),
    );
    const node = nodes.value.find((node) => node.id == selectedNodes.value);
    console.log("Doc lei", node);
    if (node) {
      window.open(node.data.doc, "_blank");
    }
  };

  const deleteNode = (selectedNodes) => {
    console.log("selectedNodes", selectedNodes.value);
    console.log("Deleting nodes:", selectedNodes.value);

    nodes.value = nodes.value.filter(
      (node) => !selectedNodes.includes(node.id),
    );

    edges.value = edges.value.filter(
      (edge) =>
        !selectedNodes.value.includes(edge.source) &&
        !selectedNodes.value.includes(edge.target),
    );
  };

  const nextSlide = () => {
    currentIndex.value = (prevIndex) =>
      (prevIndex + 1) % currentResult.value.length;
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? currentResult.length - 1 : prevIndex - 1,
    );
  };

  const setSlide = (index) => {
    setCurrentIndex(index);
  };

  const openPopup = (image) => {
    setPopupImage(image);
    setIsPopupVisible(true);
  };

  const closePopup = () => {
    setIsPopupVisible(false);
    setPopupImage(null);
  };

  useEffect(() => {
    // console.log("selectedNodes", selectedNodes);
    if (selectedNodes.length === 0) {
      // console.log("Keep Repeat");
      setFlowbar(false);
    } else {
      // console.log("Keep Repeat");
      setFlowbar(true);
    }
  }, [selectedNodes]);

  const checkRequiredInputs = useCallback(async () => {
    for (const node of nodes.value) {
      if (node.data.inputs?.length) {
        for (const input of node.data.inputs) {
          console.log("DAS", node.data.inputs);
          if (input.required && !input.value) {
            console.log(`Required input ${input.label} is missing`);
            return false;
          }
        }
      }
    }
    return true;
  }, [nodes]);

  useEffect(() => {
    setPlayingPreviewSideBar(false);
    setCurrentResult([]);
  }, [selectedNodes]);

  // Flow V2
  const getFlow = async () => {
    try {
      let temp = nodes.value;
      let post_data = JSON.stringify({ temp, edges }, null, 2);

      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/flow/v2",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: post_data,
        },
      );
      console.log("TGhis is post_data", post_data);
      console.log(res.status);
      const inputReq = await checkRequiredInputs();
      console.log(inputReq);
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
      }
      if (!inputReq) {
        console.log("IN ma?");
        setShowNotification({
          show: true,
          code: 402,
          message: "Required inputs are missing",
        });
        setTimeout(() => {
          setShowNotification({
            show: false,
            code: 402,
            message: "Required inputs are missing",
          });
        }, 3000);

        return;
      } else {
        const data = await res.json();

        console.log("from api", data);
        let tmp_id;
        for (let i = 0, l = data.steps.length; i < l; i++) {
          playing.value = true;
          setPlayingPreviewSideBar(true);
          setCurrentStep({
            total: data.steps.length,
            step: i + 1,
            result: { type: "text", value: "text" },
          });

          setCurrentIndex(i);
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
          if (resData.preview) {
            console.log("Preview data", resData.preview);
            setCurrentResult((currentResult) => [
              ...currentResult,
              { type: "image", value: resData.preview },
            ]);
          } else {
            setCurrentResult((currentResult) => [
              ...currentResult,
              { type: "text", value: resData.message },
            ]);
          }

          if (i === data.steps.length - 1) {
            playing.value = false;
          }
        }
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(event.target.flow_name.value);
    flowKeys.value = event.target.flow_name.value;
    setFlowDescription(event.target.flow_description.value);
    setIsPopupOpen(false);
  };

  const autoLayoutNodes = (nodes) => {
    const GAP = 50; // Define the gap between each node
    let startNode = nodes.value.find((node) => node.type == "start");

    if (!startNode) {
      console.error("Start node not found");
      return nodes;
    }

    let currentY = startNode.position.y + startNode.height + GAP;
    let updatedNodes = nodes.value.map((node) => {
      if (node.id !== startNode.id) {
        let updatedNode = {
          ...node,
          position: { ...node.position, y: currentY },
        };
        currentY += node.height + GAP;
        return updatedNode;
      }
      return node;
    });

    return updatedNodes;
  };

  const handleAutoLayout = () => {
    const newNodes = autoLayoutNodes(nodes.value);
    nodes.value = newNodes;
  };

  const onNodesChange = useCallback((changes) => {
    nodes.value = applyNodeChanges(changes, nodes.value);
  }, []);

  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );
  const onConnect = useCallback(
    (connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...connection,
            type: "custom",
            data: { label: "Edge", onRemove: handleEdgeRemove },
          },
          eds,
        ),
      ),
    [],
  );
  // const flowKey = "generated-flow";

  const router = useRouter();

  const onSave = useCallback(async () => {
    console.log(rfInstance, "rfInstance");

    if (rfInstance && parms.get("flowid")) {
      const flow = rfInstance.toObject();
      console.log("This is Flow", flow);
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "/subflow/edit/" +
          parms.get("flowid"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: flowKeys,
            description: flowDescription,
            flowjson: String(JSON.stringify(flow)),
          }),
        },
      );
      console.log(" dFLOW", flow);
      console.log("Flow data saved successfully");
      await router.push("/subflow", { scroll: false });
    }
    if (rfInstance && !parms.get("flowid")) {
      const flow = rfInstance.toObject();
      console.log("This is Flow", flow);
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/write/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: flowKeys,
            description: flowDescription,
            flowjson: String(JSON.stringify(flow)),
          }),
        },
      );
      console.log("Flow data saved successfully");
      console.log(res, "res.data");
      const data = await res.json();
      console.log(data, "data");
      await router.push("/subflowedit?flowid=" + data.data, { scroll: false });
      setAutoSaving(false);
    }
  }, [rfInstance, flowKeys, flowDescription]);

  const today = new Date();
  const time = today.getHours() + "_" + today.getMinutes();

  const handleEdgeRemove = useCallback((id) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  const { project } = useReactFlow();

  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  function downloadImage(dataUrl) {
    const a = document.createElement("a");

    if (parms.get("flowid")) {
      a.setAttribute("download", parms.get("flowid") + today + "_" + ".png");
    } else {
      a.setAttribute("download", today + "_" + ".png");
    }
    a.setAttribute("href", dataUrl);
    a.click();
  }

  const imageWidth = 1024;
  const imageHeight = 768;

  const { getNodes } = useReactFlow();
  const exportImage = () => {
    const nodesBounds = getRectOfNodes(getNodes());
    const transform = getTransformForBounds(
      nodesBounds,
      imageWidth,
      imageHeight,
      0.5,
      2,
    );

    toPng(document.querySelector(".react-flow__viewport"), {
      backgroundColor: "#1a365d",
      width: imageWidth,
      height: imageHeight,
      style: {
        width: imageWidth,
        height: imageHeight,
        transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
      },
    }).then(downloadImage);
  };

  const cateConfig = { cate: ["Browser", "General"] };

  const groupByCategory = (nodes) => {
    return nodes.reduce((acc, key) => {
      const category = nodeConfig[key].category || "Uncategorized";
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(key);
      return acc;
    }, {});
  };

  const groupedNodes = groupByCategory(Object.keys(nodeConfig));

  const initialCollapsedState = Object.keys(groupedNodes).reduce(
    (acc, category) => {
      acc[category] = false;
      return acc;
    },
    {},
  );

  const [collapsedSections, setCollapsedSections] = useState(
    initialCollapsedState,
  );

  const nodeDivs = Object.keys(groupedNodes).map((category) => (
    <div key={category}>
      <div
        className={`flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-50 
        ${collapsedSections[category] ? "" : "bg-slate-50"}`}
        onClick={() => toggleSection(category)}
      >
        <span className="text-black">{category}</span>
        <span>{collapsedSections[category] ? "⮞" : "⮟"}</span>
      </div>
      {!collapsedSections[category] && (
        <div className="ml-2 mr-2">
          {groupedNodes[category].map((key) => (
            <div
              key={key}
              className="start mt-2 border border-slate-400 "
              onDragStart={(event) => onDragStart(event, key)}
              draggable
            >
              <div className="content flex py-2 dark:bg-white">
                <img className="ml-2 h-5 w-5" src={nodeConfig[key].icon} />
                <p className="pl-2 text-sm">{nodeConfig[key].label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ));

  const rectOfNodes = getRectOfNodes(nodes.value);

  const editForm = (node_id) => {
    const node = JSON.stringify(nodes.value.find((n) => n.id == node_id));

    return (
      <div>
        <p className=" pt-4 font-medium">
          {" "}
          Node Label : {nodes.value.find((n) => n.id == node_id)?.data.label}
        </p>
        <p className="pb-4  font-medium">
          {" "}
          Node Type : {nodes.value.find((n) => n.id == node_id)?.type}
        </p>

        <p>
          {nodes?.value.find((n) => n.id == node_id)?.data.inputs?.length > 0 &&
            nodes.value
              .find((n) => n.id == node_id)
              ?.data.inputs.map((input) => {
                return (
                  <div>
                    <span className="font-medium">{input.label}</span>
                    {input.type === "select" ? (
                      <select
                        id={`${node_id}-${input.label}`}
                        key={`${node_id}-${input.label}`}
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={input.value}
                        onChange={(e) =>
                          changeNodeValue(e, selectedNodes, input.id)
                        }
                      >
                        {Array.isArray(input.value) ? (
                          input.value.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))
                        ) : (
                          <option key={input.value} value={input.value}>
                            {input.value}
                          </option>
                        )}
                      </select>
                    ) : input.type === "file" ? (
                      <div>
                        {file && (
                          <div className="flex ">
                            <p className="">Selected File - {file.name}</p>
                            <TrashIcon
                              onClick={() => setFile(null)}
                              className="h-6 w-6 rounded border p-1 text-red hover:bg-red hover:text-white"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <input
                          id={`${node_id}-${input.label}`}
                          key={`${node_id}-${input.label}`}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                          type="file"
                          {...(input.required ? { required: true } : {})}
                          onChange={(e) => {
                            const selectedFile = e.target.files[0];
                            setFile(selectedFile);
                            changeNodeValue(e, selectedNodes, input.id);
                          }}
                        />
                      </div>
                    ) : input.type === "files" ? (
                      <div>
                        {file && (
                          <div className="flex ">
                            <p className="">Selected File - {file.name}</p>
                            <TrashIcon
                              onClick={() => setFile(null)}
                              className="h-6 w-6 rounded border p-1 text-red hover:bg-red hover:text-white"
                              aria-hidden="true"
                            />
                          </div>
                        )}
                        <Dropzone onChange={updateFiles} value={files}>
                          {files.map((file) => (
                            <FileMosaic {...file} preview />
                          ))}
                        </Dropzone>
                      </div>
                    ) : (
                      <div
                        id={`${node_id}-${input.label}`}
                        key={`${node_id}-${input.label}`}
                      >
                        <input
                          id={`${node_id}-${input.label}`}
                          key={`${node_id}-${input.label}`}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                          type={input.type}
                          {...(input.required ? { required: true } : {})}
                          placeholder={input.placeholder}
                          value={input.value}
                          onChange={(e) =>
                            changeNodeValue(e, selectedNodes, input.id)
                          }
                        />
                      </div>
                    )}
                  </div>
                );
              })}
        </p>

        <br></br>
        <br></br>
      </div>
    );
  };

  const changeNodeValue = (e, node_id, input_id) => {
    const newNodes = nodes.value.map((node) => {
      if (node.id == node_id) {
        const newInput = node.data.inputs.map((input) => {
          if (input.id == input_id) {
            input.value = e.target.value;
            return { ...input, value: e.target.value };
          } else {
            return input;
          }
        });
        return {
          ...node,
          data: {
            ...node.data,
            inputs: newInput,
          },
        };
      } else {
        return node;
      }
    });

    nodes.value = newNodes;
  };

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = event.target.getBoundingClientRect();
      const type = event.dataTransfer.getData("application/reactflow");
      const position = project({
        x: event.clientX - reactFlowBounds.left - 230 / 2,
        y: event.clientY - reactFlowBounds.top - 100 / 2,
      });

      const id = `${type}-${new Date().getTime()}`;
      const newNode = {
        id,
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
          ...nodeConfig[type],
          onChange: handleNodeChange,
        },
      };

      nodes.value = [...nodes.value, newNode];
    },
    [project, handleNodeChange],
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  return (
    <div className="absolute inset-0">
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
              <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <ExclamationCircleIcon
                        className="h-6 w-6 text-red"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-3 w-0 flex-1 pt-0.5">
                      <p className="text-sm font-medium text-red">
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

      <div className="grid grid-cols-5 gap-3">
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
                    placeholder="Search flow blocks"
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
              {/* {JSON.stringify(nodes)} */}
            </div>

            {nodeDivs}
          </aside>
        </div>

        <div
          className="col-span-4 h-[calc(100dvh)]"
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <ReactFlow
            nodes={nodes.value}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onInit={setRfInstance}
            edgeTypes={edgeTypes}
            proOptions={proOptions}
          >
            <Background />

            <Controls></Controls>

            <Panel
              className="items-right flex w-full justify-end gap-1 border-b border-slate-300 bg-white p-0 pt-20"
              position="top-right"
            >
              <div className="mr-auto">
                <button
                  onClick={onSave}
                  className={`mb-2 ml-4 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white ${
                    autoSaving ? "cursor-not-allowed" : ""
                  }`}
                >
                  {autoSaving ? (
                    <div>
                      <img
                        src={"/images/general/loading.gif"}
                        alt="Saving"
                        className="mx-auto h-6 w-6 animate-spin"
                      />
                    </div>
                  ) : (
                    "💾 Save"
                  )}
                </button>

                <button
                  onClick={togglePopup}
                  className={`mb-2 ml-1 rounded border border-blue-500 bg-transparent px-3 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white ${
                    autoSaving ? "cursor-not-allowed" : ""
                  }`}
                >
                  ⚙️
                </button>
                {autoSaving && <span className="pl-2"> Auto saving ..</span>}
              </div>

              <button
                onClick={handleAutoLayout}
                className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white"
              >
                ⏹️ Auto-Layout
              </button>

              <button
                onClick={getFlow}
                className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white"
              >
                🔣 Variables
              </button>

              <button
                onClick={getFlow}
                className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white"
              >
                🐞 Debug
              </button>

              <button
                onClick={getFlow}
                className={`mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white ${
                  playing.value ? "cursor-not-allowed" : ""
                }`}
              >
                {playing.value ? (
                  <img
                    src={"/images/general/loading.gif"}
                    alt="Loading"
                    className="mx-auto h-6 w-6 animate-spin"
                  />
                ) : (
                  "▶️ Play"
                )}
              </button>
              <button
                onClick={exportImage}
                className="mb-2 rounded border border-blue-500 bg-transparent px-4 py-2 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white"
              >
                📁 Export
              </button>
            </Panel>

            <div
              className={`fixed bottom-10 right-0 z-40  h-5/6	 w-[22vw] rounded-lg border-2 border-slate-300 bg-white p-5 text-black shadow-2xl  duration-300 ease-in-out ${
                flowbar ? "translate-x-0 " : "translate-x-full"
              }`}
            >
              <button className="float-right">
                <InformationCircleIcon
                  onClick={() => getNodeDoc(selectedNodes)}
                  className="text-blue  ml-2	 h-6 w-6 rounded border p-1 hover:bg-slate-800 hover:text-white"
                  aria-hidden="true"
                />
              </button>
              {/* <p>{selectedNodes}</p> */}
              <button className="float-right">
                <TrashIcon
                  onClick={() => deleteNode(selectedNodes)}
                  className="h-6 w-6 rounded border p-1 text-red hover:bg-red hover:text-white"
                  aria-hidden="true"
                />
              </button>

              <h3 className="text-2xl">✏️ Edit Node</h3>
              <p className="text-md mt-4 font-semibold">Node ID :</p>
              <p className="text-md ">{selectedNodes}</p>
              <hr></hr>
              {editForm(selectedNodes)}
            </div>

            <div
              className={`fixed bottom-10 right-0 z-40  h-5/6	 w-[22vw] rounded-lg border-2 border-slate-300 bg-white p-5 text-black shadow-2xl  duration-300 ease-in-out ${
                playingPreviewSideBar ? "translate-x-0 " : "translate-x-full"
              }`}
            >
              <h3 className="text-2xl">🧪 Testing Preview</h3>
              <p className="text-md mt-4 font-semibold">
                Node ID : {selectedNodes}
              </p>
              <hr></hr>
              <p className="text-md">Total Steps : {currentStep.total}</p>
              <p className="text-md">Current Step : {currentStep.step}</p>
              {/* <p className="text-md">
                Current result : {JSON.stringify(currentStep.result)}
              </p> */}
              <hr></hr>
              <p className="text-md mt-4 font-semibold">Result Preview :</p>

              <div className="slider">
                <div className="slider-content">
                  {currentResult[currentIndex]?.type === "text" && (
                    <p>{currentResult[currentIndex].value}</p>
                  )}
                  {currentResult[currentIndex]?.type === "image" && (
                    <img
                      src={currentResult[currentIndex].value}
                      alt="Slide content"
                      onClick={() =>
                        openPopup(currentResult[currentIndex].value)
                      }
                    />
                  )}
                </div>
                <div className="slider-controls">
                  <button onClick={prevSlide}>⮜ </button>
                  <button onClick={nextSlide}>⮞ </button>
                </div>
                <div className="slider-dots">
                  {currentResult.map((result, index) => (
                    <span
                      key={index}
                      className={currentIndex === index ? "dot active" : "dot"}
                      onClick={() => setSlide(index)}
                    ></span>
                  ))}
                </div>
              </div>

              <button
                className="hover:bg-red-700 focus:shadow-outline fixed bottom-0 right-0 m-auto mb-2.5 mr-2.5 items-center justify-center rounded bg-red px-4 py-2 text-lg font-semibold text-white focus:outline-none"
                onClick={() => {
                  setCurrentResult([]);
                  setPlayingPreviewSideBar(false);
                }}
              >
                Close
              </button>

              {/* {currentResult[currentResult.length]?.type === "text" && (
                <p>{currentResult.value}</p>
              )}
              {currentResult[currentResult.length]?.type === "image" && (
                <img src={currentResult.value} />
              )} */}
            </div>
          </ReactFlow>
        </div>
      </div>

      {isPopupVisible && (
        <div className="popup">
          <div className="popup-overlay" onClick={closePopup}></div>
          <img src={popupImage} alt="Popup content" />
        </div>
      )}

      {previewButton && (
        <div className="preViewButton hover:border-transparent hover:bg-blue-500 hover:text-white">
          <button>Preview</button>
        </div>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={popupRef} className="w-2/5 rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">Workflow Setting</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  className="text-gray-700 mb-2 block text-sm font-bold"
                  htmlFor="website-url"
                >
                  Node ID : {parms}
                </label>
              </div>
              <div className="mb-4">
                <label
                  className="text-gray-700 mb-2 block text-sm font-bold"
                  htmlFor="website-parm"
                >
                  Flow Name :
                </label>
                <input
                  className="text-gray-900 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                  id="flow_name"
                  type="text"
                  placeholder="Flow name"
                  defaultValue={flowKeys}
                />
              </div>

              <div className="mb-4">
                <label
                  className="text-gray-700 mb-2 block text-sm font-bold"
                  htmlFor="flow_description"
                >
                  Flow Description :
                </label>
                <textarea
                  className="text-gray-900 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                  id="flow_description"
                  placeholder="Flow Description"
                  defaultValue={flowDescription}
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
                  className="bg-red-500 hover:bg-red-700 focus:shadow-outline rounded px-4 py-2 font-bold text-white focus:outline-none"
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
  );
};

const SubFlowCanvaWrapper = () => (
  <ReactFlowProvider>
    <SubFlowCanva />
  </ReactFlowProvider>
);

export default SubFlowCanvaWrapper;
