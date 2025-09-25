function Button({ buttonLabel, type = "button", className = "",onClick }) {
  return (
    <button
      type={type}
      className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${className} cursor-pointer`}
      onClick={onClick}
    >
      {buttonLabel}
    </button>
  );
}

export default Button;
