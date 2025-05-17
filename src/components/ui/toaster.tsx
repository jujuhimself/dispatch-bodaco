
import { toast, Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      richColors
      closeButton
      visibleToasts={3}
      duration={4000}
    />
  );
}
