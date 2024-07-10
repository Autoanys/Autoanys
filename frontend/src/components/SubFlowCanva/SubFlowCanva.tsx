"use client";
import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  use,
} from "react";
import ReactFlow, {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MiniMap,
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
import { debug } from "console";
import { useTranslation } from "next-i18next";
import { useHotkeys } from "react-hotkeys-hook";
import { BsDatabaseAdd } from "react-icons/bs";
import EmojiPicker from "emoji-picker-react";
import { Emoji, EmojiStyle } from "emoji-picker-react";

const proOptions = { hideAttribution: true };
const addOnChangeToNodeConfig = (config, handleChange) => {
  const updatedConfig = { ...config };
  Object.keys(updatedConfig).forEach((key) => {
    updatedConfig[key].onChange = handleChange;
  });
  return updatedConfig;
};

const flowKeys = signal("new-sub-flow");

const edgeTypes = { custom: CustomEdge };

const SubFlowCanva = (editing, flowid) => {
  const { t } = useTranslation("flowCanvas");
  const [previewButton, setPreviewButton] = useState(false);
  const [confirmAdding, setConfirmAdding] = useState(false);
  const pathname = usePathname();
  const [edges, setEdges] = useState([]);
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
  const [emjoiValue, setEmojiValue] = useState("1f423");
  const emojiPickerRef = useRef(null);

  const [showNotification, setShowNotification] = useState({
    show: false,
    code: 200,
    message: "",
  });
  const [suggestions, setSuggestions] = useState([]);
  const [flowDirection, setFlowDirection] = useState("horizontal");

  const [cateLoading, setCateLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [needConfirmation, setNeedConfirmation] = useState(true);
  const [selectedNodes, setSelectedNodes] = useState([]);
  const [selectedEdges, setSelectedEdges] = useState([]);
  const [flowbar, setFlowbar] = useState(false);
  const [rfInstance, setRfInstance] = useState(null);
  const { setViewport, getViewport, zoomTo, zoomIn, setCenter } =
    useReactFlow();
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
  const exportPopRef = useRef(null);

  const confirmPopup = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentDebugIndex, setCurrentDebugIndex] = useState(0);
  const [resultLoading, setResultLoading] = useState(false);
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);
  const [customVariables, setCustomVariables] = useState([
    { id: 1, key: "", value: "" },
  ]);
  const [debugData, setDebugData] = useState([]);
  const [debugStep, setDebugStep] = useState(0);
  const [debugging, setDebugging] = useState(false);
  let isRunning = useRef(false);

  const initialNodes = [
    {
      id: "start-node",
      type: "start",
      position: { x: 400, y: 200 },
      data: {
        label: t("startnode"),
        value: "",
        description: "This is an start node",
        onChange: (id, value) => handleNodeChange(id, value),
      },
    },
    {
      id: "end-node",
      type: "end",
      position: { x: 400, y: 550 },
      data: {
        label: t("endnode"),
        result: "End for this node",
        inputs: [
          {
            type: "text",
            label: "End Result Value",
            id: "variable",
            placeholder: "Enter variable name",
            required: false,
            value: "CAAS$",
            variable: true,
            variableValue: "",
          },
        ],
      },
    },
  ];

  const handleEmojiClick = (event, emojiObject) => {
    setEmojiValue(event.unified);
    setEmojiPickerOpen(false);
  };

  const [nodes, setNodes] = useState(initialNodes);

  const handleCustomVariableChange = (id: number, newValue: string) => {
    setCustomVariables((prevVariables) =>
      prevVariables.map((variable) =>
        variable.id === id ? { ...variable, key: newValue } : variable,
      ),
    );
  };

  const handleCustomVariableChangeValue = (id: number, newValue: string) => {
    setCustomVariables((prevVariables) =>
      prevVariables.map((variable) =>
        variable.id === id ? { ...variable, value: newValue } : variable,
      ),
    );
  };

  const handleAddVariable = () => {
    const newId =
      customVariables.length > 0
        ? Math.max(...customVariables.map((v) => v.id)) + 1
        : 1;
    setCustomVariables([...customVariables, { id: newId, key: "", value: "" }]);
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
  const [isTextPopupVisible, setIsTextPopupVisible] = useState(false);
  const [popupImage, setPopupImage] = useState(null);
  const [popupText, setPopupText] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentDebugResult, setCurrentDebugResult] = useState([]);
  const [activedCategory, setActivedCategory] = useState([]);
  const [showDescription, setShowDescription] = useState(false);
  const [activeComponent, setActiveComponent] = useState([]);

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

  useEffect(() => {
    setCateLoading(true);
    let activated = [];

    const fetchDatas = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/plugins/actived/",
          {
            method: "GET",
          },
        );

        const data = await res.json();

        for (let i = 0; i < data.actived.length; i++) {
          activated.push(data.actived[i].name);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas()
      .then(() => setActivedCategory(activated))
      .then(() => setCateLoading(false));
  }, []);

  useEffect(() => {
    setCateLoading(true);
    let activated = [];

    const fetchDatas = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + "/components/active/",
          {
            method: "GET",
          },
        );

        const data = await res.json();
        console.log("Component", data);
        for (let i = 0; i < data.data.length; i++) {
          activated.push(data.data[i].name);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchDatas()
      .then(() => setActiveComponent(activated))
      .then(() => setCateLoading(false));
  }, []);

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
      setExportDropdownOpen(false);
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        !emojiPickerRef.current
      ) {
        setIsPopupOpen(false);
      }
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target)
      ) {
        setEmojiPickerOpen(false);
      }
      if (
        variablePopupRef.current &&
        !variablePopupRef.current.contains(event.target)
      ) {
        setIsVariablePopupOpen(false);
      }
      if (
        confirmPopup.current &&
        !confirmPopup.current.contains(event.target)
      ) {
        setConfirmAdding(false);
      }
    };

    if (
      isPopupOpen ||
      isVariablePopupOpen ||
      confirmAdding ||
      emojiPickerOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPopupOpen, isVariablePopupOpen, confirmAdding, emojiPickerOpen]);

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
  const toggleDesc = () => {
    setShowDescription((prev) => !prev);
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          showDescription: !node.data.showDescription,
        },
      })),
    );
  };

  const toggleFlowDirection = (va) => {
    setFlowDirection(va);

    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          flowDirection: va,
        },
      })),
    );
  };

  useHotkeys("ctrl+shift+h, cmd+shift+h", (event) => {
    event.preventDefault();
    toggleDesc();
  });

  Object.keys(nodeConfig).forEach((key) => {
    nodeTypes[key] = CustomNode;
  });

  const handleEdgeRemove = useCallback((id) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== id));
  }, []);

  useEffect(() => {
    if (editing && flowid) {
      if (parms.get("flowid")) {
        setLoading(true);
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
            setFlowDirection(flowData.flowDirection || "horizontal");
            if (data && flowData) {
              const { x = 0, y = 0, zoom = 1 } = flowData.viewport;
              const updatedNodes = addOnChangeHandler(flowData.nodes || []);
              const updatedEdges = (flowData.edges || []).map((edge) => ({
                ...edge,
                data: {
                  ...edge.data,
                  onRemove: handleEdgeRemove,
                },
              }));
              setNodes(updatedNodes);
              setEdges(updatedEdges);
              setViewport({ x, y, zoom });
              const parsedVariables = JSON.parse(flowData.variables);
              setCustomVariables(parsedVariables);
            }
          } catch (error) {
            console.error("Error fetching data:", error);
          }
        };

        fetchData().then(() => setLoading(false));
      }
    }
  }, [editing, flowid, parms, handleEdgeRemove]);

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      setSelectedNodes(nodes.map((node) => node.id));

      setSelectedEdges(edges.map((edge) => edge.id));
    },
  });

  const getNodeDoc = (selectedNodes) => {
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

  const validateInput = (value: string) => {
    const regex = /^[a-zA-Z0-9$]*$/;
    return regex.test(value);
  };

  const deleteNode = (selectedNodes) => {
    console.log("selectedNodes", selectedNodes);
    console.log("Deleting nodes:", selectedNodes);
    if (selectedNodes == "start-node" || selectedNodes == "end-node") {
      return;
    }

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

  const nextDebugSlide = () => {
    setCurrentDebugIndex(
      (prevIndex) => (prevIndex + 1) % currentDebugResult.length,
    );
    if (currentDebugIndex === debugStep - 1) {
      setDebugStep(debugStep + 1);
    }
  };

  const prevDebugSlide = () => {
    setCurrentDebugIndex((prevIndex) =>
      prevIndex === 0 ? currentDebugResult.length - 1 : prevIndex - 1,
    );
  };

  const setDebugSlide = (index) => {
    setCurrentDebugIndex(index);
  };

  const openPopup = (image) => {
    setPopupImage(image);
    setIsPopupVisible(true);
  };

  const openTextPopup = (text) => {
    setPopupText(text);
    setIsTextPopupVisible(true);
  };

  const closeTextPopup = () => {
    setIsTextPopupVisible(false);
    setPopupText(null);
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
      let posx, posy, zoom;
      getViewport();
      console.log("Viewport", getViewport());
      console.log(
        "selectedNodes Position",
        nodes.find((node) => node.id),
      );

      setFlowbar(true);
      // setViewport({ x: -511, y: -359, zoom: 1.7 });
    }
    console.log(nodes.map((node) => node));
  }, [selectedNodes]);

  const checkRequiredInputs = useCallback(async () => {
    for (const node of nodes) {
      if (node.data.inputs?.length) {
        for (const input of node.data.inputs) {
          console.log("DAS", node.data.inputs);
          if (input.required && !input.value) {
            alert(`Required input ${input.label} is missing`);
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

  const handleActiveToggle = async (flowID) => {
    console.log("Toggled active status for flow with ID:", flowID);
    const res = fetch(
      process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/active/" + flowID,
      {
        method: "GET",
      },
    );
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
  let flow_type = "Flow";
  let result = "Success";
  let logData = {
    trigger_id: triggerID,
    flow_id: logFlowID,
    flow_type: flow_type,
    type: type,
    result: result,
  };

  // Flow V2
  const getFlow = async (debug) => {
    await setCurrentResult([]);
    await setPreviewButton(false);
    if (!debug) {
      try {
        let post_data = JSON.stringify(
          { nodes, edges, variables: customVariables },
          null,
          2,
        );

        console.log("POST DATA", post_data);
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

        const inputReq = await checkRequiredInputs();
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

          await fetch(
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
          await setPlaying(false);
          await setResultLoading(false);
          return;
        } else {
          const data = await res.json();

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

            await fetch(
              process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/failed/" + triggerID,
              {
                method: "GET",
              },
            );
            await setResultLoading(false);
            await setPlaying(false);
            return;
          }

          for (let i = 0, l = data.steps.length; i < l; i++) {
            console.log("Loop iteration", i);
            setPlaying(true);
            setPlayingPreviewSideBar(true);
            setResultLoading(true);
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
            console.log(`Fetching: ${data.steps[i].api}`);

            const curRes = await fetch(data.steps[i].api, {
              method: data.steps[i].method,
              headers: {
                "Content-Type": "application/json",
              },
              body:
                data.steps[i].method === "POST"
                  ? JSON.stringify(data.steps[i].post_data)
                  : null,
            });

            const resData = await curRes.json();

            if (curRes.status === 450) {
              console.log("IN");
              setShowNotification({
                show: true,
                code: 450,
                message: "Failed running the flow",
              });
              setTimeout(() => {
                setShowNotification({
                  show: false,
                  code: 450,
                  message: "Failed running the flow",
                });
              }, 3000);
              console.log("IN 450");

              await fetch(
                process.env.NEXT_PUBLIC_BACKEND_URL +
                  "/logs/failed/" +
                  triggerID,
                {
                  method: "GET",
                },
              );

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
                    result: JSON.stringify({
                      message: JSON.stringify(resData.detail),
                    }),
                  }),
                },
              );

              setCurrentResult((currentResult) => [
                ...currentResult,
                { type: "text", value: resData.detail, error: true },
              ]);
              if (i === data.steps.length - 1) {
                setPlaying(false);
                setResultLoading(false);
                break;
              } else {
                continue;
              }
            }

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
                { type: "image", value: resData.preview, error: false },
              ]);
            } else {
              setCurrentResult((currentResult) => [
                ...currentResult,
                { type: "text", value: resData.message, error: false },
              ]);
            }
            console.log("Current Index", i);

            if (i === data.steps.length - 1) {
              setPlaying(false);
              setResultLoading(false);
            }
          }
        }
      } catch (err) {
        console.log(err);
      }
    } else {
      try {
        let post_data = JSON.stringify(
          { nodes, edges, variables: customVariables },
          null,
          2,
        );

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

        const inputReq = await checkRequiredInputs();
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

          await fetch(
            process.env.NEXT_PUBLIC_BACKEND_URL + "/logs/failed/" + triggerID,
            {
              method: "GET",
            },
          );
        }
        if (!inputReq || res.status != 200) {
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
          setDebugging(true);
          setDebugData(data.steps);
          setDebugStep(0);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(event.target.flow_name.value);
    flowKeys.value = event.target.flow_name.value;
    setFlowDescription(event.target.flow_description.value);
    setIsPopupOpen(false);
  };

  const handleVariableSubmit = (event) => {
    console.log("EVENT");
    event.preventDefault();
    // setCustomVariables(event.target.custom_variables.value);
    // setIsVariablePopupOpen(false);
  };

  const autoLayoutNodes = (nodes, edges) => {
    const GAP = 50; // Define the gap between each node

    const startNode = nodes.find((node) => node.type === "start");
    if (!startNode) {
      console.error("Start node not found");
      return nodes;
    }

    // Topological sort
    const sortedNodes = topologicalSort(nodes, edges);
    if (!sortedNodes) {
      console.error("Topological sort failed");
      return nodes;
    }

    // Layout nodes
    const startXCenter = startNode.position.x + startNode.width / 2; // Center x position of the start node
    let currentY = startNode.position.y + startNode.height + GAP;
    const updatedNodes = sortedNodes.map((node, index) => {
      if (node.id !== startNode.id) {
        const nodeCenterX = startXCenter - node.width / 2;
        node.position = { ...node.position, x: nodeCenterX, y: currentY };
        currentY += node.height + GAP;
      }
      return node;
    });

    return updatedNodes;
  };

  const topologicalSort = (nodes, edges) => {
    const nodeMap = new Map();
    nodes.forEach((node) => nodeMap.set(node.id, node));

    const inDegree = new Map();
    nodes.forEach((node) => inDegree.set(node.id, 0));

    edges.forEach((edge) => {
      const target = edge.target;
      inDegree.set(target, inDegree.get(target) + 1);
    });

    const queue = [];
    nodes.forEach((node) => {
      if (inDegree.get(node.id) === 0) {
        queue.push(node);
      }
    });

    const sorted = [];
    while (queue.length > 0) {
      const node = queue.shift();
      sorted.push(node);

      edges.forEach((edge) => {
        if (edge.source === node.id) {
          const targetNode = nodeMap.get(edge.target);
          inDegree.set(targetNode.id, inDegree.get(targetNode.id) - 1);
          if (inDegree.get(targetNode.id) === 0) {
            queue.push(targetNode);
          }
        }
      });
    }

    if (sorted.length !== nodes.length) {
      console.error("There is a cycle in the graph");
      return null;
    }

    return sorted;
  };

  const handleAutoLayout = () => {
    const newNodes = autoLayoutNodes(nodes, edges);
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

  // useEffect(() => {
  //   console.log(JSON.stringify(customVariables));
  //   const varibaleoNKECT = {
  //     variables: JSON.stringify(customVariables),
  //   };
  //   console.log("Combined", JSON.stringify(varibaleoNKECT));
  // }, [customVariables]);

  const router = useRouter();

  const onSave = useCallback(async () => {
    console.log(rfInstance, "rfInstance");

    if (rfInstance && parms.get("flowid")) {
      const flow = rfInstance.toObject();
      const variablesObject = {
        variables: JSON.stringify(customVariables),
      };

      console.log("This is variablesObject", customVariables, variablesObject);
      const mergedFlow = { ...flow, ...variablesObject };
      const flowJson = String(JSON.stringify(mergedFlow));
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
            flowjson: flowJson,
          }),
        },
      );
      console.log(" dFLOW", flow);
      console.log("Flow data saved successfully");
      await router.push("/subflow", { scroll: false });
    }
    if (rfInstance && !parms.get("flowid")) {
      // if (
      //   (needConfirmation === true && flowKeys === "new-sub-flow") ||
      //   (needConfirmation === true && flowDescription === "")
      // ) {
      //   setConfirmAdding(true);
      //   console.log("Setting need confirmation to true");
      //   console.log(needConfirmation);
      // } else {
      console.log("SASDSADASDDASD");

      const flow = rfInstance.toObject();
      const variablesObject = {
        variables: JSON.stringify(customVariables),
      };

      console.log("This is variablesObject", customVariables, variablesObject);
      const mergedFlow = { ...flow, ...variablesObject };

      console.log("This is Flow", flow);
      console.log("This is customVariables", customVariables);
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
            flowjson: String(JSON.stringify(mergedFlow)),
          }),
        },
      );
      console.log("Flow data saved successfully");
      console.log(res, "res.data");
      const data = await res.json();
      console.log(data, "data");
      await router.push("/subflowedit?flowid=" + data.data, {
        scroll: false,
      });
      setAutoSaving(false);
    }
    // }
  }, [rfInstance, flowKeys, flowDescription, customVariables]);

  const confirmAddingSubflow = async () => {
    // console.log("Setting need confirmation to false");
    // await setNeedConfirmation(false);
    // console.log("Setting confirm adding to false");
    setConfirmAdding(false);
    await setNeedConfirmation(false);
    // console.log("Calling onSave");
    onSave;
    // await onSave();
  };

  const cancelConfirm = () => {
    setConfirmAdding(false);
  };

  const today = new Date();
  const time = today.getHours() + "_" + today.getMinutes();

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
  const exportConfig = async () => {
    try {
      const res = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL + "/subflow/exportconfig/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodes: nodes,
            edges: edges,
            variables: customVariables,
          }),
        },
      );

      const data = await res.json();

      const download = await fetch(
        process.env.NEXT_PUBLIC_BACKEND_URL +
          "/subflow/exportconfig/download/" +
          data.filename,
        {
          method: "GET",
        },
      );

      if (!download.ok) {
        throw new Error("Failed to download file");
      }

      const blob = await download.blob();

      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();

      // Step 5: Cleanup
      a.remove();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting config:", error);
    }
  };
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

  const collapseAll = () => {
    setCollapsedSections((prev) =>
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = true;
        return acc;
      }, {}),
    );
  };

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

  useEffect(() => {
    const debugFunction = async () => {
      if (debugStep === 0) {
        return;
      } else {
        setCurrentDebugIndex(debugStep - 1);
        setResultLoading(true);
        const res = await fetch(debugData[debugStep - 1].api, {
          method: debugData[debugStep - 1].method,
          headers: {
            "Content-Type": "application/json",
          },
          body:
            debugData[debugStep - 1].method === "POST"
              ? JSON.stringify(debugData[debugStep - 1].post_data)
              : null,
        });

        const resData = await res.json();

        if (resData.preview) {
          console.log("Preview data", resData.preview);
          setCurrentDebugResult((currentDebugResult) => [
            ...currentDebugResult,
            { type: "image", value: resData.preview, error: false },
          ]);
        } else {
          setCurrentDebugResult((currentDebugResult) => [
            ...currentDebugResult,
            { type: "text", value: resData.message, error: false },
          ]);
        }
      }
    };
    debugFunction().then(() => setResultLoading(false));
  }, [debugStep, debugData]);

  const nodeDivs = Object.keys(filteredNodes).map((category) => (
    <div
      key={category}
      className={` ${activedCategory.includes(category) ? "" : "hidden"} `}
    >
      <div
        // className="flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-100"
        className={`mt-4  flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-50 dark:bg-slate-900 
        ${collapsedSections[category] ? "" : "bg-slate-50  dark:bg-[#F5F5F5]"}`}
        onClick={() => toggleSection(category)}
      >
        <span
          className={`text-sm font-medium  dark:bg-slate-900 dark:text-white	${collapsedSections[category] ? "" : "bg-slate-50  text-black dark:bg-[#F5F5F5]"}`}
        >
          {category}
        </span>
        <span>{collapsedSections[category] ? "⮞" : "⮟"}</span>
      </div>
      {!collapsedSections[category] && (
        <div className="ml-2 mr-2">
          {groupedNodes[category].map((key) => (
            // add cursor-grabbing when onDragStart
            <div
              key={key}
              className="start mt-2 cursor-grab border border-slate-400 hover:bg-slate-50 dark:border-white dark:hover:bg-slate-600"
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

  // const ComponentDiv = Object.keys(activeComponent).map((component) => (
  //   <div
  //     key={component}
  //   >
  //     <div
  //       // className="flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-100"
  //       className={`mt-4  flex cursor-pointer items-center justify-between border-b border-slate-400 px-4 py-2 hover:bg-slate-50 dark:bg-slate-900
  //       ${collapsedSections[category] ? "" : "bg-slate-50  dark:bg-[#F5F5F5]"}`}
  //       onClick={() => toggleSection(category)}
  //     >
  //       <span
  //         className={`text-sm font-medium  dark:bg-slate-900 dark:text-white	${collapsedSections[category] ? "" : "bg-slate-50  text-black dark:bg-[#F5F5F5]"}`}
  //       >
  //         {category}
  //       </span>
  //       <span>{collapsedSections[category] ? "⮞" : "⮟"}</span>
  //     </div>
  //     {!collapsedSections[category] && (
  //       <div className="ml-2 mr-2">
  //         {groupedNodes[category].map((key) => (
  //           // add cursor-grabbing when onDragStart
  //           <div
  //             key={key}
  //             className="start mt-2 cursor-grab border border-slate-400 dark:border-white"
  //             onDragStart={(event) => onDragStart(event, key)}
  //             draggable
  //           >
  //             <div className="content flex py-2 dark:text-[#F5F5F5] ">
  //               <img className="ml-2 h-5 w-5" src={nodeConfig[key].icon} />
  //               <p className="pl-2 text-sm">{nodeConfig[key].label}</p>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     )}
  //   </div>
  // ));

  const rectOfNodes = getNodesBounds(nodes);

  const editForm = (node_id) => {
    const node = JSON.stringify(nodes.find((n) => n.id == node_id));

    return (
      <div className="h-4/5">
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
                const options = input.options || [];
                return (
                  <div className="mt-2 ">
                    <span className="font-medium">{input.label}</span>
                    <span className="mb-2	 ml-2 text-sm ">
                      <button
                        id={`${node_id}-${input.label}-static`}
                        className={` ${input.type === "select" ? "rounded-r-lg" : ""} mb-2 rounded-l-lg border border-black pl-1 pr-1 hover:bg-slate-500 hover:text-white ${!input.variable && "cursor-not-allowed bg-slate-500 text-white"}`}
                        onClick={(e) =>
                          chooseInputMethod(selectedNodes, input.id, e)
                        }
                      >
                        Static{" "}
                      </button>
                      {input.type !== "select" && (
                        <button
                          id={`${node_id}-${input.label}-variable`}
                          className={`mb-2 rounded-r-lg border border-black pl-1 pr-1 hover:bg-slate-500 hover:text-white ${input.variable && "cursor-not-allowed bg-slate-500 text-white "}`}
                          onClick={(e) =>
                            chooseInputMethod(selectedNodes, input.id, e)
                          }
                        >
                          Variable{" "}
                        </button>
                      )}
                    </span>
                    {input.type === "select" ? (
                      <select
                        id={`${node_id}-${input.id}`}
                        key={`${node_id}-${input.id}`}
                        className="h-10 w-full rounded-lg  border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                        value={input.value}
                        onChange={(e) =>
                          changeNodeValue(
                            e,
                            selectedNodes,
                            input.variable ? "variable" : input.id,
                          )
                        }
                      >
                        {Array.isArray(input.options) ? (
                          input.options.map((option) => (
                            <option key={option} value={option}>
                              {option}
                              {/* {input.value ? input.value : optios[0]} */}
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
                            changeNodeValue(
                              e,
                              selectedNodes,
                              input.variable ? "variable" : input.id,
                            );
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
                        <p>{input.variable}</p>
                        <input
                          id={`${node_id}-${input.label}`}
                          key={`${node_id}-${input.label}`}
                          className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                          type={input.variable ? "text" : input.type}
                          {...(input.required ? { required: true } : {})}
                          placeholder={
                            input.variableValue
                              ? input.variableValue
                              : input.placeholder
                          }
                          value={input.value}
                          onChange={(e) =>
                            handleInputChange(
                              e,
                              node_id,
                              input.id,
                              input.variable,
                            )
                          }
                        />
                        {input.variable && suggestions.length > 0 && (
                          <div className="suggestions-dropdown mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
                            {suggestions.map((variable) => (
                              <div
                                key={variable.id}
                                className="suggestion-item cursor-pointer px-3 py-2 hover:bg-sky-100"
                                onClick={() =>
                                  handleSuggestionClick(variable.key, input.id)
                                }
                              >
                                {variable.key}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
        </p>

        <br></br>
        {nodes.find((n) => n.id == node_id)?.data?.saveResult && (
          <p>
            <label>Save Result to</label>

            <select
              id={`${node_id}-saveResult`}
              key={`${node_id}-saveResult`}
              value={
                nodes.find((n) => n.id == node_id)?.data.saveResultSelected
              }
              onChange={(e) => changeSaveResultValue(e, node_id)}
              className="h-10 w-full rounded-lg  border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              {nodes
                .find((n) => n.id == node_id)
                ?.data?.saveResult?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
            </select>

            {nodes.find((n) => n.id == node_id)?.data.saveResultSelected ===
              "variable" && (
              <input
                id={`${node_id}-saveResultValue`}
                key={`${node_id}-saveResultValue`}
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                type="text"
                autoComplete="off"
                placeholder="Select Variable Name to Save Result"
                value={nodes.find((n) => n.id == node_id)?.data.resultValue}
                onChange={(e) => changeResultValue(e, node_id)}
              />
            )}
            {nodes.find((n) => n.id == node_id)?.data.saveResultSelected ===
              "variable" &&
              suggestions.length > 0 && (
                <div className="suggestions-dropdown mt-1 rounded-lg border border-slate-200 bg-white shadow-lg">
                  {suggestions.map((variable) => (
                    <div
                      key={variable.id}
                      className="suggestion-item cursor-pointer px-3 py-2 hover:bg-sky-100"
                      onClick={() =>
                        handleSaveSuggestionClick(variable.key, node_id)
                      }
                    >
                      {variable.key}
                    </div>
                  ))}
                </div>
              )}
          </p>
        )}

        <button
          disabled={
            edges.find((e) => e.source == node_id)?.target ? false : true
          }
          onClick={() => {
            nextNode(node_id);
          }}
          className={`absolute bottom-2 right-2 h-10 w-22 rounded-lg text-white 
            ${edges.find((e) => e.source == node_id)?.target ? "bg-rose-500 hover:bg-rose-600 " : "cursor-not-allowed bg-slate-500"}`}
        >
          Next Node
        </button>

        <br></br>
      </div>
    );
  };

  const handleInputChange = (e, nodeID, input_id, input_state) => {
    const newValue = e.target.value;
    changeNodeValue(e, selectedNodes, input_id);

    if (input_id === "variable" || input_state) {
      setSuggestions(
        customVariables.filter((variable) =>
          variable.key.toLowerCase().includes(newValue.toLowerCase()),
        ),
      );
    }
  };

  const changeResultValue = (e, node_id) => {
    const newValue = e.target.value;
    if (newValue == "variable") {
      console.log("IN suggfestion");
      setSuggestions(
        customVariables.filter((variable) =>
          variable.key.toLowerCase().includes(newValue.toLowerCase()),
        ),
      );
    }

    const newNodes = nodes.map((node) => {
      if (node.id == node_id) {
        return {
          ...node,
          data: {
            ...node.data,
            resultValue: newValue,
          },
        };
      } else {
        return node;
      }
    });
    setNodes(newNodes);
    setSuggestions(
      customVariables.filter((variable) =>
        variable.key.toLowerCase().includes(newValue.toLowerCase()),
      ),
    );
  };

  const changeSaveResultValue = (e, node_id) => {
    const newValue = e.target.value;

    const newNodes = nodes.map((node) => {
      if (node.id == node_id) {
        return {
          ...node,
          data: {
            ...node.data,
            saveResultSelected: newValue,
            resultValue: "CAAS$",
          },
        };
      } else {
        return node;
      }
    });
    setNodes(newNodes);
    console.log("newNodes", newNodes);
  };

  const handleSuggestionClick = (suggestion, input_id) => {
    changeNodeValue({ target: { value: suggestion } }, selectedNodes, input_id);
    setSuggestions([]);
  };

  const handleSaveSuggestionClick = (suggestion, node_id) => {
    const newNodes = nodes.map((node) => {
      if (node.id == node_id) {
        return {
          ...node,
          data: {
            ...node.data,
            resultValue: suggestion,
          },
        };
      } else {
        return node;
      }
    });
    setNodes(newNodes);
    setSuggestions([]);
  };

  const chooseInputMethod = (node_id, input_id, e) => {
    if (e.target.id.split("-").pop() == "static") {
      const newNodes = nodes.map((node) => {
        if (node.id == node_id) {
          const newInput = node.data.inputs.map((input) => {
            if (input.id == input_id) {
              input.value = e.target.value;
              return {
                ...input,
                variable: false,
                variableValue: "",
              };
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
    }
    if (e.target.id.split("-").pop() == "variable") {
      const newNodes = nodes.map((node) => {
        if (node.id == node_id) {
          const newInput = node.data.inputs.map((input) => {
            if (input.id == input_id) {
              input.value = "CAAS$";
              return {
                ...input,
                variable: true,
                variableValue: "Enter Variable Name",
              };
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
    }
  };

  const changeNodeValue = (e, node_id, input_id) => {
    if (input_id === "variable") {
      const newNodes = nodes.map((node) => {
        if (node.id == node_id) {
          const newInput = node.data.inputs.map((input) => {
            if (input.id == input_id) {
              input.value = e.target.value;
              return { ...input, value: e.target.value, variable: true };
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
      if (validateInput(e.target.value)) {
        console.log("Valid");
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
      } else {
        console.log("Invalid");
      }
    } else {
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
    }
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

  const nextNode = (node_id) => {
    const target = edges.find((e) => e.source == node_id)?.target;
    setSelectedNodes(target);
    setNodes(
      nodes.map((node) => {
        if (node.id == target) {
          return {
            ...node,
            selected: true,
          };
        } else {
          return {
            ...node,
            selected: false,
          };
        }
      }),
    );
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
          showDescription: showDescription,
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

      <div className="grid h-screen grid-cols-5 gap-3">
        <div
          className="overflow-auto border-r-2 border-slate-200 pt-20"
          style={{ scrollbarWidth: "thin" }}
        >
          <aside>
            <div className="description p-2 pb-4">
              <div className="m-2 mx-auto	 max-w-md rounded-lg border-2 border-slate-200">
                <div className="relative flex h-7 w-full	items-center overflow-hidden rounded-lg bg-white focus-within:shadow-lg dark:bg-slate-800">
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
                    className="peer h-full w-full pr-2 text-sm outline-none dark:bg-slate-800 dark:text-white"
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
              {/* <button onClick={collapseAll}>Collapse All</button> */}
            </div>
            {nodeDivs}
            {/* <p>{JSON.stringify(activeComponent)}</p> */}
            {!cateLoading && activedCategory.length === 0 && (
              <div className="flex h-64 items-center justify-center">
                <p className="text-lg">No active plugins</p>
              </div>
            )}
            {cateLoading && (
              <div>
                <img
                  src={"/images/general/loading.gif"}
                  alt="Loading"
                  className="mx-auto h-10 w-10 animate-spin"
                />
              </div>
            )}
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
            {/* <MiniMap
              className="mb-10"
              nodeClassName="mb-12"
              nodeStrokeWidth={3}
              offsetScale={5}
            /> */}

            <Background id="2" />

            <Controls></Controls>

            <Panel position="bottom-right" className="inline">
              <p className="float-right font-semibold ">
                Show Description
                <input
                  type="checkbox"
                  onChange={toggleDesc}
                  checked={showDescription}
                  className="ml-2"
                />
              </p>
              <br></br>
              <p className="font-semibold">
                {parms.get("flowid")
                  ? " Flow ID : " + parms.get("flowid")
                  : "Not yet save Flow"}{" "}
              </p>
            </Panel>

            <Panel
              className="items-right flex w-full justify-end gap-1 border-b border-slate-300 bg-white p-0 pt-20 dark:bg-[#1A1A29]"
              position="top-right"
            >
              <div className="mr-auto">
                <button
                  onClick={() => router.push("/subflow")}
                  className={`mb-2 ml-4 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white ${
                    autoSaving ? "cursor-not-allowed" : ""
                  }`}
                >
                  ↩️ {t("back")}
                </button>

                <button
                  onClick={onSave}
                  className={`mb-2 ml-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white	 ${
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
                    `💾 ${t("save")} `
                  )}
                </button>

                <button
                  onClick={togglePopup}
                  className={`mb-2 ml-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white ${
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
                ⏹️ {t("autolayout")}
              </button>

              <button
                onClick={toggleVariablePopup}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                🔣 {t("variables")}
              </button>

              <button
                onClick={() => getFlow(true)}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                🐞 {t("debug")}
              </button>

              <button
                onClick={() => getFlow(false)}
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
                  `▶️ ${t("play")} `
                )}
              </button>
              <button
                onClick={toggleDropdown}
                className="mb-2 rounded border border-blue-500 bg-transparent px-2 py-1 font-semibold text-blue-700 hover:border-transparent hover:bg-blue-500 hover:text-white dark:border-slate-400 dark:text-white"
              >
                📁 {t("export")}
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
                      {t("flowdiagram")}
                    </button>
                    <button
                      onClick={() => {
                        exportConfig();
                        toggleDropdown();
                      }}
                      className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block w-full px-2 py-1 text-left text-sm"
                    >
                      {t("flowconfig")}
                    </button>
                    <button
                      onClick={() => {
                        toggleDropdown();
                      }}
                      className="text-gray-700 hover:bg-gray-100 hover:text-gray-900 block w-full px-2 py-1 text-left text-sm"
                    >
                      {t("cancel")}
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
              {selectedNodes !== "start-node" &&
                selectedNodes !== "end-node" && (
                  <button className="float-right">
                    <TrashIcon
                      onClick={() => deleteNode(selectedNodes)}
                      className={`h-6 w-6 rounded border p-1 text-red hover:bg-red hover:text-white ${selectedNodes == "start-node" ? "cursor-not-allowed" : ""} ${selectedNodes == "end-node" ? "cursor-not-allowed" : ""}`}
                      aria-hidden="true"
                    />
                  </button>
                )}

              <h3 className="text-2xl">✏️ Edit Node</h3>
              <p className="text-md mt-4 font-semibold">Node ID :</p>
              <p className="text-md ">{selectedNodes}</p>
              <hr></hr>
              {editForm(selectedNodes)}
              {/* <div>
                <label className="text-md mt-4 font-semibold">
                  Save result as :
                </label>
                <select className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="none">None</option>
                  <option value="variable">to Variable</option>
                </select>
                <label className="mt-4 text-sm font-semibold">
                  Variables :
                </label>
                <input
                  className="h-10 w-full rounded-lg border border-slate-200 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-sky-500"
                  type="text"
                  placeholder="Variable name"
                />
              </div> */}
            </div>

            <div
              className={`fixed bottom-10 right-0 z-40  h-full w-[22vw] rounded-lg border-2 border-slate-300 bg-white p-5 text-black shadow-2xl  duration-300 ease-in-out ${
                playingPreviewSideBar ? "translate-x-0 " : "translate-x-full"
              }`}
            >
              <h3 className="text-2xl">🧪 Playing Preview</h3>
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
                  {resultLoading && (
                    <div>
                      <img
                        src={"/images/general/loading.gif"}
                        alt="Loading"
                        className="mx-auto h-10 w-10 animate-spin"
                      />
                    </div>
                  )}
                  {currentResult[currentIndex]?.type === "text" && (
                    <div
                      onClick={() =>
                        openTextPopup(currentResult[currentIndex].value)
                      }
                    >
                      <span
                        onClick={() =>
                          openTextPopup(currentResult[currentIndex].value)
                        }
                      >
                        {currentResult[currentIndex].value
                          ? currentResult[currentIndex].error === true
                            ? "Error, Click to view details"
                            : currentResult[currentIndex].value
                          : "Loading"}
                      </span>
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
                  <p className="pr-2 ">Step {currentIndex + 1}</p>
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
                  setPlayingPreviewSideBar(false);
                  setPreviewButton(true);
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

            <div
              className={`fixed bottom-10 right-0 z-40  h-full	 w-[22vw] rounded-lg border-2 border-slate-300 bg-white p-5 text-black shadow-2xl  duration-300 ease-in-out ${
                debugging ? "translate-x-0 " : "translate-x-full"
              }`}
            >
              <h3 className="text-2xl">🪲 Debugging </h3>
              <p className="text-md mt-4 font-semibold">
                Node ID : {selectedNodes}
              </p>
              <hr></hr>
              <p className="text-md">Total Steps : {debugData.length}</p>
              <p className="text-md">Current Step : {debugStep}</p>
              {/* <p className="text-md">
                Current result : {JSON.stringify(currentStep.result)}
              </p> */}
              <hr></hr>
              <p className="text-md mt-4 font-semibold">Result Preview :</p>

              <div className="slider">
                <div className="slider-content">
                  {debugStep <= 0 && (
                    <div>
                      <button
                        onClick={() => setDebugStep(debugStep + 1)}
                        className="rounded-full bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-600"
                      >
                        Start
                      </button>
                    </div>
                  )}
                  {resultLoading && (
                    <div>
                      <img
                        src={"/images/general/loading.gif"}
                        alt="Loading"
                        className="mx-auto h-10 w-10 animate-spin"
                      />
                    </div>
                  )}
                  {currentDebugResult[currentDebugIndex]?.type === "text" && (
                    <div>
                      <p>
                        {currentDebugResult[currentDebugIndex].value
                          ? currentDebugResult[currentDebugIndex].error === true
                            ? "Error, Click to view details"
                            : currentDebugResult[currentDebugIndex].value
                          : "Loading"}
                      </p>
                    </div>
                  )}
                  {currentDebugResult[currentDebugIndex]?.type === "image" && (
                    <img
                      src={currentDebugResult[currentDebugIndex].value}
                      alt="Slide content"
                      onClick={() =>
                        openPopup(currentDebugResult[currentDebugIndex].value)
                      }
                    />
                  )}
                </div>
                {debugStep > 0 && (
                  <div className="slider-controls">
                    <button onClick={prevDebugSlide}>⮜ </button>
                    {currentDebugIndex < debugData.length && (
                      <button onClick={nextDebugSlide}>⮞ </button>
                    )}
                  </div>
                )}
                <div className="slider-dots">
                  {currentDebugResult.map((result, index) => (
                    <span
                      key={index}
                      className={
                        currentDebugIndex === index ? "dot active" : "dot"
                      }
                      onClick={() => setDebugSlide(index)}
                    ></span>
                  ))}
                </div>
              </div>

              <button
                className="hover:bg-red-700 focus:shadow-outline fixed bottom-0 right-0 m-auto mb-2.5 mr-2.5 items-center justify-center rounded bg-red px-4 py-2 text-lg font-semibold text-white focus:outline-none"
                onClick={() => {
                  setCurrentDebugResult([]);
                  setDebugging(false);
                  setDebugStep(0);
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

      {isTextPopupVisible && (
        <div className="popup">
          <div className="popup-overlay" onClick={closeTextPopup}></div>
          <p className="p-4 text-lg text-white">{popupText}</p>
        </div>
      )}

      {previewButton && (
        <div className="preViewButton hover:border-transparent hover:bg-blue-500 hover:text-white">
          <button
            onClick={() => {
              setPlayingPreviewSideBar(true);
              setPreviewButton(false);
            }}
          >
            Preview
          </button>
        </div>
      )}

      {confirmAdding && (
        <div className="bg-gray-900 fixed inset-0 flex items-center justify-center bg-opacity-50">
          <div
            ref={confirmPopup}
            className="divide-y divide-slate-300 rounded-lg bg-white p-4 shadow-lg"
          >
            <h2 className=" pb-4 pt-2 text-lg font-semibold">
              ⚠️ Adding subflow without Name or Description
            </h2>
            {/* <hr /> */}
            <div className="pb-2 pt-2">
              <p> You have selected to save a subflow.</p>
              <p>
                Are you sure you want to save the subflow without adding a
                custom name or description?{" "}
              </p>
              <p className="font-semibold">
                P.S : You can always edit the subflow later to add a custom name
              </p>
            </div>
            {/* <hr /> */}

            <div className="mt-4 flex justify-end pt-4">
              <button
                className="mr-2 rounded-lg bg-slate-100 px-4 py-1"
                onClick={cancelConfirm}
              >
                Cancel
              </button>
              <button
                className="rounded-lg bg-green-500 px-4 py-1 text-white"
                onClick={confirmAddingSubflow}
              >
                Confirmed
              </button>
            </div>
          </div>
        </div>
      )}

      {loading && (
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

      {emojiPickerOpen && (
        <div
          className="fixed left-1/2 top-20 z-50 -translate-x-1/2 transform"
          ref={emojiPickerRef}
        >
          <EmojiPicker onEmojiClick={(e) => handleEmojiClick(e)} />
        </div>
      )}

      {isPopupOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div ref={popupRef} className="w-2/5 rounded bg-white p-6 shadow-lg">
            <h2 className="mb-4 inline-flex items-center text-xl font-semibold">
              <span
                className="mr-2 rounded-lg border border-slate-400 p-1 hover:bg-slate-100"
                onClick={() => setEmojiPickerOpen(true)}
              >
                <Emoji unified={emjoiValue} />
              </span>
              Workflow Setting
            </h2>
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

              {/* <div className="mb-4">
                <label
                  className="text-gray-700 mb-2 block text-sm font-bold"
                  htmlFor="flow_description"
                >
                  Flow Direction :{" "}
                </label>
                <select
                  className="text-gray-900 focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight shadow focus:outline-none"
                  id="flow_direction"
                  placeholder="Flow Direction"
                  defaultValue={flowDirection}
                  onChange={(e) => toggleFlowDirection(e.target.value)}
                  rows="5"
                >
                  <option value="vertical">Vertical</option>
                  <option value="horizontal">Horizontal</option>
                </select>
              </div> */}

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

      {isVariablePopupOpen && (
        <div className="fixed inset-0 ml-50 flex items-center justify-center bg-black bg-opacity-50">
          <div
            ref={variablePopupRef}
            className="w-3/5 rounded bg-white p-6 shadow-lg"
          >
            <h2 className="mb-4 text-xl font-semibold">Variable Setting</h2>
            <form onSubmit={handleVariableSubmit}>
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
                  onChangeValueValue={(newValueValue) =>
                    handleCustomVariableChangeValue(variable.id, newValueValue)
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
