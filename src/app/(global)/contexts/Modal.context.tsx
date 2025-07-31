"use client";
import { createContext, ReactNode, useState } from "react";

interface ModalContextType {
  activeModal: string | null;
  modalData: any;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  isModalOpen: (modalId: string) => boolean;
  setModalData: (modalId: string, data: any) => void;
}

const ModalContext = createContext<ModalContextType>({
  activeModal: null,
  modalData: null,
  openModal: () => null,
  closeModal: () => null,
  isModalOpen: () => false,
  setModalData: () => null,
});

const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalDataState] = useState<any>(null);

  const openModal = (modalId: string) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalDataState(null);
  };

  const isModalOpen = (modalId: string) => {
    return activeModal === modalId;
  };

  const setModalData = (modalId: string, data: any) => {
    setModalDataState(data);
  };

  return (
    <ModalContext.Provider
      value={{
        activeModal,
        modalData,
        openModal,
        closeModal,
        isModalOpen,
        setModalData,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
};

export { ModalProvider, ModalContext };
