import React from "react";

interface ButtonProps {
  text: string;
  onClick?: () => void; // <-- devient optionnel
  type?: "primary" | "secondary"; // style
  icon?: React.ReactNode;
  htmlType?: "button" | "submit" | "reset"; // comportement natif
}

const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  type = "primary",
  icon,
  htmlType = "button", // par défaut un bouton normal
}) => {
  const baseStyle =
    "flex items-center justify-center px-4 py-2 rounded-md font-medium focus:outline-none transition-colors";

  const typeStyle =
    type === "primary"
      ? "bg-secondary text-primary hover:bg-red-600"
      : "bg-accent text-secondary border border-secondary hover:bg-gray-100";

  return (
    <button
      type={htmlType}
      className={`${baseStyle} ${typeStyle}`}
      onClick={onClick}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {text}
    </button>
  );
};

export default Button;
