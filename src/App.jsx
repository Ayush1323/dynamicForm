import { useRef, useState } from "react";
import "./App.css";
import Button from "./common/Button";
import Form from "./pages/Form";
import DYNAMIC_FIELDS from "./utils/constant";

const generateId = () => Date.now() + Math.floor(Math.random() * 10000);

function App() {
  const [forms, setForms] = useState([
    {
      id: generateId(),
      data: [...DYNAMIC_FIELDS.data.innerData],
      innerForms: [],
    },
  ]);
  const [collapsedFormIds, setCollapsedFormIds] = useState([]);

  const formValidators = useRef({});

  const registerFormValidator = (formId, fn) => {
    formValidators.current[formId] = fn;
  };

  const toggleCollapse = (formId) => {
    setCollapsedFormIds((prev) =>
      prev.includes(formId)
        ? prev.filter((id) => id !== formId)
        : [...prev, formId]
    );
  };

  const handleAddForm = () => {
    setForms([...forms, { id: generateId(), data: [], innerForms: [] }]);
  };

  const handleAddFieldToForm = (targetFormId, newField) => {
    const updateForms = (items) =>
      items.map((form) => {
        if (form.id === targetFormId) {
          return { ...form, data: [...form.data, newField] };
        }
        if (form.innerForms.length > 0) {
          return { ...form, innerForms: updateForms(form.innerForms) };
        }
        return form;
      });

    setForms((prev) => updateForms(prev));
  };

  const handleAddInnerForm = (parentFormId) => {
    const updateForms = (items) =>
      items.map((form) => {
        if (form.id === parentFormId) {
          return {
            ...form,
            innerForms: [
              ...form.innerForms,
              { id: generateId(), data: [], innerForms: [] },
            ],
          };
        }
        if (form.innerForms.length > 0) {
          return { ...form, innerForms: updateForms(form.innerForms) };
        }
        return form;
      });

    setForms((prev) => updateForms(prev));
  };

  const handleUpdateFieldValue = (formId, fieldId, updatedField) => {
    const updateForms = (items) =>
      items.map((form) => {
        if (form.id === formId) {
          return {
            ...form,
            data: form.data.map((f) =>
              f.id === fieldId ? { ...f, ...updatedField } : f
            ),
          };
        }
        if (form.innerForms.length > 0) {
          return { ...form, innerForms: updateForms(form.innerForms) };
        }
        return form;
      });

    setForms((prev) => updateForms(prev));
  };

  const handleSubmitAll = () => {
    const results = Object.values(formValidators.current).map((fn) => fn(true));
    const isValid = results.every((r) => r.isValid);

    if (!isValid) {
      return;
    }

    console.log(
      "Final Forms Data:",
      results.map((r) => r.data)
    );
  };

  const handleDeleteForm = (targetFormId) => {
    const updateForms = (items) =>
      items
        .filter((form) => form.id !== targetFormId)
        .map((form) => ({
          ...form,
          innerForms: updateForms(form.innerForms), 
        }));

    setForms((prev) => updateForms(prev));
  };

  return (
    <div>
      <div className="flex justify-center items-center text-4xl mt-10 text-blue-900 font-bold">
        Dynamic Form Builder
      </div>

      {forms.map((form, index) => {
        const isCollapsed = collapsedFormIds.includes(form.id);

        return (
          <div
            key={form.id}
            className="mt-10 p-9 bg-white shadow border border-black/10 rounded-2xl m-9"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Form</h2>
              <Button
                type="button"
                onClick={() => toggleCollapse(form.id)}
                className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 cursor-pointer !text-black"
                buttonLabel={isCollapsed ? "Expand All" : "Collapse All"}
              />
            </div>

            {!isCollapsed && (
              <Form
                formId={form.id}
                fields={form.data}
                innerForms={form.innerForms}
                onAddField={handleAddFieldToForm}
                onAddInnerForm={handleAddInnerForm}
                onUpdateFieldValue={handleUpdateFieldValue}
                forms={forms}
                formIndex={index + 1}
                registerFormValidator={registerFormValidator}
                onDeleteForm={handleDeleteForm}
              />
            )}
          </div>
        );
      })}

      <div className="flex p-9 justify-end items-end w-full gap-4">
        <Button buttonLabel="Add Form" onClick={handleAddForm} />
        <Button buttonLabel="Submit All" onClick={handleSubmitAll} />
      </div>
    </div>
  );
}

export default App;
