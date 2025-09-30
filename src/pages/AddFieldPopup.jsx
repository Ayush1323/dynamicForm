import { useState } from "react";
import Button from "../common/Button";
import { INPUT_TYPES } from "../utils/typesOfInput";
import CheckboxField from "../common/fields/CheckboxField";
import InputField from "../common/fields/InputField";
import CommonLabel from "../common/CommonLabel";

const generateId = () => Date.now() + Math.floor(Math.random() * 10000);

function AddFieldPopup({ isOpen, onClose, formId, onAddField }) {
  const [selectedKey, setSelectedKey] = useState("");
  const [label, setLabel] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [editableMode, setEditableMode] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [errors, setErrors] = useState({});

  const selectedOption = INPUT_TYPES.find((opt) => opt.key === selectedKey);

  const validate = () => {
    const newErrors = {};
    if (!selectedKey) newErrors.selectedKey = "Please select a field type";
    if (!label.trim()) newErrors.label = "Field label is required";

    if (
      (editableMode === "readonly" || editableMode === "disabled") &&
      (defaultValue === "" || defaultValue === null) &&
      selectedOption?.inputType !== "checkbox"
    ) {
      newErrors.defaultValue = "Default value is required.";
    }

    // email validation
    if (selectedOption?.inputType === "email" && defaultValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(defaultValue)) {
        newErrors.defaultValue = "Please enter a valid email address.";
      }
    }

    // number validation
    if (selectedOption?.inputType === "number" && defaultValue) {
      const numberRegex = /^[0-9]+$/;
      if (!numberRegex.test(defaultValue)) {
        newErrors.defaultValue = "Only digits are allowed.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const valueToSet =
      selectedOption?.inputType === "checkbox"
        ? !!defaultValue
        : defaultValue || "";

    const newField = {
      id: generateId(),
      key: label.toLowerCase().replace(/\s+/g, "_"),
      inputType: selectedOption?.inputType || "text",
      label,
      isRequired,
      editableMode,
      placeholder,
      value: valueToSet,
    };

    onAddField(formId, newField);
    onClose();

    setSelectedKey("");
    setLabel("");
    setIsRequired(false);
    setEditableMode("");
    setPlaceholder("");
    setDefaultValue("");
    setErrors({});
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="bg-white rounded-xl w-full max-w-[408px] shadow-lg p-4">
        <div className="flex justify-between items-center">
          <div className="text-center text-xl font-bold">Add Field</div>
          <div onClick={onClose} className="text-center cursor-pointer">
            ❌
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <CommonLabel label="Field Type" />
            <select
              value={selectedKey}
              onChange={(e) => {
                setSelectedKey(e.target.value);
                setErrors((prev) => ({ ...prev, selectedKey: "" }));
              }}
              className={`border rounded-md py-4 px-2 w-full focus:outline-gray-200 cursor-pointer ${
                errors.selectedKey ? "!border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select Field Type</option>
              {INPUT_TYPES?.map((opt) => (
                <option key={opt.key} value={opt.key}>
                  {opt.key}
                </option>
              ))}
            </select>
            {errors.selectedKey && (
              <p className="text-red-500 text-sm mt-1">{errors.selectedKey}</p>
            )}
          </div>

          <div className="mt-4">
            <CommonLabel label="Field Label" />
            <input
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setErrors((prev) => ({ ...prev, label: "" }));
              }}
              type="text"
              placeholder="Field Label"
              className={`border rounded-md py-3 px-3 w-full capitalize focus:outline-none ${
                errors.label ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.label && (
              <p className="text-red-500 text-sm mt-1">{errors.label}</p>
            )}
          </div>

          <label className="flex items-center gap-2 mt-4 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            Required
          </label>

          <label className="flex flex-col gap-2 mt-4">
            <span className="font-medium">Editable Mode</span>
            <select
              value={editableMode}
              onChange={(e) => {
                setEditableMode(e.target.value);
                setErrors((prev) => ({ ...prev, defaultValue: "" }));
              }}
              className="border rounded-md py-4 px-2 w-full focus:outline-gray-200 cursor-pointer border-gray-300"
            >
              <option value="">Default Mode</option>
              <option value="readonly">Read Only</option>
              <option value="disabled">Disabled</option>
            </select>
          </label>

          {(editableMode === "readonly" || editableMode === "disabled") && (
            <div className="mt-4">
              {selectedOption?.inputType === "checkbox" ? (
                <div className="flex gap-1.5">
                  <label className="font-medium">Default Value</label>
                  <CheckboxField
                    checked={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.checked)}
                  />
                </div>
              ) : (
                <>
                  <CommonLabel label="Default Value" />
                  <InputField
                    type={selectedOption?.inputType || "text"}
                    value={defaultValue}
                    onChange={(e) => setDefaultValue(e.target.value)}
                    placeholder="Enter default value"
                    className={`border rounded-md py-3 px-3 w-full focus:outline-none ${
                      errors.defaultValue
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                  />
                  {errors.defaultValue && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.defaultValue}
                    </p>
                  )}
                </>
              )}
            </div>
          )}

          <div className="mt-4">
            <label className="block font-medium mb-1">
              Placeholder (optional)
            </label>
            <InputField
              type="text"
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              placeholder="Enter placeholder"
              className="border rounded-md py-3 px-3 w-full focus:outline-none border-gray-300"
            />
          </div>

          <Button buttonLabel="Submit" type="submit" className="w-full mt-5" />
        </form>
      </div>
    </div>
  );
}

export default AddFieldPopup;
