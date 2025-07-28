import { FieldError, FieldValues } from "react-hook-form";

const InputForm = ({
  name,
  type,
  field,
  error,
  placeholder,
}: {
  name: string;
  type: string;
  field: FieldValues;
  error?: FieldError;
  placeholder: string;
}) => {
  return (
    <input
      id={name}
      type={type}
      {...field}
      value={field.value ?? ""}
      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent hover:border-gray-300 ${
        error
          ? "border-red-300 focus:ring-red-200"
          : "border-gray-200 focus:ring-blue-200"
      }`}
      placeholder={placeholder}
    />
  );
};

export default InputForm;
