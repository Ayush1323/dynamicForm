function FieldWrapper({ label, isRequired, children }) {
  return (
    <div className="flex gap-1.5 justify-between">
      <label className="flex items-center gap-1">
        {label}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      {children}
      {/* {error && <span className="text-red-500 text-sm">{error}</span>} */}
    </div>
  );
}

export default FieldWrapper;
