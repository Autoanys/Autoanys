import React from "react";
import { Handle } from "reactflow";

const OutputNode = ({ data }) => {
  return (
    <div className="node output-node">
      <Handle type="target" position="top" />
      <div className="node-header">{data.label}</div>
      <div>{data.result}</div>
      <Handle type="source" position="bottom" />
    </div>
  );
};

export default OutputNode;
