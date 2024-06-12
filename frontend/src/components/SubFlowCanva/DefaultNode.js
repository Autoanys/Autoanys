import React from "react";
import { Handle } from "reactflow";

// Default Node Component
const DefaultNode = ({ data }) => {
  return (
    <div className="node default-node">
      <Handle type="target" position="top" />
      <div className="node-header">{data.label}</div>
      <div>{data.description}</div>
      <Handle type="source" position="bottom" />
    </div>
  );
};
