import { useEffect } from "react";

const useBeforeUnload = (isProcessing: boolean) => {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing) {
        e.preventDefault();
        e.returnValue =
          "Your task is being processed. Are you sure you want to leave?";
        return "Your task is being processed. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isProcessing]);
};
export default useBeforeUnload;