
import { toast as sonnerToast } from "sonner";
import { type ToastActionElement } from "@/components/ui/toast";
import { useToast as useToastShadcn } from "@/components/ui/toaster";

export type ToastProps = {
  title?: string;
  description?: string;
  action?: ToastActionElement;
};

export const useToast = () => {
  const toastShadcn = useToastShadcn();

  return {
    toast: sonnerToast,
    ...toastShadcn,
  };
};

export const toast = sonnerToast;
