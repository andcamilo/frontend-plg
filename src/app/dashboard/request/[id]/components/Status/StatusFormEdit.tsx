"use client";
import swal from "sweetalert2";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import StatusForm from "./StatusForm";
import {
  useSolicitudByID,
  useUpdateSolicitud,
} from "../../hooks/useSolicitudes.query";
import { SolicitudStatusUpdate } from "@/src/app/dashboard/request/[id]/types/solicitud.types";
import { useParams } from "next/navigation";

const StatusFormEdit = () => {
  const { closeModal } = useModalContext();
  const params = useParams();
  const solicitudId = params?.id as string;
  const { mutateAsync: updateSolicitud, isPending } = useUpdateSolicitud();
  const { data: solicitud, isLoading, isError } = useSolicitudByID(solicitudId);

  if (isLoading) return <div>Cargando...</div>;
  if (isError) return <div>Error al cargar la solicitud</div>;

  const onSubmit = async (data: SolicitudStatusUpdate) => {
    try {
      await updateSolicitud({
        solicitudId: solicitudId,
        status: data.status,
        observation: data.observation,
        adjuntoDocumentoBitacora: data.adjuntoDocumentoBitacora,
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
        key={solicitudId}
        onSubmit={onSubmit}
        defaultValues={solicitud}
        isSubmitting={isPending}
      />
    </>
  );
};

export default StatusFormEdit;
