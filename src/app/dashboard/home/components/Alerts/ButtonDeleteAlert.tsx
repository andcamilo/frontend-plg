"use client";
import Button from "@app/(global)/components/Button";
import { useDeleteAlertMutation } from "../../hooks/useAlerts.query";
import swal from "sweetalert2";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useSearchParams } from "next/navigation";

const ButtonDeleteAlert = ({ alertId }: { alertId: string }) => {
  const { mutateAsync: deleteAlert, isPending } = useDeleteAlertMutation();
  const { closeModal } = useModalContext();
  const searchParams = useSearchParams();
  const solicitudId = searchParams?.get("idSolicitud") as string;
  const handleDeleteAlert = async () => {
    try {
      await deleteAlert({ alertId, solicitudId });
      swal.fire({
        title: "Alerta eliminada",
        text: "La alerta ha sido eliminada correctamente",
        icon: "success",
      });
      closeModal();
    } catch (error) {
      swal.fire({
        title: "Error",
        text: "Error al eliminar la alerta " + error,
        icon: "error",
      });
    }
  };
  return (
    <>
      <Button onClick={handleDeleteAlert} variant="danger" disabled={isPending}>
        {isPending ? "Eliminando..." : "Eliminar Alerta"}
      </Button>
    </>
  );
};

export default ButtonDeleteAlert;
