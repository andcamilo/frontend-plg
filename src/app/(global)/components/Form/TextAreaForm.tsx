import { FieldError, FieldValues } from "react-hook-form";

const TextAreaForm = ({
  name,
  field,
  error,
  placeholder,
}: {
  name: string;
  field: FieldValues;
  error?: FieldError;
  placeholder: string;
}) => {
  return (
    <textarea
      id={name}
      {...field}
      value={field.value ?? ""}
      className={`w-full px-4 py-3 border border-gray-700 bg-[#1F1D2B] text-white rounded-none transition-all duration-200 placeholder-gray-400 focus:bg-[#232135] focus:outline-none focus:ring-2 focus:border-transparent hover:border-gray-500 ${
        error
          ? "border-red-500 focus:ring-red-200"
          : "border-gray-700 focus:ring-blue-200"
      }`}
      placeholder={placeholder}
      rows={4}
    />
  );
};

export default TextAreaForm;
