import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Sun, Moon, Sparkles, BookOpen, Layers, Bookmark, LogOut, Database, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthPage = location.pathname.startsWith("/auth");

  return (
    <header className="sticky top-0 z-sticky w-full border-b border-border/40 bg-background/70 backdrop-blur-xl transition-all">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 group">
          <BrandLogo />
        </Link>

        {/* Center Nav for logged in / general visitors */}
        {!isAuthPage && (
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/dashboard"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === "/dashboard"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/builder"
              className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                location.pathname.startsWith("/builder")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Course Builder
            </Link>
            <Link
              to="/library"
              className={`px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                location.pathname === "/library"
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              Saved Library
            </Link>
            {user && String(user.role).toLowerCase() === "admin" && (
              <Link
                to="/admin"
                className={`flex items-center gap-1.5 px-3.5 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === "/admin" || location.pathname === "/database"
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                }`}
              >
                <Database className="w-3.5 h-3.5 text-primary" />
                Database
              </Link>
            )}
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="btn-ghost h-9 w-9 p-0 rounded-lg"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-emerald-600 transition-transform hover:-rotate-12" />
            )}
          </button>

          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                to="/builder"
                className="btn-primary hidden sm:inline-flex h-9 text-xs px-4"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Generate Course
              </Link>
              
              <div className="flex items-center gap-2 pl-2 border-l border-border/50">
                <Link
                  to="/settings"
                  className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">
                    {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <span className="hidden lg:inline text-xs font-medium max-w-[100px] truncate">
                    {user.full_name || user.email}
                  </span>
                </Link>

                <button
                  onClick={logout}
                  title="Log out"
                  className="btn-ghost h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth/login" className="btn-ghost text-xs px-3.5 h-9">
                Sign in
              </Link>
              <Link to="/auth/register" className="btn-primary text-xs px-4 h-9">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
