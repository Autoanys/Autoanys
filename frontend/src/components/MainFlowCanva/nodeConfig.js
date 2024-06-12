// nodeConfig.js

import { Label } from "@headlessui/react";

const nodeConfigInit = {
  openBrowser: {
    label: "Open Browser",
    api: "/browser/open",
    method: "GET",
    category: "Browser",
    description: "This is an open browser node",
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/chrome_icon.png",
    inputs: [],
  },
  closeBrowser: {
    label: "Close Browser",
    method: "GET",
    api: "/browser/close",
    category: "Browser",
    description: "This is a close browser node",
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/chrome_icon.png",
    inputs: [],
  },
  openBrowserLink: {
    label: "Access Website",
    api: "/browser/access",
    category: "Browser",
    method: "POST",
    description: "This is an access website node",
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/website_icon.png",
    inputs: [
      {
        type: "text",
        label: "Website URL",
        placeholder: "Enter website URL",
        required: true,
        id: "website_url",
        value: "",
      },
    ],
  },
  waitSecond: {
    label: "Wait Second",
    category: "General",
    api: "/general/wait",
    method: "POST",
    description: "This is a wait second node",
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/stopwatch_icon.png",
    inputs: [
      {
        type: "number",
        label: "Seconds",
        id: "wait_seconds",
        placeholder: "Enter number of seconds",
        required: true,
        value: "",
      },
    ],
  },
  findElement: {
    label: "Find Element",
    category: "Browser",
    api: "/browser/findBy",
    method: "POST",
    description: "This is a find element node",
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/find.png",
    inputs: [
      {
        type: "select",
        label: "Find By",
        id: "find_by",
        placeholder: "Choose find by",
        required: true,
        value: ["class", "xpath", "id", "css"],
      },
      {
        type: "text",
        label: "Element query",
        id: "query",
        placeholder: "Enter element query",
        required: true,
        value: "",
      },
    ],
  },
  readCSV: {
    label: "Read CSV",
    category: "CSV",
    // api: "/csv/read",
    api: "/upload/read",
    method: "POST",
    description: "This is a read CSV node",
    doc: "",
    icon: "/images/nodes/csv_icon.png",
    inputs: [
      {
        type: "file",
        label: "CSV File",
        id: "csv_file",
        placeholder: "Upload CSV file",
        required: true,
        value: "",
      },
    ],
  },
  uploadFile: {
    label: "Upload File",
    category: "General",
    // api: "/csv/read",
    api: "/upload/read",
    method: "POST",
    description: "Uploading files",
    doc: "",
    icon: "/images/nodes/upload.png",
    inputs: [
      {
        type: "files",
        label: "Files",
        id: "files",
        placeholder: "Upload CSV file",
        required: true,
        value: "",
      },
    ],
  },
};

export default nodeConfigInit;
