const SIZE = {
  "sm": "p-2 text-base xs:px-4",
  "md": "p-3 text-base xs:px-8",
  "lg": "p-3 text-lg xs:px-4",
}
export default function Button({
  hoverable,
  children,
  size="sm",
  className,
  variant="purple",
  border="rounded-md",
  ...rest
}) {

  const sizeStyle = SIZE[size] 
  
  const variants = {
    purple: `bg-indigo-600 text-base text-white font-medium ${hoverable && "hover:bg-indigo-700"}`,
    green: `bg-green-700 text-base text-white font-medium ${hoverable && "hover:bg-green-700"}`,
    red: `bg-red-600 text-base text-white font-medium ${hoverable && "hover:bg-indigo-700"}`,
    lightPurple: `bg-indigo-200 text-base text-indigo-800 font-medium ${hoverable && "hover:bg-indigo-700"}`,
    white: `bg-white text-base text-black font-medium ${hoverable && "hover:bg-gray-100"}`
  }

  return (
    <button
      {...rest}
      className={`${sizeStyle} disabled:opacity-50 disabled:cursor-not-allowed border-1 ${border} shadow ${className} ${variants[variant]}`}
    >
      {children}
    </button>
  );
}

