"use client";
import swal from "sweetalert2";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import StatusForm from "./StatusForm";
import { useUpdateSolicitud } from "../../hooks/useSolicitudes.query";
import { SolicitudStatusUpdate } from "@/src/app/dashboard/request/[id]/types/solicitud.types";
import { useParams } from "next/navigation";

const StatusFormEdit = () => {
  const { closeModal } = useModalContext();
  const params = useParams();
  const solicitudId = params?.id as string;
  const { mutateAsync: updateSolicitud, isPending } = useUpdateSolicitud();

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
        key={solicitudId}
        onSubmit={onSubmit}
        isSubmitting={isPending}
      />
    </>
  );
};

export default StatusFormEdit;
