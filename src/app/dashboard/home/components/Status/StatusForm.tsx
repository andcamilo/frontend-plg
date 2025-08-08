import Button from "@/src/app/(global)/components/Button";
import ElementFormInput from "@/src/app/(global)/components/Form/ElementFormInput";
import ElementFormSelect from "@/src/app/(global)/components/Form/ElementFormSelect";
import ElementFormTextArea from "@/src/app/(global)/components/Form/ElementFormTextArea";
import Form from "@/src/app/(global)/components/Form/Form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import {
  SolicitudStatusUpdateForm,
  SolicitudStatusUpdate,
  Solicitud,
} from "../../types/solicitud.types";
import { SolicitudStatusUpdateSchema } from "../../schemas/solicitud.schema";
import { uploadFile } from "@/src/app/utils/firebase-upload";
import { STATUS_MAPPING } from "../../constants/status-mapping.constant";

const StatusForm = ({
  onSubmit,
  defaultValues,
  isSubmitting,
}: {
  onSubmit: (data: SolicitudStatusUpdate) => void;
  defaultValues?: Solicitud;
  isSubmitting: boolean;
}) => {
  const [uploadingFile, setUploadingFile] = useState(false);

  const formDefaultValues: SolicitudStatusUpdateForm | undefined = defaultValues
    ? {
        id: defaultValues.id,
        status: defaultValues.status.toString(),
        observation: "",
        file: null,
      }
    : undefined;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SolicitudStatusUpdateForm>({
    defaultValues: formDefaultValues,
    resolver: zodResolver(SolicitudStatusUpdateSchema),
  });

  const handleFormSubmit = async (formData: SolicitudStatusUpdateForm) => {
    let fileUrl: string | undefined;

    // Subir archivo si existe
    if (formData.file && formData.file.length > 0) {
      setUploadingFile(true);
      try {
        const file = formData.file[0];
        fileUrl = await uploadFile(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        alert("Error al subir el archivo. Por favor, intente de nuevo.");
        return;
      } finally {
        setUploadingFile(false);
      }
    }

    const processedData: SolicitudStatusUpdate = {
      id: formData.id,
      status: Number(formData.status),
      observation: formData.observation,
      fileUrl,
    };

    onSubmit(processedData);
  };

  const statusOptions = Object.entries(STATUS_MAPPING).map(
    ([value, label]) => ({
      value: value,
      label: label,
    })
  );

  return (
    <>
      <Form onSubmit={handleSubmit(handleFormSubmit)}>
        <div className="flex flex-col gap-4 text-black">
          <ElementFormSelect
            name="status"
            label="Estado"
            placeholder="Seleccione un estado"
            control={control}
            error={errors.status}
            options={statusOptions}
          />
          <ElementFormInput
            name="file"
            label="Adjuntar archivo"
            type="file"
            placeholder="Seleccione un archivo"
            control={control}
            error={errors.file}
          />

          <ElementFormTextArea
            name="observation"
            type="text"
            label="Observación"
            placeholder="Ingrese la observación"
            control={control}
            error={errors.observation}
          />
        </div>

        <div className="flex justify-start items-center gap-4">
          <Button type="submit" disabled={isSubmitting || uploadingFile}>
            {uploadingFile
              ? "Subiendo archivo..."
              : isSubmitting
              ? "Guardando..."
              : "Guardar"}
          </Button>
        </div>
      </Form>
    </>
  );
};

export default StatusForm;
