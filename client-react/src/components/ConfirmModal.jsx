import { useEffect, useRef } from "react";

export default function ConfirmModal({ isOpen, message, onConfirm, onCancel }) {
  const dialogRef = useRef(null);

  // Close the modal if we click outside or press esc.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        // Prevent default action (like re-submitting an underlying form)
        e.preventDefault();

        // If the user has manually highlighted the Cancel button via Tab, let it click Cancel
        if (document.activeElement?.getAttribute("data-btn") === "cancel") {
          onCancel();
        } else {
          onConfirm();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onConfirm, onCancel]);
  if (!isOpen) return null;

  return (
    <>
      {/* Adjust the numbers below to control darkness and blurriness */}
      <style>{`
      dialog::backdrop {
        background-color: rgba(0, 0, 0, 0.55); /* Change 0.75 to a higher number to make it darker */
        backdrop-filter: blur(3px);            /* Change 6px to a higher number to make it more blurry */
      }
        
    `}</style>

      <dialog
        ref={dialogRef}
        style={styles.modalBox}
        onClose={onCancel}
        onClick={(e) => {
          if (e.target === dialogRef.current) onCancel();
        }}
      >
        <p style={styles.message}>{message}</p>
        <div style={styles.btnContainer}>
          <button style={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
          <button style={styles.confirmBtn} onClick={onConfirm}>
            OK
          </button>
        </div>
      </dialog>
    </>
  );
}

const styles = {
  modalBox: {
    backgroundColor: "#1e1e24",
    border: "1px solid #333",
    borderRadius: "8px",
    padding: "24px",
    width: "400px",
    boxShadow: "110 4px 20px rgba(0,0,0,0.5)",
    textAlign: "center",
    transform: "translateY(-80%)",
  },
  message: {
    color: "#ffffff",
    fontSize: "16px",
    marginBottom: "20px",
    fontFamily: "sans-serif",
  },
  btnContainer: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#33333a",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
  confirmBtn: {
    flex: 1,
    backgroundColor: "#3b82f6",
    color: "#fff",
    border: "none",
    padding: "8px 16px",
    borderRadius: "4px",
    cursor: "pointer",
  },
};
