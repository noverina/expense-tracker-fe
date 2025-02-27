import React, { useEffect, useRef } from "react";
import "react-perfect-scrollbar/dist/css/styles.css";
import PerfectScrollbar from "react-perfect-scrollbar";

interface ModalProps {
  type: "info" | "warning" | "error" | "none";
  text?: string;
  isOpen: boolean;
  isClosable: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  type,
  text,
  isOpen,
  isClosable,
  onClose,
  children,
}) => {
  const header = `modal-header-${type}`;
  const typeIcon = type == "error" ? "report" : type;
  const modalRef = useRef<HTMLDivElement>(null);

  const headerText = text ? text : "";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (!isOpen) return null;

  return (
    // modal backdrop
    <div
      className={`fixed inset-0 flex items-center justify-center w-full h-full modal-backdrop z-30 fade-in ${
        isClosable ? "cursor-pointer" : "cursor-default"
      }`}
    >
      {/* modal container */}

      <div
        ref={isClosable ? modalRef : undefined}
        className="flex flex-col relative rounded-lg shadow-lg modal-container p-2 cursor-auto max-h-screen"
        style={{ maxHeight: isClosable ? `calc(100vh - 4rem)` : `100vh` }}
      >
        {/* modal header */}
        {isClosable && (
          <div
            className={`${header} flex justify-between h-16 items-center p-2 border-b-2 gap-2`}
          >
            <div className="material-symbols-outlined">{typeIcon}</div>
            <div className={`flex-grow p-2`}>{headerText}</div>
            <button
              onClick={onClose}
              className="rounded-full flex-shrink-0 w-8 text-2xl font-bold bg-button"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        {/* modal content */}
        <PerfectScrollbar options={{ suppressScrollX: true }}>
          <div
            className="p-6"
            style={{ maxHeight: isClosable ? `calc(100vh - 10rem)` : `100vh` }}
          >
            {children}
          </div>
        </PerfectScrollbar>
      </div>
    </div>
  );
};

export default Modal;
