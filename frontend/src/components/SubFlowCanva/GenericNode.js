// GenericNode.js
import React, { useState } from "react";
import { Handle, Position } from "reactflow";

const GenericNode = ({ config, isConnectable }) => {
  const [value, setValue] = useState(config.initialValue || "");

  const handleChange = (event) => {
    const newValue = event.target.value;
    setValue(newValue);
    if (config.onChange) {
      config.onChange(newValue);
    }
  };

  return (
    <div className="text-updater-node">
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
        <div className="content flex py-2">
          <img className="h-7 w-7" src={config.icon} alt={config.label} />
          {config.label}
        </div>
      </div>
      {config.inputLabel && (
        <input
          className="node-input"
          type="text"
          value={value}
          onChange={handleChange}
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          placeholder={config.inputLabel}
        />
      )}
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

export default GenericNode;
