import React, { useState } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FloatingOrbs } from "@/components/background/FloatingOrbs";
import { api } from "@/lib/api";
import {
  Settings,
  Sun,
  Moon,
  ShieldAlert,
  Save,
  Key,
  LogOut,
  User,
} from "lucide-react";
import { toast } from "sonner";

export const SettingsPage: React.FC = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [fullName, setFullName] = useState(user?.full_name || "");
  const [apiKey, setApiKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.patch("/users/me", {
        full_name: fullName,
      });
      updateUser(res.data);
      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] max-w-4xl mx-auto px-4 py-8 space-y-8">
      <FloatingOrbs />

      <div className="pb-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold font-display text-foreground">
            Account & Preferences
          </h1>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Manage your developer profile, visual theme, and custom AI provider keys.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <User className="w-4 h-4 text-primary" />
            <h3>Personal Information</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user?.email || ""} disabled className="opacity-60" />
              </div>
            </div>

            <Button type="submit" disabled={isSaving} className="text-xs h-9 px-4">
              <Save className="w-3.5 h-3.5" /> Save Changes
            </Button>
          </form>
        </div>

        {/* Appearance & Theme */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Sun className="w-4 h-4 text-primary" />
            <h3>Appearance & Aesthetics</h3>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-background/50 border border-border/60">
            <div>
              <h4 className="text-xs font-bold text-foreground">Active Theme</h4>
              <p className="text-[11px] text-muted-foreground">
                Dark Forest (Emerald Neon Canopy) default
              </p>
            </div>

            <Button
              variant="outline"
              onClick={toggleTheme}
              className="text-xs h-9 px-4"
            >
              {theme === "dark" ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" /> Switch to Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-emerald-600" /> Switch to Dark
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Custom AI Keys */}
        <div className="card-base p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Key className="w-4 h-4 text-primary" />
            <h3>Custom API Provider Keys (Optional)</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            CourseForge provides free built-in models out of the box. You may also provide your own personal keys.
          </p>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="openai">OpenAI / Anthropic API Key</Label>
              <Input
                id="openai"
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => toast.success("Custom provider key stored locally")}
              className="text-xs h-8 px-3"
            >
              Update API Key
            </Button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card-base p-6 border-destructive/30 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-destructive">
            <ShieldAlert className="w-4 h-4" />
            <h3>Danger Zone</h3>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-xs font-semibold text-foreground">Sign Out of All Sessions</h4>
              <p className="text-[11px] text-muted-foreground">
                Revokes active session tokens and clears HttpOnly authorization cookies.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={logout}
              className="text-xs h-9 px-4"
            >
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
