import React from "react";
import { getBezierPath, EdgeText, MarkerType } from "reactflow";
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
  // style = { strokeWidth: 2, stroke: "#FF0072" },
  data,
  markerEnd = {
    type: MarkerType.ArrowClosed,
    width: 20,
    height: 20,
    // color: "#FF0072",
  },
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
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* <EdgeText x={labelX} y={labelY} label={data.label} /> */}

      <foreignObject
        width={100}
        height={40}
        x={labelX - 20}
        y={labelY - 20}
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

          {/* <button className="edgebutton" onClick={handleRemove}>
            ×
          </button> */}
        </div>
      </foreignObject>
    </>
  );
};

export default CustomEdge;
