function ModalWrapper({ isOpen, title, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[20px] w-full max-w-[408px] shadow-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-bold">{title}</div>
          <button onClick={onClose} className="cursor-pointer">❌</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default ModalWrapper;
