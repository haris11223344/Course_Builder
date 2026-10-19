import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageTransition } from "@/components/layout/PageTransition";
import { LandingPage } from "@/routes/index";
import { LoginPage } from "@/routes/auth/login";
import { RegisterPage } from "@/routes/auth/register";
import { OnboardingPage } from "@/routes/auth/onboarding";
import { DashboardPage } from "@/routes/dashboard";
import { CourseBuilderPage } from "@/routes/builder/index";
import { CourseViewerPage } from "@/routes/course/$courseId";
import { LibraryPage } from "@/routes/library";
import { SettingsPage } from "@/routes/settings";
import { DatabaseExplorerPage } from "@/routes/admin/index";
import { Toaster } from "sonner";

const AnimatedAppRoutes: React.FC = () => {
  const location = useLocation();
  const isViewer = location.pathname.startsWith("/course/");

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Page Area */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <PageTransition>
                  <LandingPage />
                </PageTransition>
              }
            />
            <Route
              path="/auth/login"
              element={
                <PageTransition>
                  <LoginPage />
                </PageTransition>
              }
            />
            <Route
              path="/auth/register"
              element={
                <PageTransition>
                  <RegisterPage />
                </PageTransition>
              }
            />
            <Route
              path="/auth/onboarding"
              element={
                <PageTransition>
                  <OnboardingPage />
                </PageTransition>
              }
            />
            <Route
              path="/dashboard"
              element={
                <PageTransition>
                  <DashboardPage />
                </PageTransition>
              }
            />
            <Route
              path="/builder"
              element={
                <PageTransition>
                  <CourseBuilderPage />
                </PageTransition>
              }
            />
            <Route
              path="/course/:courseId"
              element={
                <PageTransition>
                  <CourseViewerPage />
                </PageTransition>
              }
            />
            <Route
              path="/library"
              element={
                <PageTransition>
                  <LibraryPage />
                </PageTransition>
              }
            />
            <Route
              path="/settings"
              element={
                <PageTransition>
                  <SettingsPage />
                </PageTransition>
              }
            />
            <Route
              path="/admin"
              element={
                <PageTransition>
                  <DatabaseExplorerPage />
                </PageTransition>
              }
            />
            <Route
              path="/database"
              element={
                <PageTransition>
                  <DatabaseExplorerPage />
                </PageTransition>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>

      {/* Global Footer (hidden in full-screen course viewer) */}
      {!isViewer && <Footer />}

      {/* Toast Notifications */}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          className: "glass-strong border-border text-foreground font-sans text-xs",
        }}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatedAppRoutes />
    </BrowserRouter>
  );
};

export default App;
