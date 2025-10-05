import { useEffect, useState } from "react";
import Button from "../common/Button";
import CommonLabel from "../common/CommonLabel";
import InputField from "../common/fields/InputField";

const EditFieldPopup = ({ field, isOpen, onClose, onUpdateField }) => {
  const [label, setLabel] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [editableMode, setEditableMode] = useState("editable");
  const [value, setValue] = useState("");
  const [min, setMin] = useState(""); 
  const [max, setMax] = useState(""); 
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (field) {
      setLabel(field.label || "");
      setPlaceholder(field.placeholder || "");
      setIsRequired(!!field.isRequired);
      setEditableMode(field.editableMode || "editable");
      setValue(field.value ?? "");
      setMin(field.min ?? "");
      setMax(field.max ?? "");
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

  const handleMinChange = (val) => {
    setMin(val);
    if (errors.min) setErrors((prev) => ({ ...prev, min: undefined }));
    if (errors.max && max !== "" && Number(val) <= Number(max)) {
      setErrors((prev) => ({ ...prev, max: undefined }));
    }
  };

  const handleMaxChange = (val) => {
    setMax(val);
    if (errors.max) setErrors((prev) => ({ ...prev, max: undefined }));
    if (errors.min && min !== "" && Number(min) <= Number(val)) {
      setErrors((prev) => ({ ...prev, min: undefined }));
    }
  };

  const handleEditableModeChange = (newMode) => {
    setEditableMode(newMode);
  };

  const handleSave = (event) => {
    event.preventDefault();
    let newErrors = {};

    if (!label.trim()) newErrors.label = "Field label cannot be empty.";

    if (
      (editableMode === "readonly" || editableMode === "disabled") &&
      !value &&
      field.inputType !== "checkbox"
    ) {
      newErrors.value = "Default value cannot be empty for readonly/disabled field.";
    }

    if (field.inputType === "email" && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) newErrors.value = "Enter a valid email address.";
    }

    if (field.inputType === "number") {
      if (value && !/^-?\d+$/.test(value)) {
        newErrors.value = "Only integer numbers are allowed.";
      }
      if (min === "") newErrors.min = "Minimum value is required.";
      if (max === "") newErrors.max = "Maximum value is required.";
      if (min !== "" && max !== "" && Number(min) > Number(max)) {
        newErrors.max = "Maximum must be greater than or equal to Minimum.";
      }
      if (value !== "" && Number(value) < Number(min)) {
        newErrors.value = `Value cannot be less than minimum (${min}).`;
      }
      if (value !== "" && Number(value) > Number(max)) {
        newErrors.value = `Value cannot be greater than maximum (${max}).`;
      }
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
      min: field.inputType === "number" ? Number(min) : undefined,
      max: field.inputType === "number" ? Number(max) : undefined,
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
              className={`w-full border rounded py-3 px-3 border-gray-300 focus:outline-gray-400 ${
                errors.value ? "border-red-500" : ""
              }`}
              rows={3}
            />
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}
          </>
        );
      case "checkbox":
        return (
          <label className="flex items-center gap-2 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleValueChange(e.target.checked)}
            />
            Checked (default)
          </label>
        );
      default:
        return (
          <>
            <InputField
              type={
                field?.inputType === "email"
                  ? "text"
                  : field?.inputType || "text"
              }
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              placeholder="Default value"
              min={field.inputType === "number" ? min : undefined}
              max={field.inputType === "number" ? max : undefined}
              className={`w-full ${errors.value ? "border-red-500" : ""}`}
            />
            {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value}</p>}

            {field.inputType === "number" && (
              <div className="flex gap-2 mt-2">
                <div className="flex flex-col w-1/2">
                  <label className="text-sm font-medium">Min Value</label>
                  <InputField
                    type="number"
                    value={min}
                    onChange={(e) => handleMinChange(e.target.value)}
                    className={`w-full ${errors.min ? "border-red-500" : ""}`}
                  />
                  {errors.min && <p className="text-red-500 text-xs mt-0.5">{errors.min}</p>}
                </div>
                <div className="flex flex-col w-1/2">
                  <label className="text-sm font-medium">Max Value</label>
                  <InputField
                    type="number"
                    value={max}
                    onChange={(e) => handleMaxChange(e.target.value)}
                    className={`w-full ${errors.max ? "border-red-500" : ""}`}
                  />
                  {errors.max && <p className="text-red-500 text-xs mt-0.5">{errors.max}</p>}
                </div>
              </div>
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
      <div className="bg-white rounded-xl w-full max-w-[408px] shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-center text-xl font-bold">Edit Field</div>
          <div onClick={onClose} className="text-center cursor-pointer">
            ❌
          </div>
        </div>

        <form onSubmit={handleSave}>
          <div className="flex flex-col gap-3">
            <div>
              <CommonLabel label="Field Label" />
              <input
                value={label}
                onChange={handleLabelChange}
                className={`w-full border rounded py-3 px-3 border-gray-300 ${
                  errors.label ? "border-red-500 focus:outline-none" : "focus:outline-gray-300"
                }`}
              />
              {errors.label && <p className="text-red-500 text-sm mt-1">{errors.label}</p>}
            </div>

            <div>
              <label className="font-medium mb-1">Placeholder</label>
              <input
                value={placeholder}
                onChange={(e) => setPlaceholder(e.target.value)}
                className="w-full border rounded py-3 px-3 border-gray-300 focus:outline-gray-300"
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <input
                type="checkbox"
                checked={isRequired}
                onChange={(e) => setIsRequired(e.target.checked)}
              />
              Required
            </label>

            <div>
              <label className="block mb-1 font-medium">Editable Mode</label>
              <select
                value={editableMode}
                onChange={(e) => handleEditableModeChange(e.target.value)}
                className="border border-gray-300 rounded-md p-2 focus:outline-gray-200 cursor-pointer w-full"
              >
                <option value="editable">Default Mode</option>
                <option value="readonly">Read Only</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div>
              {editableMode === "editable" ? (
                <label className="block mb-1 font-medium">Default Value</label>
              ) : (
                <CommonLabel label="Default Value" />
              )}
              <div>{renderValueEditor()}</div>
            </div>

            <Button buttonLabel="Save" type="submit" className="mt-2" />
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFieldPopup;
