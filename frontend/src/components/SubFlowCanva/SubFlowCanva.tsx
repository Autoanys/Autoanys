"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from "react";
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
import { getNodesBounds, getTransformForBounds } from "reactflow";
import { Dropzone, FileMosaic } from "@files-ui/react";
import { saveSubFlow } from "@/lib/saveSubFlow";
import "reactflow/dist/style.css";
import "./styles.css"; // Import the CSS file
import { startNode, endNode } from "./InitNodes";
import { usePathname } from "next/navigation";
import { CustomNode, IfElseNode } from "./CustomNodes";
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
import crypto from "crypto";
import GlobalVariables from "../Variables/GlobalVariables";
import CustomVariables from "../Variables/CustomVariables";

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

const flowKeys = signal("gdsarated-flow");

const edgeTypes = { custom: CustomEdge };

const SubFlowCanva = (editing, flowid) => {
  const [previewButton, setPreviewButton] = useState(false);
  const pathname = usePathname();
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState([]);
  const [showNotification, setShowNotification] = useState({
    show: false,
    code: 200,
    message: "",
  });
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [flowbar, setFlowbar] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport } = useReactFlow();
  const [playing, setPlaying] = useState(false);
  const [playingPreviewSideBar, setPlayingPreviewSideBar] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [flowDescription, setFlowDescription] = useState("");
  const [inputs, setInputs] = useState([]);
  let storedSidebarExpanded = "true";
  const [sidebarExpanded, setSidebarExpanded] = useState(
    storedSidebarExpanded === null ? false : storedSidebarExpanded === "true",
  );
  const [file, setFile] = useState(null);
  const [files, setFiles] = React.useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isVariablePopupOpen, setIsVariablePopupOpen] = useState(false);
  const popupRef = useRef(null);
  const variablePopupRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [customVariables, setCustomVariables] = useState([{ id: 1, key: "" }]);

  const handleCustomVariableChange = (id: number, newValue: string) => {
    setCustomVariables((prevVariables) =>
      prevVariables.map((variable) =>
        variable.id === id ? { ...variable, key: newValue } : variable,
      ),
    );
  };

  const handleAddVariable = () => {
    const newId =
      customVariables.length > 0
        ? Math.max(...customVariables.map((v) => v.id)) + 1
        : 1;
    setCustomVariables([...customVariables, { id: newId, key: "" }]);
  };

  const handleDeleteVariable = (id: number) => {
    setCustomVariables(
      customVariables.filter((variable) => variable.id !== id),
    );
  };

  const toggleDropdown = () => {
    setExportDropdownOpen(!exportDropdownOpen);
  };

  const exportFlow = () => {
    console.log("Export Flow Data");
  };

  const [variables, setVariables] = useState([]);
  const [currentStep, setCurrentStep] = useState({
    step: 0,
    total: 0,
    result: { type: "text", value: "" },
  });
  const [currentResult, setCurrentResult] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupImage, setPopupImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setVariables(variableConfig);
  }, []);

  const togglePopup = () => {
    setIsPopupOpen(!isPopupOpen);
  };

  const toggleVariablePopup = () => {
    setIsVariablePopupOpen(!isVariablePopupOpen);
  };

  const toggleSection = (category) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const parms = useSearchParams();

  const updateFiles = (incommingFiles) => {
    setFiles(incommingFiles);
  };

  const handleNodeChange = useCallback((id, value) => {
    console.log("IUN asdasd");
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, value } } : node,
      ),
    );
  }, []);

  const nodeConfig = addOnChangeToNodeConfig(nodeConfigInit, handleNodeChange);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setIsPopupOpen(false);
      }
      if (
        variablePopupRef.current &&
        !variablePopupRef.current.contains(event.target)
      ) {
        setIsVariablePopupOpen(false);
      }
    };

    if (isPopupOpen || isVariablePopupOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen, isVariablePopupOpen]);

  const addOnChangeHandler = (nodes) => {
    return nodes.map((node) => {
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

  const nodeTypes = useMemo(() => ({ ...nodeTypesInit }), []);

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
            setFlowDescription(data.data.description);

            if (data && flowData) {
              const { x = 0, y = 0, zoom = 1 } = flowData.viewport;
              const updatedNodes = addOnChangeHandler(flowData.nodes || []);
              setNodes(updatedNodes);
              setEdges(flowData.edges || []);
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
      setSelectedNodes(nodes.map((node) => node.id));
      console.log("Selected Nodes:", selectedNodes);
      setSelectedEdges(edges.map((edge) => edge.id));
    },
  });

  const getNodeDoc = (selectedNodes) => {
    console.log("Doc lei", selectedNodes);
    console.log("Doc lei", selectedNodes);
    console.log(
      "Doc lei",
      nodes.find((node) => node.id == selectedNodes),
    );
    const node = nodes.find((node) => node.id == selectedNodes);
    console.log("Doc lei", node);
    if (node) {
      window.open(node.data.doc, "_blank");
    }
  };

  const deleteNode = (selectedNodes) => {
    console.log("selectedNodes", selectedNodes);
    console.log("Deleting nodes:", selectedNodes);

    setNodes((nds) => nds.filter((node) => !selectedNodes.includes(node.id)));

    setEdges((eds) =>
      eds.filter(
        (edge) =>
          !selectedNodes.includes(edge.source) &&
          !selectedNodes.includes(edge.target),
      ),
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % currentResult.length);
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
    console.log(nodes.map((node) => node));
  }, [selectedNodes]);

  const checkRequiredInputs = useCallback(async () => {
    for (const node of nodes) {
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

  const customVariablesOnChange = (id, value) => {
    console.log("Custom Variables On Change", id, value);
    setCustomVariables((prev) => {
      return prev.map((variable) =>
        variable.id === id ? { ...variable, value } : variable,
      );
    });
  };

  useEffect(() => {
    setPlayingPreviewSideBar(false);
    setCurrentResult([]);
  }, [selectedNodes]);

  const triggerID = crypto.randomBytes(8).toString("hex");
  let logFlowID = "";
  if (parms.get("flowid")) {
    logFlowID = String(parms.get("flowid"));
  }
  let type = "Playground";
  let result = "Success";
  let logData = {
    trigger_id: triggerID,
    flow_id: logFlowID,
    type: type,
    result: result,
  };

  // Flow V2
  const getFlow = async () => {
    try {
      let post_data = JSON.stringify({ nodes, edges }, null, 2);

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

        fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/failed/" + triggerID,
          {
            method: "GET",
          },
        );
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
          setPlaying(true);
          setPlayingPreviewSideBar(true);
          setCurrentStep({
            total: data.steps.length,
            step: i + 1,
            result: { type: "text", value: "text" },
          });

          setCurrentIndex(i);
          // setCurrentStep((curStep) => ({
          //   ...curStep,
          //   total: data.steps.length,
          //   step: i + 1,
          // }));
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
            setPlaying(false);
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
    let startNode = nodes.find((node) => node.type == "start");

    if (!startNode) {
      console.error("Start node not found");
      return nodes;
    }

    let currentY = startNode.position.y + startNode.height + GAP;
    let updatedNodes = nodes.map((node) => {
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
    const newNodes = autoLayoutNodes(nodes);
    setNodes(newNodes);
  };

  useEffect(() => {
    // console.log("Updated nodes:", nodes);
  }, [nodes]);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
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
    const nodesBounds = getNodesBounds(getNodes());
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

  const filteredNodes = Object.keys(groupedNodes).reduce((acc, category) => {
    const filteredItems = groupedNodes[category].filter(
      (key) =>
        nodeConfig[key].label.toLowerCase().includes(searchTerm) ||
        category.toLowerCase().includes(searchTerm),
    );

    if (filteredItems.length > 0) {
      acc[category] = filteredItems;
    }

    return acc;
  }, {});

  const nodeDivs = Object.keys(filteredNodes).map((category) => (
    <div key={category}>
      <div
        // className="flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-100"
        className={`mt-4 flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-50 
        ${collapsedSections[category] ? "" : "bg-slate-50  dark:bg-[#F5F5F5]"}`}
        onClick={() => toggleSection(category)}
      >
        <span
          className={`text-sm font-medium	${collapsedSections[category] ? "" : "bg-slate-50  text-black dark:bg-[#F5F5F5]"}`}
        >
          {category}
        </span>
        <span>{collapsedSections[category] ? "⮞" : "⮟"}</span>
      </div>
      {!collapsedSections[category] && (
        <div className="ml-2 mr-2">
          {groupedNodes[category].map((key) => (
            <div
              key={key}
              className="start mt-2 border border-slate-400 dark:border-white"
              onDragStart={(event) => onDragStart(event, key)}
              draggable
            >
              <div className="content flex py-2 dark:text-[#F5F5F5] ">
                <img className="ml-2 h-5 w-5" src={nodeConfig[key].icon} />
                <p className="pl-2 text-sm">{nodeConfig[key].label}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  ));

  const chooseInputMethod = (e) => {
    console.log(e.target.id);
  };

  const rectOfNodes = getNodesBounds(nodes);

  const editForm = (node_id) => {
    const node = JSON.stringify(nodes.find((n) => n.id == node_id));

    return (
      <div>
        <p className=" pt-4 font-medium">
          {" "}
          Node Label : {nodes.find((n) => n.id == node_id)?.data.label}
        </p>
        <p className="font-medium">
          {" "}
          Node Type : {nodes.find((n) => n.id == node_id)?.type}
        </p>
        <p className=" font-medium">
          {" "}
          Connected :{" "}
          {edges.find((e) => e.source == node_id)?.target.length > 0
            ? "True"
            : "False"}
        </p>
        {edges.find((e) => e.source == node_id)?.target.length > 0 && (
          <p className="pb-4  font-medium">
            {" "}
            Connected to : {edges.find((e) => e.source == node_id)?.target}
          </p>
        )}

        <p>
          {nodes?.find((n) => n.id == node_id)?.data.inputs?.length > 0 &&
            nodes
              .find((n) => n.id == node_id)
              ?.data.inputs.map((input) => {
                return (
                  <div>
                    <span className="font-medium">{input.label}</span>
                    {/* <span className="ml-2">
                      <button
                        id={`${node_id}-${input.label}-static`}
                        className="rounded-l-lg border border-black pl-1 pr-1"
                        onClick={(e) => chooseInputMethod(e)}
                      >
                        Static{" "}
                      </button>
                      <button
                        id={`${node_id}-${input.label}-variable`}
                        className="rounded-r-lg border border-black pl-1 pr-1

"
                        onClick={(e) => chooseInputMethod(e)}
                      >
                        Variable{" "}
                      </button>
                    </span> */}
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
    const newNodes = nodes.map((node) => {
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

    setNodes(newNodes);
  };

  // const changeNodeValue = (e, node_id, input_id) => {
  //   setNodes((nds) => {
  //     // console.log("Kat", e.target.value, node_id, input_id);
  //     return nds.map((node) => {
  //       console.log("Kat 2", e.target.value, node_id, input_id);

  //       if (node.id == node_id) {
  //         const inputs = node.data.inputs;
  //         console.log("Kat 3", node, node.id);
  //         const websiteUrlInput = inputs.find((input) => input.id === input_id);
  //         // console.log("websiteUrlInput", websiteUrlInput);
  //         if (websiteUrlInput) {
  //           websiteUrlInput.value = e.target.value;
  //         }
  //         return {
  //           ...node,
  //           data: {
  //             ...node.data,
  //           },
  //         };
  //       }
  //       return node;
  //     });
  //   });
  // };

  // useEffect(() => {
  //   console.log("This is nodesss", nodes);
  // }, [nodes]);

  // const changeNodeValue = useCallback(
  //   (e, node_id, input_id) => {
  //     const newValue = e.target.value;
  //     if (e.target.type === "file") {
  //       setFile(e.target.files[0]);
  //     }

  //     console.log("This is node_id", node_id);
  //     setNodes((nds) => {
  //       return nds.map((node) => {
  //         console.log("0x32", node);

  //         if (node.id == node_id) {
  //           const inputs = node.data.inputs;
  //           const websiteUrlInput = inputs.find(
  //             (input) => input.id === input_id,
  //           );
  //           if (websiteUrlInput) {
  //             websiteUrlInput.value = newValue;
  //           }

  //           return {
  //             ...node,
  //             data: {
  //               ...node.data,
  //               value: newValue,
  //             },
  //           };
  //         }
  //         return node;
  //       });
  //     });
  //   },
  //   [setNodes],
  // );

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

      setNodes((nds) => nds.concat(newNode));
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
                    className=" peer h-full w-full pr-2 text-sm outline-none"
                    type="text"
                    id="search"
                    placeholder="Search flow blocks"
                    onChange={handleSearchChange}
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
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onInit={setRfInstance}
            edgeTypes={edgeTypes}
            proOptions={proOptions}
          >
            <Background id="2" color="#ccc" />

            <Controls></Controls>

            <Panel position="bottom-right" className="inline">
              <p className="font-semibold">
                {parms.get("flowid")
                  ? " Flow ID : " + parms.get("flowid")
                  : "None"}{" "}
              </p>
            </Panel>

            <Panel
              className="items-right flex w-full justify-end gap-1 border-b border-slate-300 bg-white p-0 pt-20 dark:bg-[#1A1A29]"
              position="top-right"
            >
              <div className="mr-auto">
                <button
                  onClick={onSave}
                  className={`mb-2 ml-4 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white	 ${
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
                  className={`mb-2 ml-4 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white ${
                    autoSaving ? "cursor-not-allowed" : ""
                  }`}
                >
                  ⚙️
                </button>
                {autoSaving && <span className="pl-2"> Auto saving ..</span>}
              </div>

              <button
                onClick={handleAutoLayout}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                ⏹️ Auto-Layout
              </button>

              <button
                onClick={toggleVariablePopup}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                🔣 Variables
              </button>

              <button
                onClick={getFlow}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                🐞 Debug
              </button>

              <button
                onClick={getFlow}
                className={`mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500  hover:text-white dark:border-slate-400 dark:text-white ${
                  playing ? "cursor-not-allowed" : ""
                }`}
              >
                {playing ? (
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
                onClick={toggleDropdown}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                📁 Export
              </button>

              {exportDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                  <div
                    className="py-1"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="options-menu"
                  >
                    <button
                      onClick={() => {
                        exportImage();
                        toggleDropdown();
                      }}
                      className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block w-full px-2 py-1 text-left text-sm"
                    >
                      Flow Image Diagram
                    </button>
                    <button
                      onClick={() => {
                        exportImage();
                        toggleDropdown();
                      }}
                      className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block w-full px-2 py-1 text-left text-sm"
                    >
                      Flow Config Data
                    </button>
                  </div>
                </div>
              )}
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
                    <div>
                      <p>{currentResult[currentIndex].value}</p>
                    </div>
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
                {parms.get("flowid") && (
                  <label
                    className="text-gray-700 mb-2 block text-sm font-bold"
                    htmlFor="website-url"
                  >
                    Node ID : {parms}
                  </label>
                )}
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

      {isVariablePopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={variablePopupRef}
            className="w-2/5 rounded bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-xl font-semibold">Variable Setting</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                {parms.get("flowid") && (
                  <label
                    className="text-gray-700 mb-2 block text-sm font-bold"
                    htmlFor="website-url"
                  >
                    Node ID : {parms}
                  </label>
                )}
              </div>

              <GlobalVariables />

              {customVariables.map((variable) => (
                <CustomVariables
                  key={variable.id}
                  customVariables={variable}
                  onChangeValue={(newValue) =>
                    handleCustomVariableChange(variable.id, newValue)
                  }
                  onDelete={() => handleDeleteVariable(variable.id)}
                />
              ))}

              <button
                className="mb-3 mt-1 w-full rounded bg-indigo-500 px-4 py-2 font-semibold text-white hover:bg-indigo-600"
                onClick={handleAddVariable}
              >
                Add More Variables
              </button>

              <div className="flex items-center justify-between">
                <button
                  className="hover:bg-red-300 focus:shadow-outline rounded bg-rose-500 px-4 py-2 font-bold text-white focus:outline-none"
                  onClick={toggleVariablePopup}
                  type="button"
                >
                  Save & Close
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
