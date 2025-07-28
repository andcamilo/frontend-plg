import { Control, FieldError, FieldValues, Path } from "react-hook-form";
import ElementForm from "./ElementForm";
import TextAreaForm from "./TextAreaForm";

const ElementFormTextArea = <T extends FieldValues>({
  name,
  type,
  error,
  placeholder,
  control,
  label,
  defaultValue,
}: {
  name: Path<T>;
  type: string;
  error?: FieldError;
  placeholder: string;
  control: Control<T>;
  label: string;
  defaultValue?: string;
}) => {
  return (
    <ElementForm
      name={name}
      control={control}
      label={label}
      type={type}
      placeholder={placeholder}
      error={error}
      defaultValue={defaultValue || ""}
    >
      {({ field, placeholder, error }) => (
        <TextAreaForm
          name={name}
          field={field}
          error={error}
          placeholder={placeholder}
        />
      )}
    </ElementForm>
  );
};

export default ElementFormTextArea;
