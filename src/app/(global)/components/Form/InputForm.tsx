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
  // Special handling for file inputs: do not control value and pass FileList to RHF
  if (type === "file") {
    return (
      <input
        id={name}
        type={type}
        name={field.name}
        ref={field.ref}
        onBlur={field.onBlur}
        onChange={(e) => field.onChange((e.target as HTMLInputElement).files)}
        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 placeholder-gray-400 text-gray-900 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent hover:border-gray-300 ${
          error
            ? "border-red-300 focus:ring-red-200"
            : "border-gray-200 focus:ring-blue-200"
        }`}
        placeholder={placeholder}
      />
    );
  }

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
