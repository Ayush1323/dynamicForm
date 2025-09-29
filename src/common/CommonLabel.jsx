function CommonLabel({ label }) {
  return (
    <div className="flex gap-1 mb-1">
      <label className="block font-medium">{label}</label>
      <span className="text-red-500">*</span>
    </div>
  );
}

export default CommonLabel;
