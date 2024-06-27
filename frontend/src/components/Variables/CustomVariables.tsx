import React, { useState, useEffect, use } from "react";

interface CustomVariablesProps {
  customVariables: { id: number; key: string; value: string };
  onChangeValue: (newValue: string) => void;
  onChangeValueValue: (newValueValue: string) => void;
  onDelete: () => void;
}

const CustomVariables: React.FC<CustomVariablesProps> = ({
  customVariables,
  onChangeValue,
  onChangeValueValue,
  onDelete,
}) => {
  const [inputValue, setInputValue] = useState(customVariables.key);
  const [inputValueValue, setInputValueValue] = useState(customVariables.value);

  useEffect(() => {
    setInputValue(customVariables.key);
  }, [customVariables.key]);

  useEffect(() => {
    setInputValueValue(customVariables.value);
  }, [customVariables.value]);

  const validateInput = (value: string) => {
    const regex = /^[a-zA-Z0-9]*$/;
    return regex.test(value);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    if (validateInput(newValue)) {
      setInputValue("CAAS$" + newValue);
      onChangeValue("CAAS$" + newValue);
    }
  };

  const handleInputValueChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const newValue = event.target.value;

    setInputValueValue(newValue);
    onChangeValueValue(newValue);
  };

  return (
    <div className="mb-4">
      <p className="text-gray-800 text-md mb-2 font-semibold">
        Custom Variable {customVariables.id}:{" "}
        <span className="text-sm font-normal">
          (No special characters allowed)
        </span>
      </p>

      <div className="flex items-center">
        <span className="text-gray-700 mr-2 text-sm font-semibold">CAAS$</span>
        <input
          id={customVariables.id.toString()}
          type="text"
          value={inputValue.substring("CAAS$".length)}
          onChange={handleInputChange}
          className="text-gray-800 flex-1 rounded-md border p-2 text-sm"
          placeholder="Enter a custom variable name"
        />

        <span className="text-gray-700 ml-2 mr-2 text-sm font-semibold">
          Value
        </span>
        <input
          id={customVariables.id.toString() + customVariables.key.toString()}
          type="text"
          value={inputValueValue}
          onChange={handleInputValueChange}
          className="text-gray-800 flex-1 rounded-md border p-2 text-sm"
          placeholder="Default value for the custom variable, leave empty for none"
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
