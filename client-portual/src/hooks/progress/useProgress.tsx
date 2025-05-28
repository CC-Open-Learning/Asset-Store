import { useContext } from "react";

import { ProgressContext } from "../../store/contexts/progress/ProgressContext";

/**
 * Custom hook to access the progress context values and functions.
 * @returns The progress context object.
 */
const useProgress = () => {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
};

export default useProgress;
