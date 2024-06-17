import React from "react";
import { getBezierPath } from "reactflow";
import "reactflow/dist/style.css";

const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected = false,
  style = { strokeWidth: 2, stroke: "#FF0072" },
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleRemove = (event) => {
    console.log("remove edge", id);
    console.log("TESTTEST", data);
    console.log("event", event);
    event.stopPropagation();
    data.onRemove(id);
  };

  return (
    <>
      <svg>
        <defs>
          <marker
            id="downArrow"
            markerWidth="10"
            markerHeight="10"
            refX="5"
            refY="2"
            orient="-180deg"
            markerUnits="strokeWidth"
          >
            <polygon points="5,0 10,10 0,10" fill="#FF0072" />
          </marker>
        </defs>
      </svg>

      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd="url(#downArrow)"
      />

      <foreignObject
        width={100}
        height={40}
        x={labelX - 20}
        y={labelY - 30}
        className="edgebutton-foreignobject"
        requiredExtensions="http://www.w3.org/1999/xhtml"
      >
        <div>
          <button
            className={`edgebutton z-50 ${selected ? "" : "hidden"}`}
            onClick={handleRemove}
          >
            ×
          </button>
        </div>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
