function Button({ buttonLabel, type = "button", className = "",onClick }) {
  return (
    <button
      type={type}
      className={`bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded ${className} cursor-pointer transition-colors duration-300`}
      onClick={onClick}
    >
      {buttonLabel}
    </button>
  );
}

export default Button;
