import { useState } from "react";
import Button from "../common/Button";
import AddFieldPopup from "./AddFieldPopup";
import EditFieldPopup from "./EditFieldPopup";

function Form({
  formId,
  fields,
  innerForms = [],
  onAddField,
  onAddInnerForm,
  onUpdateFieldValue,
  forms,
  formIndex,
  parentIndex = "",
}) {
  const [formState, setFormState] = useState(
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        f.inputType === "checkbox" ? !!f.value : f.value || "",
      ])
    )
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showAddFieldPopup, setShowAddFieldPopup] = useState(false);
  const [editField, setEditField] = useState(null);

  const handleChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    onUpdateFieldValue(formId, key, { value });
    setErrors((prev) => ({ ...prev, [key]: "" }));
    setTouched((prev) => ({ ...prev, [key]: true }));
  };

  const validateFields = (showAll = false) => {
    let newErrors = {};
    fields.forEach((field) => {
      if (field.isRequired) {
        const isEmpty =
          formState[field.key] === "" ||
          formState[field.key] === null ||
          formState[field.key] === undefined ||
          (field.inputType === "checkbox" && !formState[field.key]);

        if (isEmpty) {
          if (showAll || touched[field.key]) {
            newErrors[field.key] = `${field.label} is required`;
          }
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateFields(true)) return;
    console.log("Form submitted:", forms);
    console.log("Final values:", formState);
  };

  const currentIndex = parentIndex
    ? `${parentIndex}.${formIndex}`
    : `${formIndex}`;

  const renderInput = (field) => {
    const errorClass = errors[field.key] ? "border-red-500" : "";
    switch (field.inputType) {
      case "textarea":
        return (
          <>
            <textarea
              value={formState[field.key]}
              onChange={(e) => {
                if (
                  field.editableMode !== "readonly" &&
                  field.editableMode !== "disabled"
                ) {
                  handleChange(field.key, e.target.value);
                }
              }}
              className={`border border-gray-300 rounded-md p-2 focus:outline-gray-400 ${errorClass}`}
              readOnly={field.editableMode === "readonly"}
              disabled={field.editableMode === "disabled"}
            />
            {errors[field.key] && (
              <span className="text-red-500 text-sm">{errors[field.key]}</span>
            )}
          </>
        );
      case "checkbox":
        return (
          <>
            <input
              type="checkbox"
              checked={!!formState[field.key]}
              onChange={(e) => {
                if (
                  field.editableMode !== "readonly" &&
                  field.editableMode !== "disabled"
                ) {
                  handleChange(field.key, e.target.checked);
                }
              }}
              readOnly={field.editableMode === "readonly"}
              disabled={field.editableMode === "disabled"}
              className={`border w-5 h-5 border-gray-300 rounded-md ${
                field.editableMode === "disabled" ||
                field.editableMode === "readonly"
                  ? "bg-gray-100 cursor-not-allowed"
                  : ""
              } ${errorClass}`}
            />
            {errors[field.key] && (
              <span className="text-red-500 text-sm">{errors[field.key]}</span>
            )}
          </>
        );
      default:
        return (
          <>
            <input
              type={field.inputType}
              value={formState[field.key]}
              onChange={(e) => {
                if (
                  field.editableMode !== "readonly" &&
                  field.editableMode !== "disabled"
                ) {
                  handleChange(field.key, e.target.value);
                }
              }}
              placeholder={field.placeholder || ""}
              readOnly={field.editableMode === "readonly"}
              disabled={field.editableMode === "disabled"}
              className={`border border-gray-300 rounded-md p-2 focus:outline-gray-400 ${
                field.editableMode === "disabled" ||
                field.editableMode === "readonly"
                  ? "bg-gray-100 cursor-not-allowed focus:outline-none"
                  : ""
              } ${errorClass}`}
            />
            {errors[field.key] && (
              <span className="text-red-500 text-sm">{errors[field.key]}</span>
            )}
          </>
        );
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-4 gap-4 border border-gray-300 p-4 rounded-lg mb-6"
      >
        <h2 className="col-span-4 font-semibold text-lg mb-2">
          Form {currentIndex}
        </h2>

        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-1.5">
            <div
              className="flex items-center gap-1 cursor-pointer"
              onClick={() =>
                setEditField({
                  ...field,
                  value: formState[field.key],
                })
              }
            >
              <label htmlFor={field.key}>{field.label}</label>
              {field.isRequired && <span className="text-red-500">*</span>}
            </div>

            {renderInput(field)}
          </div>
        ))}

        <div className="col-span-4 flex items-center gap-2 justify-end">
          <Button type="submit" buttonLabel="Submit" />
          <Button
            buttonLabel="Add Field"
            onClick={() => setShowAddFieldPopup(true)}
          />
          <Button
            type="button"
            buttonLabel="Add Inner Form"
            onClick={() => onAddInnerForm(formId)}
          />
        </div>
      </form>

      {innerForms.map((inner, index) => (
        <div
          key={inner.id}
          className="ml-6 mt-6 p-6 bg-gray-50 border border-gray-300 rounded-lg"
        >
          <Form
            formId={inner.id}
            fields={inner.data}
            innerForms={inner.innerForms}
            onAddField={onAddField}
            onAddInnerForm={onAddInnerForm}
            onUpdateFieldValue={onUpdateFieldValue}
            forms={forms}
            formIndex={index + 1}
            parentIndex={currentIndex}
          />
        </div>
      ))}

      <AddFieldPopup
        isOpen={showAddFieldPopup}
        onClose={() => setShowAddFieldPopup(false)}
        formId={formId}
        onAddField={(fid, newField) => {
          setFormState((prev) => ({
            ...prev,
            [newField.key]:
              newField.inputType === "checkbox"
                ? !!newField.value
                : newField.value || "",
          }));
          setTouched((prev) => ({ ...prev, [newField.key]: false }));
          onAddField(fid, newField);
        }}
      />

      <EditFieldPopup
        isOpen={!!editField}
        onClose={() => setEditField(null)}
        field={editField}
        onUpdateField={(updatedField) => {
          onUpdateFieldValue(formId, updatedField.id, updatedField);
          setFormState((prev) => ({
            ...prev,
            [updatedField.key]: updatedField.value,
          }));
          setEditField(null);
        }}
      />
    </>
  );
}

export default Form;
