import React, { useState } from "react";

const builtInVariables = [
  {
    name: "today",
    value: "today",
    description: "The current date, e.g. 2021-09-01",
  },
  {
    name: "yesterday",
    value: "yesterday",
    description: "The previous date, e.g. 2021-08-31",
  },
  {
    name: "thisweek",
    value: "thisweek",
    description: "The current week, starting from Monday",
  },
  {
    name: "thismonth",
    value: "thismonth",
    description: "The current month, e.g. 2021-09",
  },
  {
    name: "thisyear",
    value: "thisyear",
    description: "The current year, e.g. 2021",
  },
];

const GlobalVariables: React.FC = () => {
  return (
    <div className="mb-4 ">
      {builtInVariables.map((variable) => (
        <span
          title={variable.description}
          key={variable.name}
          className="ml-1 inline-flex items-center rounded border border-indigo-800 px-2 py-0.5 text-xs font-medium text-indigo-800"
        >
          <svg
            className="-ml-0.5 mr-1.5 h-2 w-2 text-indigo-400"
            fill="currentColor"
            viewBox="0 0 8 8"
          >
            <circle cx={4} cy={4} r={3} />
          </svg>
          ASS${variable.name}
        </span>
      ))}
    </div>
  );
};

export default GlobalVariables;
