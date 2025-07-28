import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";

const AlertButtonCreate = ({ idSolicitud }: { idSolicitud: string }) => {
  const { openModal } = useModalContext();
  const router = useRouter();

  const handleOpenModal = () => {
    openModal("alert-form-create");
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300"
      >
        Crear Alerta
      </button>
    </>
  );
};

export default AlertButtonCreate;
