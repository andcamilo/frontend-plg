import { FieldError, FieldValues } from "react-hook-form";

interface SelectOption {
  value: string;
  label: string;
}

const SelectForm = ({
  name,
  field,
  error,
  placeholder,
  options,
}: {
  name: string;
  field: FieldValues;
  error?: FieldError;
  placeholder: string;
  options: SelectOption[];
}) => {
  return (
    <select
      id={name}
      {...field}
      value={field.value ?? ""}
      className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent hover:border-gray-300 ${
        error
          ? "border-red-300 focus:ring-red-200"
          : "border-gray-200 focus:ring-blue-200"
      }`}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default SelectForm;
