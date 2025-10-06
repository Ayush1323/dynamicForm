import { useEffect, useState } from "react";
import Button from "../common/Button";
import CommonLabel from "../common/CommonLabel";
import CheckboxField from "../common/fields/CheckboxField";
import InputField from "../common/fields/InputField";
import { INPUT_TYPES } from "../utils/typesOfInput";

const generateId = () => Date.now() + Math.floor(Math.random() * 10000);

function AddFieldPopup({ isOpen, onClose, formId, fields = [], onAddField }) {
  const [selectedKey, setSelectedKey] = useState("");
  const [label, setLabel] = useState("");
  const [isRequired, setIsRequired] = useState(false);
  const [editableMode, setEditableMode] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [defaultValue, setDefaultValue] = useState("");
  const [errors, setErrors] = useState({});
  const [minNumber, setMinNumber] = useState("");
  const [maxNumber, setMaxNumber] = useState("");

  const selectedOption = INPUT_TYPES.find((opt) => opt.key === selectedKey);

  const validate = () => {
    const newErrors = {};

    if (!selectedKey) newErrors.selectedKey = "Please select a field type.";
    if (!label.trim()) newErrors.label = "Field label is required.";

    const key = label.toLowerCase().replace(/\s+/g, "_");
    if (fields.some((f) => f.key === key)) {
      newErrors.label = "A field with this label already exists.";
    }

    if (
      (editableMode === "readonly" || editableMode === "disabled") &&
      (defaultValue === "" || defaultValue === null) &&
      selectedOption?.inputType !== "checkbox"
    ) {
      newErrors.defaultValue = "Default value is required.";
    }

    if (selectedOption?.inputType === "email" && defaultValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(defaultValue)) {
        newErrors.defaultValue = "Please enter a valid email address.";
      }
    }

    if (selectedOption?.inputType === "number") {
      if (minNumber === "") {
        newErrors.minNumber = "Min value is required.";
      } else if (!/^-?\d+$/.test(minNumber)) {
        newErrors.minNumber = "Min value must be an integer.";
      }

      if (maxNumber === "") {
        newErrors.maxNumber = "Max value is required.";
      } else if (!/^-?\d+$/.test(maxNumber)) {
        newErrors.maxNumber = "Max value must be an integer.";
      }

      if (
        minNumber !== "" &&
        maxNumber !== "" &&
        /^-?\d+$/.test(minNumber) &&
        /^-?\d+$/.test(maxNumber) &&
        Number(minNumber) > Number(maxNumber)
      ) {
        newErrors.maxNumber = "Max value must be greater than Min value.";
      }

      if (defaultValue !== "") {
        if (!/^-?\d+$/.test(defaultValue)) {
          newErrors.defaultValue = "Default value must be an integer.";
        } else {
          const def = Number(defaultValue);
          if (minNumber !== "" && def < Number(minNumber)) {
            newErrors.defaultValue = `Default value cannot be less than Min (${minNumber}).`;
          }
          if (maxNumber !== "" && def > Number(maxNumber)) {
            newErrors.defaultValue = `Default value cannot be greater than Max (${maxNumber}).`;
          }
        }
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
      ...(selectedOption?.inputType === "number" && {
        min: Number(minNumber),
        max: Number(maxNumber),
      }),
    };

    onAddField(formId, newField);
    handleClose();
  };

  const resetForm = () => {
    setSelectedKey("");
    setLabel("");
    setIsRequired(false);
    setEditableMode("");
    setPlaceholder("");
    setDefaultValue("");
    setMinNumber("");
    setMaxNumber("");
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      setSelectedKey("");
      setLabel("");
      setIsRequired(false);
      setEditableMode("");
      setPlaceholder("");
      setDefaultValue("");
      setMinNumber("");
      setMaxNumber("");
      setErrors({});
    }
  }, [isOpen]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/40 transition-opacity duration-500 ${
        isOpen ? "opacity-100 visible" : "opacity-0 invisible"
      }`}
    >
      <div className="bg-white rounded-xl w-full max-w-[408px] shadow-lg p-4">
        <div className="flex justify-between items-center">
          <div className="text-center text-xl font-bold">Add Field</div>
          <div onClick={handleClose} className="text-center cursor-pointer">
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
            <InputField
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setErrors((prev) => ({ ...prev, label: "" }));
              }}
              type="text"
              placeholder="Field Label"
              className={`border rounded-md py-3 px-3 w-full capitalize ${
                errors.label
                  ? "border-red-500 focus:outline-none"
                  : "border-gray-300"
              }`}
              maxLength="20"
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
                <div className="flex gap-1.5 items-center">
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
                    type={
                      selectedOption?.inputType === "email"
                        ? "text"
                        : selectedOption?.inputType || "text"
                    }
                    value={defaultValue}
                    onChange={(e) => {
                      setDefaultValue(e.target.value);
                      setErrors((prev) => ({ ...prev, defaultValue: "" }));
                    }}
                    placeholder="Enter default value"
                    className={`border rounded-md py-3 px-3 w-full ${
                      errors.defaultValue
                        ? "border-red-500 focus:outline-none"
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

          {selectedOption?.inputType === "number" && (
            <>
              <div>
                <CommonLabel label="Min Value" />
                <InputField
                  type="number"
                  value={minNumber}
                  onChange={(e) => {
                    setMinNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, minNumber: "" }));
                  }}
                  placeholder="Min value"
                  error={errors.minNumber}
                  className="border rounded-md py-3 px-3 w-full"
                />
                {errors.minNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.minNumber}
                  </p>
                )}
              </div>
              <div className="mt-4">
                <CommonLabel label="Max Value" />
                <InputField
                  type="number"
                  value={maxNumber}
                  onChange={(e) => {
                    setMaxNumber(e.target.value);
                    setErrors((prev) => ({ ...prev, maxNumber: "" }));
                  }}
                  placeholder="Max value"
                  error={errors.maxNumber}
                  className="border rounded-md py-3 px-3 w-full"
                />
                {errors.maxNumber && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.maxNumber}
                  </p>
                )}
              </div>
            </>
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
              className="border rounded-md py-3 px-3 w-full border-gray-300"
            />
          </div>

          <Button buttonLabel="Submit" type="submit" className="w-full mt-5" />
        </form>
      </div>
    </div>
  );
}

export default AddFieldPopup;
