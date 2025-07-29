import Button from "@/src/app/(global)/components/Button";
import ElementFormInput from "@/src/app/(global)/components/Form/ElementFormInput";
import Form from "@/src/app/(global)/components/Form/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { alertsSchema } from "../../schemas/alerts.schema";
import { AlertsSchema } from "../../schemas/alerts.schema";

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
          name="date"
          label="Fecha"
          type="date"
          placeholder="Fecha"
          control={control}
          error={errors.date}
        />
        <ElementFormInput
          name="mail"
          label="Mail"
          type="text"
          placeholder="Mail"
          control={control}
          error={errors.mail}
        />
        <Button type="submit">Guardar</Button>
      </Form>
    </>
  );
};

export default AlertForm;
