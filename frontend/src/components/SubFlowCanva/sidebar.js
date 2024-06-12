import React from "react";

export default function Sidebar({
  nodeName,
  setNodeName,
  selectedNode,
  setSelectedElements,
}) {
  const handleInputChange = (event) => {
    setNodeName(event.target.value);
  };
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData("application/reactflow", nodeType);
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside className="h-screen w-64 border-r-2 border-blue-200 bg-blue-100 p-4 text-sm text-black">
      {selectedNode ? (
        //settings panel
        <div>
          <h3 className="mb-2 text-xl text-blue-900">Update Node</h3>
          <label className="mb-2 block text-sm font-medium text-blue-900">
            Node Name:
          </label>
          <input
            type="text"
            className="text-gray-700 block w-full rounded-lg border border-blue-300 bg-white px-3 pb-3 pt-2 focus:border-blue-500 focus:outline-none"
            value={nodeName}
            onChange={handleInputChange}
          />
          <button
            className="mt-4 rounded bg-blue-500 p-2 text-white hover:bg-blue-600"
            onClick={() => setSelectedElements([])}
          >
            Go Back
          </button>
        </div>
      ) : (
        //node panel
        <>
          <h3 className="mb-4 text-xl text-blue-900">Nodes Panel</h3>
          <div
            className="flex cursor-move items-center justify-center rounded border-2 border-blue-500 bg-white p-3 text-blue-500 transition-colors duration-200 hover:bg-blue-500 hover:text-white"
            onDragStart={(event) => onDragStart(event, "textnode")}
            draggable
          >
            Message Node
          </div>
        </>
      )}
    </aside>
  );
}
