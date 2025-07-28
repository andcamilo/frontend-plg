import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";
import { MODAL_ALERT_EDIT_ID } from "../../../constants/modal-alert.constant";

const AlertButtonEdit = ({ idSolicitud }: { idSolicitud: string }) => {
  const { openModal } = useModalContext();
  const router = useRouter();

  const handleOpenModal = () => {
    router.push(`/dashboard/home?idSolicitud=${idSolicitud}`);
    openModal(MODAL_ALERT_EDIT_ID);
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300"
      >
        Editar Alerta
      </button>
    </>
  );
};

export default AlertButtonEdit;
