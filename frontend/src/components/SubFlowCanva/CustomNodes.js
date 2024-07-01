import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./styles.css";

const CustomNode = ({ data, isConnectable }) => {
  return (
    <div className="relative">
      <div className="rounded-md border-2 border-stone-400 bg-white px-4 py-1 shadow-md dark:bg-[#2C2C3E]">
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
              <img className="h-7 w-7" src={data.icon} alt="icon" />
              <span className="flex items-center justify-center pl-2">
                {data.label}
              </span>
            </div>
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
      {/* <p>{data.showDescription}</p> */}
      {data.showDescription && (
        <p className="absolute left-full top-0 ml-4 w-40">{data.description}</p>
      )}
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

export { CustomNode, IfElseNode };
