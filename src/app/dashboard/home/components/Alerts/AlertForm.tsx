import Button from "@/src/app/(global)/components/Button";
import ElementFormInput from "@/src/app/(global)/components/Form/ElementFormInput";
import ElementFormSelect from "@/src/app/(global)/components/Form/ElementFormSelect";
import Form from "@/src/app/(global)/components/Form/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  alertsInputSchema,
  reminderUnits,
  reminderUnitLabels,
} from "../../schemas/alerts.schema";
import { AlertsSchema, AlertsInputSchema } from "../../schemas/alerts.schema";
import ButtonDeleteAlert from "./ButtonDeleteAlert";

const AlertForm = ({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: AlertsSchema) => void;
  defaultValues?: AlertsSchema;
}) => {
  const formDefaultValues: AlertsInputSchema | undefined = defaultValues
    ? {
        reminderValue: defaultValues.reminderValue.toString(),
        reminderUnit: defaultValues.reminderUnit,
        id: defaultValues.id,
      }
    : undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AlertsInputSchema>({
    defaultValues: formDefaultValues,
    resolver: zodResolver(alertsInputSchema),
  });

  const handleFormSubmit = (formData: AlertsInputSchema) => {
    const processedData: AlertsSchema = {
      reminderValue: parseInt(formData.reminderValue),
      reminderUnit: formData.reminderUnit,
      id: formData.id,
    };
    onSubmit(processedData);
  };

  const reminderUnitOptions = reminderUnits.map((unit) => ({
    value: unit,
    label: reminderUnitLabels[unit],
  }));

  return (
    <>
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ElementFormInput
            name="reminderValue"
            label="Valor de recordatorio"
            type="number"
            placeholder="Ej: 2"
            control={control}
            error={errors.reminderValue}
          />
          <ElementFormSelect
            name="reminderUnit"
            label="Unidad de tiempo"
            placeholder="Seleccione una unidad"
            control={control}
            error={errors.reminderUnit}
            options={reminderUnitOptions}
          />
        </div>

        <div className="flex justify-start items-center gap-4">
          <Button type="submit">Guardar</Button>
          {defaultValues?.id && (
            <ButtonDeleteAlert alertId={defaultValues.id} />
          )}
        </div>
      </Form>
    </>
  );
};

export default AlertForm;
