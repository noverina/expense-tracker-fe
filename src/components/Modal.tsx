import React, { useEffect, useRef } from "react";

interface ModalProps {
  type: "info" | "warning" | "error" | "none";
  text?: string;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  type,
  text,
  isOpen,
  onClose,
  children,
}) => {
  console.log(type);
  const header = `modal-header-${type}`;
  const modalRef = useRef<HTMLDivElement>(null);

  const headerText =
    text && text != ""
      ? text.toUpperCase()
      : type == "none"
      ? ""
      : type.toUpperCase();

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
    <div
      className={`fixed inset-0 flex items-center justify-center w-full h-full modal-backdrop ${
        type != "none" ? "cursor-pointer" : "cursor-default"
      }`}
    >
      <div
        ref={type == "none" ? undefined : modalRef}
        className="relative rounded-lg shadow-lg modal-container cursor-auto"
      >
        {type != "none" && (
          <div
            className={`${header} flex justify-between h-16 items-center p-2`}
          >
            <span className="material-symbols-outlined">{type}</span>
            <div className={`flex-grow p-2`}>{headerText}</div>
            <button
              onClick={onClose}
              className="close-button rounded-full flex-shrink-0 w-8 text-2xl font-bold"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
