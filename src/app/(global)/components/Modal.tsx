"use client";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useModalContext } from "../hooks/useModalContex.hook";
import { twMerge } from "tailwind-merge";

interface Props {
  children: React.ReactNode;
  modalId: string;
  className?: string;
}

const eventListener = "keydown";

export const Modal = ({ children, modalId, className }: Props) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const { isModalOpen, closeModal } = useModalContext();
  const [modalRoot, setModalRoot] = useState<HTMLElement | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  const isOpen = isModalOpen(modalId);

  useEffect(() => {
    setIsMounted(true);
    setModalRoot(document.getElementById("modal"));
  }, []);

  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeModal();
      }
    };
    if (isOpen) {
      document.addEventListener(eventListener, handleEsc);
    }

    return () => {
      document.removeEventListener(eventListener, handleEsc);
    };
  }, [closeModal, isOpen]);

  // Don't render on server or if modal root doesn't exist
  if (!isMounted || !isOpen || !modalRoot) {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-6 animate-in fade-in duration-200"
      onClick={closeModal}
    >
      <div
        className={twMerge(
          "bg-white rounded-lg shadow-sm w-full max-w-2xl max-h-[90vh] overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200",
          className
        )}
        onClick={handleContentClick}
        ref={modalRef}
      >
        <div className="flex justify-end p-3 border-b border-slate-200">
          <button
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors duration-200"
            onClick={closeModal}
            title="Cerrar modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
          {children}
        </div>
      </div>
    </div>,
    modalRoot
  );
};
