import * as React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import { BadgeProvider } from "@/contexts/BadgeContext";

import { Login } from "@/pages/Login";
import { Dashboard } from "@/pages/Dashboard";
import { CBLProjectView } from "@/pages/CBLProjectView";
import { Achievements } from "@/pages/Achievements";
import { Settings } from "@/pages/Settings";
import { MainLayout } from "@/components/layout/MainLayout";
import { BadgeNotificationToast } from "@/components/shared/BadgeNotificationToast";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  return user ? <>{children}</> : <Navigate to="/login" />;
};

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Carregando...</div>;
  return !user ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/project/:projectId/:phase" element={
        <ProtectedRoute>
          <MainLayout>
            <CBLProjectView />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/achievements" element={
        <ProtectedRoute>
          <MainLayout>
            <Achievements />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <ProjectProvider>
          <BadgeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BadgeNotificationToast />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </BadgeProvider>
        </ProjectProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
