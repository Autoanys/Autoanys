import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./styles.css";

const InputNode = ({ id, data, isConnectable }) => {
  const [value, setValue] = useState(data.value || "");
  const instance = useReactFlow();
  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    data.onChange(id, newValue);
  };

  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />

      <div className="node-header">{data.label}</div>
      <input
        className="node-input"
        type="text"
        value={value}
        onChange={handleChange}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        placeholder="Enter text"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const DefaultNode = ({ data, isConnectable }) => {
  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="node-header">{data.label}</div>
      <div>{data.description}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const OutputNode = ({ data, isConnectable }) => {
  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
      />
      <div className="node-header">{data.label}</div>
      <div>{data.result}</div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
      />
    </div>
  );
};

const CustomNode = ({ data, isConnectable }) => {
  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md dark:bg-[#2C2C3E]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          background: "black",
          width: "11px",
          height: "11px",
          borderRadius: "50%",
        }}
      />
      <div className="node-header">
        <div className="content py-2">
          <div className="flex items-center">
            <img className="h-7 w-7" src={data.icon} />
            <span className="flex items-center justify-center pl-2">
              {data.label}
            </span>
          </div>
          {/* if data.inputs exist and length larger than 0 then render*/}
          {data.inputs && data.inputs.length > 0 && (
            <div className="float-right inline flex justify-center text-xs">
              Parameters: {data.inputs?.length}
            </div>
          )}
        </div>
      </div>
      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        style={{
          background: "black",
          width: "11px",
          height: "11px",
          borderRadius: "50%",
        }}
      />
    </div>
  );
};

const IfElseNode = ({ data, isConnectable }) => {
  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md dark:bg-[#2C2C3E]">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          background: "black",
          width: "11px",
          height: "11px",
          borderRadius: "50%",
        }}
      />
      <div className="node-header">
        <div className="content py-2">
          <div className="flex items-center">
            <img className="h-7 w-7" src={data.icon} />
            <span className="flex items-center justify-center pl-2">
              {data.label}
            </span>
          </div>
          {data.inputs && data.inputs.length > 0 && (
            <div className="text-xs">Parameters: {data.inputs.length}</div>
          )}
        </div>
      </div>
      <div className="mt-2 flex justify-between">
        <div className="flex flex-col items-center">
          <div className="text-xs">IF</div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="if"
            isConnectable={isConnectable}
            style={{
              background: "black",
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              marginTop: "4px",
              transform: "translateX(-50%)",
            }}
          />
        </div>
        <div className="flex flex-col items-center">
          <div className="text-xs">Else</div>
          <Handle
            type="source"
            position={Position.Bottom}
            id="else"
            isConnectable={isConnectable}
            style={{
              background: "black",
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              marginTop: "4px",
              transform: "translateX(50%)",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export { InputNode, DefaultNode, OutputNode, CustomNode, IfElseNode };
