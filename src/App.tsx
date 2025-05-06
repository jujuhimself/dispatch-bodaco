
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import RequireAuth from "./components/auth/RequireAuth";
import Emergencies from "./pages/Emergencies";
import EmergencyCreate from "./pages/EmergencyCreate";
import Responders from "./pages/Responders";
import Hospitals from "./pages/Hospitals";
import Communications from "./pages/Communications";

// Create a client
const queryClient = new QueryClient();

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<Auth />} />
    
    {/* Protected routes */}
    <Route path="/" element={<RequireAuth><Index /></RequireAuth>} />
    <Route path="/emergencies" element={<RequireAuth><Emergencies /></RequireAuth>} />
    <Route path="/emergencies/create" element={<RequireAuth roles={['dispatcher', 'admin']}><EmergencyCreate /></RequireAuth>} />
    <Route path="/responders" element={<RequireAuth><Responders /></RequireAuth>} />
    <Route path="/hospitals" element={<RequireAuth><Hospitals /></RequireAuth>} />
    <Route path="/communications" element={<RequireAuth><Communications /></RequireAuth>} />
    
    {/* Catch all */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <TooltipProvider>
            <AuthProvider>
              <AppRoutes />
              <Toaster />
              <Sonner />
            </AuthProvider>
          </TooltipProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
