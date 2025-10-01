import { useEffect, useState } from "react";
import Button from "../common/Button";
import CheckboxField from "../common/fields/CheckboxField";
import FieldWrapper from "../common/fields/FieldWrapper";
import InputField from "../common/fields/InputField";
import TextAreaField from "../common/fields/TextAreaField";
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
  registerFormValidator,
  onDeleteForm,
  onDeleteField,
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

  const handleEditField = (field) => {
    setErrors((prev) => ({ ...prev, [field.key]: "" }));

    setEditField({
      ...field,
      value: formState[field.key],
    });
  };

  const validateAndCollect = (showAll = false) => {
    let newErrors = {};

    fields.forEach((field) => {
      const value = formState[field.key];

      if (field.isRequired) {
        const isEmpty =
          value === "" ||
          value === null ||
          value === undefined ||
          (field.inputType === "checkbox" && !value);

        if (isEmpty && field.inputType !== "checkbox") {
          if (showAll || touched[field.key]) {
            newErrors[field.key] = "This is a required field.";
          }
        }
      }

      if (field.inputType === "email" && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          if (showAll || touched[field.key]) {
            newErrors[field.key] = "Please enter a valid email address.";
          }
        }
      }
    });

    setErrors(newErrors);

    const innerResults = innerForms.map((inner) =>
      inner.validator
        ? inner.validator(showAll)
        : { isValid: true, data: inner }
    );

    return {
      isValid:
        Object.keys(newErrors).length === 0 &&
        innerResults.every((r) => r.isValid),
      data: {
        id: formId,
        data: fields.map((field) => ({
          ...field,
          value: formState[field.key],
        })),
        innerForms: innerResults.map((r) => r.data),
      },
    };
  };

  useEffect(() => {
    if (registerFormValidator) {
      registerFormValidator(formId, validateAndCollect);
    }
  }, [formState, fields, innerForms]);

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
              min={field.inputType === "number" ? field.min : undefined}
              max={field.inputType === "number" ? field.max : undefined}
            />
            {errors[field.key] && (
              <span className="text-red-500 text-sm">{errors[field.key]}</span>
            )}
          </>
        );
    }
  };

  const onEscape = (event) => {
    if (event.key === "Escape") {
      if (showAddFieldPopup) {
        setShowAddFieldPopup(false);
      }
      if (editField) {
        setEditField(null);
      }
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("keydown", onEscape);
    };
  }, [showAddFieldPopup, editField]);

  return (
    <div className="border border-gray-200 p-4 rounded-lg">
      <div className="flex justify-between items-center w-full">
        <h2 className="col-span-4 font-semibold text-lg mb-2">
          Form {currentIndex}
        </h2>
        <div
          className="cursor-pointer h-10 w-10 flex items-center justify-center rounded-full bg-blue-900 hover:opacity-70"
          onClick={() => onDeleteForm(formId)}
        >
          <img
            src="/images/delete-icon.png"
            alt="icon-delete"
            height={24}
            width={24}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-4 mt-5 p-4 rounded-lg">
        {fields.map((field) => (
          <div key={field.id} className="flex flex-col gap-0.5 relative group">
            <div className="flex items-center justify-between gap-1">
              <FieldWrapper
                label={field.label}
                isRequired={field.isRequired}
                error={errors[field.key]}
              />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditField(field);
                  }}
                  className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:opacity-70 bg-blue-900"
                >
                  <img
                    src="/images/pencil.png"
                    alt="Edit Icon"
                    height={14}
                    width={14}
                  />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteField(formId, field.id);
                    setFormState((prev) => {
                      const newState = { ...prev };
                      delete newState[field.key];
                      return newState;
                    });
                    setErrors((prev) => {
                      const newErr = { ...prev };
                      delete newErr[field.key];
                      return newErr;
                    });
                    setTouched((prev) => {
                      const newTouched = { ...prev };
                      delete newTouched[field.key];
                      return newTouched;
                    });
                  }}
                  className="cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:opacity-70 bg-blue-900"
                >
                  <img
                    src="/images/delete-icon.png"
                    alt="delete-icon"
                    height={16}
                    width={16}
                  />
                </button>
              </div>
            </div>

            {renderInput(field)}
          </div>
        ))}

        <div className="col-span-4 flex items-center gap-2 justify-end">
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
      </div>

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
            onDeleteForm={onDeleteForm}
            onDeleteField={onDeleteField}
            parentIndex={currentIndex}
            registerFormValidator={(id, fn) => (inner.validator = fn)}
          />
        </div>
      ))}

      <AddFieldPopup
        isOpen={showAddFieldPopup}
        onClose={() => setShowAddFieldPopup(false)}
        formId={formId}
        fields={fields}
        onAddField={(fid, newField) => {
          if (fields.some((f) => f.key === newField.key)) {
            return;
          }

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
    </div>
  );
}

export default Form;