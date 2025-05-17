
import { toast as sonnerToast } from "sonner";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: React.ReactNode;
};

export const useToast = () => {
  return {
    toast: sonnerToast,
  };
};

export const toast = sonnerToast;
