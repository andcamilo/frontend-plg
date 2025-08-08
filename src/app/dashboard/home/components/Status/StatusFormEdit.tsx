"use client";
import swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import StatusForm from "./StatusForm";
import {
  useAllSolicitudes,
  useUpdateSolicitud,
} from "../../hooks/useAllSolicitudes.query";
import { SolicitudStatusUpdate } from "../../types/solicitud.types";

const StatusFormEdit = () => {
  const { closeModal } = useModalContext();
  const searchParams = useSearchParams();
  const solicitudId = searchParams?.get("solicitudId") as string;
  const { mutateAsync: updateSolicitud, isPending } = useUpdateSolicitud();

  const { data: solicitudes, isLoading, error } = useAllSolicitudes();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  const solicitud = solicitudes?.find(
    (solicitud) => solicitud.id === solicitudId
  );

  if (!solicitud) return <div>Solicitud not found</div>;

  const onSubmit = async (data: SolicitudStatusUpdate) => {
    try {
      await updateSolicitud({
        solicitudId: solicitudId,
        status: data.status,
        observation: data.observation,
        fileUrl: data.fileUrl,
      });
      swal.fire({
        title: "Alerta actualizada",
        text: "La alerta ha sido actualizada correctamente",
        icon: "success",
      });
      closeModal();
    } catch (error) {
      swal.fire({
        title: "Error",
        text: "Error al actualizar la alerta " + error,
        icon: "error",
      });
    }
  };
  return (
    <>
      <StatusForm
        key={solicitud.id}
        onSubmit={onSubmit}
        defaultValues={solicitud}
        isSubmitting={isPending}
      />
    </>
  );
};

export default StatusFormEdit;
