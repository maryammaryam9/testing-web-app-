import React, { useEffect } from "react";
import { toast } from "react-toastify";
import { ToastContainer } from "react-toastify";

const CpToaster = ({ toastType, message, setToastMessage }) => {
  const CloseButton = () => (
    <span className="btn-trigger toast-close-button" role="button">
      <span className="cross" />
    </span>
  );

  const showToast = () => {
    if (toastType === "success") {
      toast.success(message, {
        position: "top-center",
        autoClose: true,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: false,
        closeButton: <CloseButton />,
        onClose: () => {
          setToastMessage(null);
        },
      });
    } else if (toastType === "error") {
      toast.error(message, {
        position: "top-center",
        autoClose: true,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: false,
        closeButton: <CloseButton />,
        onClose: () => {
          setToastMessage(null);
        },
      });
    } else if (toastType === "warning") {
      toast.warning("This is a note for warning toast", {
        position: "top-center",
        autoClose: true,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: false,
        closeButton: <CloseButton />,
        onClose: () => {
          setToastMessage(null);
        },
      });
    }
  };

  useEffect(() => {
    if (message) {
      showToast();
    }
  }, [message]);

  return (
    <div style={{ zIndex:'1' }}>
      <ToastContainer />
    </div>
  );
}
export default CpToaster;