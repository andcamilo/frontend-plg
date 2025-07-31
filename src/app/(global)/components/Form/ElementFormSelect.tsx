import { Control, FieldError, FieldValues, Path } from "react-hook-form";
import ElementForm from "./ElementForm";
import SelectForm from "./SelectForm";

interface SelectOption {
  value: string;
  label: string;
}

const ElementFormSelect = <T extends FieldValues>({
  name,
  error,
  placeholder,
  control,
  label,
  defaultValue,
  options,
}: {
  name: Path<T>;
  error?: FieldError;
  placeholder: string;
  control: Control<T>;
  label: string;
  defaultValue?: string;
  options: SelectOption[];
}) => {
  return (
    <ElementForm
      name={name}
      control={control}
      label={label}
      type="select"
      placeholder={placeholder}
      error={error}
      defaultValue={defaultValue || ""}
    >
      {({ field, placeholder, error }) => (
        <SelectForm
          name={name}
          field={field}
          error={error}
          placeholder={placeholder}
          options={options}
        />
      )}
    </ElementForm>
  );
};

export default ElementFormSelect;
