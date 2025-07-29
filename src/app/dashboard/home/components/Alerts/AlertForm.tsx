import Button from "@/src/app/(global)/components/Button";
import ElementFormInput from "@/src/app/(global)/components/Form/ElementFormInput";
import Form from "@/src/app/(global)/components/Form/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { alertsSchema } from "../../schemas/alerts.schema";
import { AlertsSchema } from "../../schemas/alerts.schema";
import ButtonDeleteAlert from "./ButtonDeleteAlert";

const AlertForm = ({
  onSubmit,
  defaultValues,
}: {
  onSubmit: (data: AlertsSchema) => void;
  defaultValues?: AlertsSchema;
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<AlertsSchema>({
    defaultValues,
    resolver: zodResolver(alertsSchema),
  });
  return (
    <>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <ElementFormInput
          name="reminderDays"
          label="Días de recordatorio"
          type="number"
          placeholder="Días de recordatorio"
          control={control}
          error={errors.reminderDays}
        />
        <div className="flex justify-start items-center gap-4">
          <Button type="submit">Guardar</Button>
          {defaultValues && <ButtonDeleteAlert alertId={defaultValues.id} />}
        </div>
      </Form>
    </>
  );
};

export default AlertForm;
