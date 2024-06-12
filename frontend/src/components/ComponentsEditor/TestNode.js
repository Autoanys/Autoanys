import React from "react";
import { Handle, Position } from "reactflow";

//custome node
function TextNode({ data, selected }) {
  return (
    <div
      className={`w-40  rounded-md bg-white shadow-md   ${
        selected ? "border-2 border-solid border-indigo-500/100" : ""
      } `}
    >
      <div className="flex flex-col">
        <div className="max-h-max rounded-t-md bg-teal-300 px-2 py-1 text-left text-xs font-bold text-black">
          ✉️ send message
        </div>
        <div className="px-3 py-2 ">
          <div className="text-xs font-normal text-black">
            {data.label ?? "Text Node"}
          </div>
        </div>
      </div>

      <Handle
        id="a"
        type="target"
        position={Position.Left}
        className="w-1 rounded-full bg-slate-500"
      />
      <Handle
        id="b"
        type="source"
        position={Position.Right}
        className="bg-gray-500 w-1 rounded-full"
      />
    </div>
  );
}

export default TextNode;
