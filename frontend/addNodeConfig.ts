import * as fs from "fs";
import * as path from "path";
import prompts from "prompts";

interface NodeInput {
  type: string;
  label: string;
  id: string;
  placeholder: string;
  required: boolean;
  value: string | string[];
}

interface NodeConfig {
  label: string;
  api: string;
  method: string;
  category: string;
  description: string;
  doc: string;
  icon: string;
  inputs: NodeInput[];
}

interface NodeConfigInit {
  [key: string]: NodeConfig;
}

// Path to the nodeConfig.js file
const configPath = path.join(
  __dirname,
  "src/components/SubfFlowCanva/nodeConfig.js",
);

// Read the existing config file
const readConfig = (): NodeConfigInit => {
  const data = fs.readFileSync(configPath, "utf-8");
  const configMatch = data.match(/const nodeConfigInit = (.*);/s);
  if (!configMatch) throw new Error("Config not found in file");
  const config = JSON.parse(configMatch[1]);
  return config;
};

// Write the updated config file
const writeConfig = (config: NodeConfigInit): void => {
  const data = `// nodeConfig.js\n\nconst nodeConfigInit = ${JSON.stringify(config, null, 2)};\n\nexport default nodeConfigInit;\n`;
  fs.writeFileSync(configPath, data, "utf-8");
};

// Prompt user for input
const promptUser = async (): Promise<{ key: string; node: NodeConfig }> => {
  const { key, label, api, method, category, description, doc, icon } =
    await prompts([
      { name: "key", message: "What is the node key?", type: "text" },
      { name: "label", message: "What is the node label?", type: "text" },
      { name: "api", message: "What is the API link?", type: "text" },
      {
        name: "method",
        message: "What is the API method (GET/POST)?",
        type: "select",
        choices: [
          { title: "GET", value: "GET" },
          { title: "POST", value: "POST" },
        ],
      },
      { name: "category", message: "What is the category?", type: "text" },
      {
        name: "description",
        message: "What is the description?",
        type: "text",
      },
      { name: "doc", message: "What is the documentation link?", type: "text" },
      {
        name: "icon",
        message: "What is the icon file name (e.g., chrome_icon.png)?",
        type: "text",
      },
    ]);

  let inputs: NodeInput[] = [];
  if (method === "POST") {
    let addInputs = true;
    while (addInputs) {
      const input = await prompts([
        { name: "type", message: "Input type?", type: "text" },
        { name: "label", message: "Input label?", type: "text" },
        { name: "id", message: "Input id?", type: "text" },
        { name: "placeholder", message: "Input placeholder?", type: "text" },
        { name: "required", message: "Is it required? (Y/N)", type: "confirm" },
      ]);

      inputs.push({
        type: input.type,
        label: input.label,
        id: input.id,
        placeholder: input.placeholder,
        required: input.required,
        value: input.type === "select" ? [] : "",
      });

      const { addMore } = await prompts([
        {
          name: "addMore",
          message: "Add another input? (Y/N)",
          type: "confirm",
        },
      ]);

      addInputs = addMore;
    }
  }

  return {
    key,
    node: {
      label,
      api,
      method,
      category,
      description,
      doc,
      icon: `/images/nodes/${icon}`,
      inputs,
    },
  };
};

// Main function
const main = async () => {
  try {
    const config = readConfig();
    const { key, node } = await promptUser();
    config[key] = node;
    writeConfig(config);
    console.log("Node configuration added successfully!");
  } catch (error) {
    console.error("Error updating node configuration:", error);
  }
};

main();
