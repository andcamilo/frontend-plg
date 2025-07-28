import React from "react";

interface ButtonProps {
  children?: React.ReactNode;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "secondary";
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

const Button = ({
  children,
  type = "button",
  variant = "primary",
  disabled = false,
  onClick,
  className = "",
}: ButtonProps) => {
  const baseClasses =
    "px-4 py-3 font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
  };

  const finalClassName = `${baseClasses} ${variantClasses[variant]} ${className}`;

  return (
    <button
      type={type}
      className={finalClassName}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
