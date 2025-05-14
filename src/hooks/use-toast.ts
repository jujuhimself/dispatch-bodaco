
import * as React from "react";
import { Toast } from "@/components/ui/toast";
import { useToast as useToastUI } from "@/components/ui/use-toast";
import { toast as toastSonner } from "sonner";

export { Toast };

// Export the useToast hook from the UI component
export const useToast = useToastUI;

// Export the toast function from sonner
export const toast = toastSonner;
