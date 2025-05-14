
import { useToast as useToastOriginal, type ToastActionElement } from "@/components/ui/toast"

export type ToastProps = {
  title?: string
  description?: string
  action?: ToastActionElement
}

export const useToast = () => {
  const { toast } = useToastOriginal()

  return {
    toast,
    ...useToastOriginal(),
  }
}
