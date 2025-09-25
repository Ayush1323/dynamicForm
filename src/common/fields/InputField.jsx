import React from "react";

function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  editableMode,
  error,
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={editableMode === "readonly"}
      disabled={editableMode === "disabled"}
      className={`border border-gray-300 rounded-md p-2 focus:outline-gray-400
        ${
          editableMode == "disabled" || editableMode == "readonly"
            ? "bg-gray-100 cursor-not-allowed"
            : ""
        }
        ${error ? "border-red-500" : ""}`}
      min={type === "number" ? 0 : undefined}
    />
  );
}

export default InputField;
