import React from "react";
import { Handle } from "reactflow";

// Input Node Component
const InputNode = ({ data }) => {
  return (
    <div className="node input-node">
      <Handle type="target" position="top" />
      <div className="node-header">{data.label}</div>
      <input className="node-input" type="text" placeholder="Enter text" />
      <Handle type="source" position="bottom" />
    </div>
  );
};

export default InputNode;
