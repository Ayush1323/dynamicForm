import { useState } from "react";
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

  return (
    <div>
      <div className="flex justify-center items-center text-2xl mt-10 text-black font-bold">
        Dynamic Form
      </div>

      {forms.map((form, index) => {
        const isCollapsed = collapsedFormIds.includes(form.id);

        return (
          <div
            key={form.id}
            className="mt-10 p-9 bg-white shadow border border-black/10 rounded-2xl m-9"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Form {index + 1}</h2>
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
              />
            )}
          </div>
        );
      })}

      <div className="flex p-9 justify-end items-end w-full">
        <Button buttonLabel="Add Form" onClick={handleAddForm} />
      </div>
    </div>
  );
}

export default App;
