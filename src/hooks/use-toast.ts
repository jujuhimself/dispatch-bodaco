
import * as React from "react";
import { useToast as useToastUI } from "@/components/ui/use-toast";
import { Toast, toast as toastUI } from "@/components/ui/toast";

export { Toast };

export const useToast = useToastUI;
export const toast = toastUI;
