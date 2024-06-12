import React, { useState, useEffect } from "react";
import { Handle, Position } from "reactflow";
import "./styles.css";

const startNode = ({ data, isConnectable }) => {
  return (
    <div className="start-node">
      <div className=" p-2 pl-6 pr-6	font-bold text-white">{data.label}</div>
      {/* <div>{data.description}</div> */}
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

const endNode = ({ data, isConnectable }) => {
  return (
    <div className="end-node">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        style={{
          background: "black",
          width: "13px",
          height: "13px",
          borderRadius: "50%",
        }}
      />
      <div className=" p-2 pl-6 pr-6	font-bold text-white">{data.label}</div>
    </div>
  );
};

export { startNode, endNode };
