import React, { useState, useEffect } from "react";

interface CustomVariablesProps {
  customVariables: { id: number; key: string };
  onChangeValue: (newValue: string) => void;
  onDelete: () => void;
}

const CustomVariables: React.FC<CustomVariablesProps> = ({
  customVariables,
  onChangeValue,
  onDelete,
}) => {
  const [inputValue, setInputValue] = useState(customVariables.key);

  useEffect(() => {
    setInputValue(customVariables.key);
  }, [customVariables.key]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChangeValue(newValue);
  };

  return (
    <div className="mb-4">
      <p className="text-gray-800 text-md mb-2 font-semibold">
        Custom Variable {customVariables.id}:
      </p>

      <div className="flex items-center">
        <span className="text-gray-700 mr-2 text-sm font-semibold">CAAS$</span>
        <input
          id={customVariables.id.toString()}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="text-gray-800 flex-1 rounded-md border p-2 text-sm"
          placeholder="Enter a custom variable name"
        />
        <button
          onClick={onDelete}
          className="text-red-500 hover:text-red-700 ml-2"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default CustomVariables;
