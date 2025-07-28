import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";

const AlertButtonEdit = ({ idSolicitud }: { idSolicitud: string }) => {
  const { openModal } = useModalContext();
  const router = useRouter();

  const handleOpenModal = () => {
    router.push(`/dashboard/home?idSolicitud=${idSolicitud}`);
    openModal("alert-form-edit");
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
