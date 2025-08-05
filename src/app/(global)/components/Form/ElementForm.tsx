import React from "react";
import {
  FieldError,
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
  ControllerRenderProps,
} from "react-hook-form";
import ErrorForm from "./ErrorForm";
import LabelForm from "./LabelForm";

const ElementForm = <T extends FieldValues>({
  name,
  control,
  label,
  type,
  placeholder,
  error,
  defaultValue = "",
  children,
}: {
  name: Path<T>;
  control: Control<T>;
  label: string;
  type: string;
  placeholder: string;
  error?: FieldError;
  defaultValue?: string;
  children: (params: {
    field: ControllerRenderProps<T, Path<T>>;
    type: string;
    placeholder: string;
    error?: FieldError;
  }) => React.ReactNode;
}) => {
  return (
    <div className="space-y-2">
      <LabelForm text={label} name={name} />
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue as PathValue<T, Path<T>>}
        render={({ field }) => {
          return children({
            field,
            type,
            placeholder,
            error,
          }) as React.ReactElement;
        }}
      />
      {error && <ErrorForm error={error.message || "Error inesperado"} />}
    </div>
  );
};
export default ElementForm;
