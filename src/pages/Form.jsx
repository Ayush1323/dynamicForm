import { useState } from "react";
import Button from "../common/Button";
import AddFieldPopup from "./AddFieldPopup";
import EditFieldPopup from "./EditFieldPopup";
import InputField from "../common/fields/InputField";
import TextAreaField from "../common/fields/TextAreaField";
import CheckboxField from "../common/fields/CheckboxField";
import FieldWrapper from "../common/fields/FieldWrapper";

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

        if (isEmpty && field.inputType !== "checkbox") {
          if (showAll || touched[field.key]) {
            newErrors[field.key] = `${field.label} is required.`;
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

    const updatedForms = forms.map((form) => {
      if (form.id === formId) {
        const updatedData = form.data.map((field) => ({
          ...field,
          value: formState[field.key],
        }));
        return { ...form, data: updatedData };
      } else if (form.innerForms && form.innerForms.length) {
        const updatedInnerForms = form.innerForms.map((inner) => {
          const updatedData = inner.data.map((field) => ({
            ...field,
            value: formState[field.key],
          }));
          return { ...inner, data: updatedData };
        });
        return { ...form, innerForms: updatedInnerForms };
      }
      return form;
    });

    console.log("Form submitted:", updatedForms);
    console.log("Final values:", formState);
  };

  const currentIndex = parentIndex
    ? `${parentIndex}.${formIndex}`
    : `${formIndex}`;

  const renderInput = (field) => {
    switch (field.inputType) {
      case "textarea":
        return (
          <>
            <TextAreaField
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
              editableMode={field.editableMode}
              error={errors[field.key]}
            />
            {errors[field.key] && (
              <span className="text-red-500 text-sm">{errors[field.key]}</span>
            )}
          </>
        );
      case "checkbox":
        return (
          <>
            <CheckboxField
              checked={formState[field.key]}
              onChange={(e) => {
                if (
                  field.editableMode !== "readonly" &&
                  field.editableMode !== "disabled"
                ) {
                  handleChange(field.key, e.target.checked);
                }
              }}
              editableMode={field.editableMode}
              error={errors[field.key]}
            />
            {errors[field.key] && (
              <span className="text-red-500 text-sm">{errors[field.key]}</span>
            )}
          </>
        );
      default:
        return (
          <>
            <InputField
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
              editableMode={field.editableMode}
              error={errors[field.key]}
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
          <div key={field.id} className="flex flex-col gap-1.5 relative group">
            <div
              className="flex items-center justify-between gap-1 cursor-pointer"
              onClick={() =>
                setEditField({
                  ...field,
                  value: formState[field.key],
                })
              }
            >
              <FieldWrapper
                label={field.label}
                isRequired={field.isRequired}
                error={errors[field.key]}
              />
              <button
                type="button"
                onClick={() =>
                  setEditField({
                    ...field,
                    value: formState[field.key],
                  })
                }
                className="ml-2 text-sm text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <img
                  src="/public/images/edit-icon.png"
                  alt="Edit Icon"
                  height={28}
                  width={28}
                />
              </button>
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
