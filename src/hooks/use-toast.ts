
import { toast as sonnerToast } from "sonner";
import { type ToastActionElement } from "@/components/ui/toast";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

export const useToast = () => {
  return {
    toast: sonnerToast,
  };
};

export const toast = sonnerToast;
