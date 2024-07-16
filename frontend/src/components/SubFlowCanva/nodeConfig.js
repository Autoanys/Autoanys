// nodeConfig.js

const nodeConfigInit = {
  openBrowser: {
    label: "Open Browser",
    api: "/browser/open",
    method: "GET",
    category: "Browser",
    description: "This is an open browser node",
    showDescription: false,
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/chrome_icon.png",
    inputs: [],
    saveResult: ["null", "variable"],
    resultValue: "",
    flowDirection: "vertical",
  },
  closeBrowser: {
    label: "Close Browser",
    method: "GET",
    api: "/browser/close",
    category: "Browser",
    description: "This is a close browser node",
    showDescription: false,
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/chrome_icon.png",
    inputs: [],
    saveResult: ["null", "variable"],
    resultValue: "",
    flowDirection: "vertical",
  },
  openBrowserLink: {
    label: "Access Website",
    api: "/browser/access",
    category: "Browser",
    method: "POST",
    description: "This is an access website node",
    showDescription: false,
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
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    resultValue: "",
    flowDirection: "vertical",
  },
  waitSecond: {
    label: "Wait Second",
    category: "General",
    api: "/general/wait",
    method: "POST",
    description: "This is a wait second node",
    showDescription: false,
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
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  sshMachine: {
    label: "ssh session",
    category: "SSH",
    api: "/ssh/open",
    method: "POST",
    description: "This is a open ssh session node",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/ssh_icon.png",
    inputs: [
      {
        type: "text",
        label: "Host",
        id: "ip",
        placeholder: "Enter Host (IP Address or Hostname)",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Username",
        id: "uname",
        placeholder: "Enter Username",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  findElement: {
    label: "Find Element",
    category: "Browser",
    api: "/browser/findBy",
    method: "POST",
    description: "This is a find element node",
    showDescription: false,
    doc: "https://github.com/autoanys/autoanys",
    icon: "/images/nodes/find.png",
    inputs: [
      {
        type: "select",
        label: "Find By",
        id: "find_by",
        placeholder: "Choose find by",
        required: true,
        options: ["class", "xpath", "id", "css", "name"],
        value: "xpath",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Element query",
        id: "query",
        placeholder: "Enter element query",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  findElementClick: {
    label: "Find and Click",
    category: "Browser",
    api: "/browser/findBy/click",
    method: "POST",
    description: "This is a find and click element node",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/click_icon.png",
    inputs: [
      {
        type: "select",
        label: "Find By",
        id: "find_by",
        placeholder: "Choose find by",
        required: true,
        options: ["class", "xpath", "id", "css", "name"],
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Element query",
        id: "query",
        placeholder: "Enter element query",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  findElementType: {
    label: "Find and Type",
    category: "Browser",
    api: "/browser/findBy/type",
    method: "POST",
    description: "This is a find element and type node",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/type_icon.png",
    inputs: [
      {
        type: "select",
        label: "Find By",
        id: "find_by",
        placeholder: "Choose find by",
        required: true,
        options: ["class", "xpath", "id", "css", "name"],
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Element query",
        id: "query",
        placeholder: "Enter element query",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Text",
        id: "type",
        placeholder: "Enter text",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },

  readCSV: {
    label: "Read CSV",
    category: "Excel / CSV",
    api: "/upload/read",
    method: "POST",
    description: "This is a read CSV node",
    showDescription: false,
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
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  uploadFile: {
    label: "Upload File",
    category: "General",
    api: "/upload",
    method: "POST",
    description: "Uploading files",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/upload.png",
    inputs: [
      {
        type: "files",
        label: "Files",
        id: "files",
        placeholder: "Upload CSV file",
        required: false,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },

  ifCondition: {
    label: "IF Else Condition",
    category: "General",
    api: "null",
    method: "POST",
    description: "If condition",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/if_icon.png",
    inputs: [
      {
        type: "text",
        label: "Condition",
        id: "text",
        placeholder: "Submit Condition",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  askPromt: {
    label: "Input Prompt",
    category: "General",
    api: "null",
    method: "function",
    description: "Ask for Input",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/input_icon.png",
    inputs: [
      {
        type: "select",
        label: "Find By",
        id: "find_by",
        placeholder: "Choose input method",
        required: true,
        value: ["Ask for User Prompt", "Static Value"],
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Value",
        hidden: [{ find_by: { "Static Value": false } }],
        id: "value",
        placeholder: "Enter variable name",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Save prompt to",
        id: "value",
        placeholder: "Enter variable name",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
    saveResult: ["null", "variable"],
    saveResultSelected: "null",
    resultValue: "",
    flowDirection: "vertical",
  },
  sendMail: {
    label: "Send Email",
    category: "Email",
    api: "/email/send",
    method: "POST",
    description: "Send Email",
    showDescription: false,
    doc: "",
    icon: "/images/nodes/email_icon.png",
    inputs: [
      {
        type: "select",
        label: "Email Profile",
        id: "email_profile",
        placeholder: "Choose Profile",
        required: true,
        options: [""],
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "To",
        id: "recipient_email",
        placeholder: "Enter email address",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Subject",
        id: "email_subject",
        placeholder: "Enter subject",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
      {
        type: "text",
        label: "Body",
        id: "email_message",
        placeholder: "Enter body",
        required: true,
        value: "",
        variable: false,
        variableValue: "",
      },
    ],
  },
};

export default nodeConfigInit;
