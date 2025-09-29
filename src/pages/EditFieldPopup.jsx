import { useState, useEffect } from "react";
import Button from "../common/Button";

const EditFieldPopup = ({ field, isOpen, onClose, onUpdateField }) => {
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [editableMode, setEditableMode] = useState("editable");
  const [value, setValue] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (field) {
      setLabel(field.label || "");
      setPlaceholder(field.placeholder || "");
      setIsRequired(!!field.isRequired);
      setEditableMode(field.editableMode || "editable");
      setValue(field.value ?? "");
      setErrors({});
    }
  }, [field]);

  if (!field) return null;

  const handleLabelChange = (e) => {
    setLabel(e.target.value);
    if (errors.label && e.target.value.trim()) {
      setErrors((prev) => ({ ...prev, label: undefined }));
    }
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
    if (errors.value && newValue) {
      setErrors((prev) => ({ ...prev, value: undefined }));
    }
  };

  const handleEditableModeChange = (newMode) => {
    setEditableMode(newMode);
    if (errors.value && newMode === "editable") {
      setErrors((prev) => ({ ...prev, value: undefined }));
    }
  };

  const handleSave = () => {
    let newErrors = {};

    if (
      (editableMode === "readonly" || editableMode === "disabled") &&
      !value
    ) {
      newErrors.value = "Default value is required.";
    }

    if (!label.trim()) {
      newErrors.label = "Label is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdateField({
      ...field,
      label,
      placeholder,
      isRequired,
      editableMode,
      value,
    });

    onClose();
  };

  const renderValueEditor = () => {
    switch (field.inputType) {
      case "textarea":
        return (
          <>
            <textarea
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className={`w-full border rounded p-2 border-gray-300 focus:outline-gray-400 ${
                errors.value ? "border-red-500" : ""
              }`}
              rows={3}
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value}</p>
            )}
          </>
        );
      case "checkbox":
        return (
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleValueChange(e.target.checked)}
            />
            Checked (default)
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value}</p>
            )}
          </label>
        );
      case "range":
        return (
          <>
            <input
              type="number"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className={`w-full border rounded p-2 border-gray-300 focus:outline-gray-400 ${
                errors.value ? "border-red-500" : ""
              }`}
              placeholder="Default range value"
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value}</p>
            )}
          </>
        );
      case "date":
        return (
          <>
            <input
              type="date"
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className={`w-full border rounded p-2 border-gray-300 focus:outline-gray-400 ${
                errors.value ? "border-red-500" : ""
              }`}
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value}</p>
            )}
          </>
        );
      default:
        return (
          <>
            <input
              type={field.inputType || "text"}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className={`w-full border rounded p-2 border-gray-300 focus:outline-gray-400 ${
                errors.value ? "border-red-500" : ""
              }`}
              placeholder="Default value"
              min={field.inputType === "number" ? 0 : undefined}
            />
            {errors.value && (
              <p className="text-red-500 text-sm mt-1">{errors.value}</p>
            )}
          </>
        );
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="bg-white rounded-[20px] w-full max-w-[408px] shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center text-xl font-bold">Edit Field</div>
          <div onClick={onClose} className="text-center cursor-pointer">
            ❌
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label>
            Label
            <input
              value={label}
              onChange={handleLabelChange}
              className={`w-full border rounded p-2 border-gray-300 focus:outline-gray-400 ${
                errors.label ? "border-red-500" : ""
              }`}
            />
            {errors.label && (
              <p className="text-red-500 text-sm mt-1">{errors.label}</p>
            )}
          </label>

          <label>
            Placeholder
            <input
              value={placeholder}
              onChange={(e) => setPlaceholder(e.target.value)}
              className="w-full border rounded p-2 border-gray-300 focus:outline-gray-400"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRequired}
              onChange={(e) => setIsRequired(e.target.checked)}
            />
            Required
          </label>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editableMode === "readonly"}
                onChange={(e) =>
                  handleEditableModeChange(
                    e.target.checked ? "readonly" : "editable"
                  )
                }
              />
              Read Only
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={editableMode === "disabled"}
                onChange={(e) =>
                  handleEditableModeChange(
                    e.target.checked ? "disabled" : "editable"
                  )
                }
              />
              Disabled
            </label>
          </div>

          <div>
            <label className="block mb-1">Default Value</label>
            {renderValueEditor()}
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded cursor-pointer"
            >
              Cancel
            </button>
            <Button buttonLabel="Save" onClick={handleSave} className="px-6" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFieldPopup;
