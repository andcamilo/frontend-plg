export const darkSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: "#1f2937", // bg-gray-800
    borderColor: state.isFocused ? "#3b82f6" : "#4b5563",
    color: "#fff",
    boxShadow: "none",
    "&:hover": {
      borderColor: "#3b82f6",
    },
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#1f2937",
    color: "#fff",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#374151" // bg-gray-700 al pasar el mouse
      : "#1f2937", // bg-gray-800 normal
    color: "#fff",
    cursor: "pointer",
  }),
  multiValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#374151", // bg-gray-700
  }),
  multiValueLabel: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
  multiValueRemove: (provided: any) => ({
    ...provided,
    color: "#fff",
    ":hover": {
      backgroundColor: "#4b5563",
    },
  }),
  input: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: "#9ca3af", // text-gray-400
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#fff",
  }),
};
