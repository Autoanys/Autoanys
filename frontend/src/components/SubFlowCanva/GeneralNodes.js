import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./styles.css";

const WaitSecondNode = ({ id, data, isConnectable }) => {
  const [value, setValue] = useState(data.value || "");

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    console.log("is it", newValue);
    data.onChange(id, newValue);
  };

  return (
    <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-2 shadow-md">
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
            <img className="h-7 w-7" src={"/images/nodes/stopwatch_icon.png"} />
            <span className="flex items-center justify-center pl-2">
              Wait seconds
            </span>
          </div>
          {/* if data.inputs exist and length larger than 0 then render*/}
          {data.inputs && data.inputs.length > 0 && (
            <div className="float-right flex justify-center text-xs">
              {data.inputs.length > 1 ? "Parameters" : "Parameter"}:{" "}
              {data.inputs.length}
            </div>
          )}
        </div>
      </div>
      {/* <input
        className="node-input"
        type="text"
        value={value}
        onChange={handleChange}
        onClick={(event) => event.stopPropagation()}
        onMouseDown={(event) => event.stopPropagation()}
        placeholder="How many seconds"
      /> */}
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

export { WaitSecondNode };
