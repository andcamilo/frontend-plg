"use client";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useModalContext } from "@/src/app/(global)/hooks/useModalContex.hook";
import { MODAL_STATUS_EDIT_ID } from "../../constants/modal-alert.constant";

const StatusEditButton = ({ solicitudId }: { solicitudId: string }) => {
  const { openModal } = useModalContext();
  const router = useRouter();
  const handleClick = () => {
    router.push(`/dashboard/home?solicitudId=${solicitudId}`);
    openModal(MODAL_STATUS_EDIT_ID);
  };
  return (
    <>
      <button onClick={handleClick}>
        <Pencil className="w-4 h-4" />
      </button>
    </>
  );
};

export default StatusEditButton;
