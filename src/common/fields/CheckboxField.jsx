function CheckboxField({ checked, onChange, editableMode, error }) {
  return (
    <input
      type="checkbox"
      checked={!!checked}
      onChange={onChange}
      readOnly={editableMode === "readonly"}
      disabled={editableMode === "disabled"}
      className={`border w-5 h-5 border-gray-300 rounded-md 
        ${
          editableMode == "disabled" || editableMode == "readonly"
            ? "bg-gray-100 cursor-not-allowed"
            : ""
        } 
        ${error ? "border-red-500" : ""}`}
    />
  );
}

export default CheckboxField;
