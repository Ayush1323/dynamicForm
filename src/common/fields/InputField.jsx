function InputField({
  type = "text",
  value,
  onChange,
  placeholder,
  editableMode,
  error,
  className,
}) {
  const handleChange = (e) => {
    let newValue = e.target.value;

    if (type === "number") {
      const regex = /^[0-9]*$/;
      if (!regex.test(newValue)) {
        return;
      }
    }

    onChange(e);
  };

  const handleKeyDown = (e) => {
    if (type === "number") {
      if (["e", "E", "+", "-", "."].includes(e.key)) {
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
      min={type === "number" ? 0 : undefined}
    />
  );
}

export default InputField;
