function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  editableMode,
  error,
  className,
  min,
  max,
}) {
  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === "number") {
      const regex = /^-?\d*$/;
      if (!regex.test(newValue)) {
        return;
      }

      if (newValue !== "" && min !== undefined && Number(newValue) < min) return;
      if (newValue !== "" && max !== undefined && Number(newValue) > max) return;
    }

    onChange(e);
  };

  const handleKeyDown = (e) => {
    if (type === "number") {
      if (["e", "E", "+", "."].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "-" && e.target.selectionStart !== 0) {
        e.preventDefault();
      }
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      readOnly={editableMode === "readonly"}
      disabled={editableMode === "disabled"}
      min={type === "number" && min !== undefined ? min : undefined}
      max={type === "number" && max !== undefined ? max : undefined}
      className={`border border-gray-300 rounded-md p-2
        ${className}
        ${
          editableMode === "disabled" || editableMode === "readonly"
            ? "bg-gray-100 cursor-not-allowed"
            : ""
        }
        ${
          error ? "border-red-500 focus:outline-none" : "focus:outline-gray-300"
        } `}
    />
  );
}

export default InputField;
