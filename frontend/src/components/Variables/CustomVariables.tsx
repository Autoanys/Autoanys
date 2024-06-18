import React, { useState, useEffect } from "react";

interface CustomVariablesProps {
  customVariables: any;
  onChangeValue: (newValue: string) => void;
}

const CustomVariables: React.FC<CustomVariablesProps> = ({
  customVariables,
  onChangeValue,
}) => {
  const [inputValue, setInputValue] = useState(customVariables.key);

  useEffect(() => {
    setInputValue(customVariables.key);
  }, [customVariables]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChangeValue(newValue);
  };

  return (
    <div className="mb-4">
      <p>{JSON.stringify(customVariables)}</p>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        className="border p-2"
      />
    </div>
  );
};

export default CustomVariables;
