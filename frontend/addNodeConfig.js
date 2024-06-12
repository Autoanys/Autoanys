"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var prompts_1 = require("prompts");
// Path to the nodeConfig.js file
var configPath = path.join(__dirname, "src/components/SubfFlowCanva/nodeConfig.js");
// Read the existing config file
var readConfig = function () {
    var data = fs.readFileSync(configPath, "utf-8");
    var configMatch = data.match(/const nodeConfigInit = (.*);/s);
    if (!configMatch)
        throw new Error("Config not found in file");
    var config = JSON.parse(configMatch[1]);
    return config;
};
// Write the updated config file
var writeConfig = function (config) {
    var data = "// nodeConfig.js\n\nconst nodeConfigInit = ".concat(JSON.stringify(config, null, 2), ";\n\nexport default nodeConfigInit;\n");
    fs.writeFileSync(configPath, data, "utf-8");
};
// Prompt user for input
var promptUser = function () { return __awaiter(void 0, void 0, void 0, function () {
    var _a, key, label, api, method, category, description, doc, icon, inputs, addInputs, input, addMore;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, prompts_1.default)([
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
                ])];
            case 1:
                _a = _b.sent(), key = _a.key, label = _a.label, api = _a.api, method = _a.method, category = _a.category, description = _a.description, doc = _a.doc, icon = _a.icon;
                inputs = [];
                if (!(method === "POST")) return [3 /*break*/, 5];
                addInputs = true;
                _b.label = 2;
            case 2:
                if (!addInputs) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, prompts_1.default)([
                        { name: "type", message: "Input type?", type: "text" },
                        { name: "label", message: "Input label?", type: "text" },
                        { name: "id", message: "Input id?", type: "text" },
                        { name: "placeholder", message: "Input placeholder?", type: "text" },
                        { name: "required", message: "Is it required? (Y/N)", type: "confirm" },
                    ])];
            case 3:
                input = _b.sent();
                inputs.push({
                    type: input.type,
                    label: input.label,
                    id: input.id,
                    placeholder: input.placeholder,
                    required: input.required,
                    value: input.type === "select" ? [] : "",
                });
                return [4 /*yield*/, (0, prompts_1.default)([
                        {
                            name: "addMore",
                            message: "Add another input? (Y/N)",
                            type: "confirm",
                        },
                    ])];
            case 4:
                addMore = (_b.sent()).addMore;
                addInputs = addMore;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, {
                    key: key,
                    node: {
                        label: label,
                        api: api,
                        method: method,
                        category: category,
                        description: description,
                        doc: doc,
                        icon: "/images/nodes/".concat(icon),
                        inputs: inputs,
                    },
                }];
        }
    });
}); };
// Main function
var main = function () { return __awaiter(void 0, void 0, void 0, function () {
    var config, _a, key, node, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                config = readConfig();
                return [4 /*yield*/, promptUser()];
            case 1:
                _a = _b.sent(), key = _a.key, node = _a.node;
                config[key] = node;
                writeConfig(config);
                console.log("Node configuration added successfully!");
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error("Error updating node configuration:", error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
main();
