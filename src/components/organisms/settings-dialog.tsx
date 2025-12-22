"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent } from "@/components/atoms/dialog";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { getConnectedAccounts } from "@/app/actions/user";
import { getAvailableModels, getModelPreferences, saveModelPreferences } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Check, UserIcon, SparklesIcon } from "lucide-react";
import { SettingsModelSelector } from "@/components/organisms/settings/settings-model-selector";
import { GlassCard } from "@/components/molecules/glass-card";
import { cn } from "@/lib/utils";

export function SettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [activeTab, setActiveTab] = useState("account");
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Model Settings State
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [modelPreferences, setModelPreferences] = useState({
      light: "",
      middle: "",
      large: ""
  });

  useEffect(() => {
    if (open) {
      loadAccounts();
      loadModelSettings();
    }
  }, [open]);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const accounts = await getConnectedAccounts();
      setConnectedAccounts(accounts.map((a) => a.provider));
    } catch (error) {
      toast.error("Failed to load account settings");
    } finally {
      setIsLoading(false);
    }
  };

  const loadModelSettings = async () => {
      try {
          const [models, prefs] = await Promise.all([
              getAvailableModels(),
              getModelPreferences()
          ]);
          setAvailableModels(models);
          setModelPreferences({
              light: prefs.light || "",
              middle: prefs.middle || "",
              large: prefs.large || ""
          });
      } catch (error) {
          toast.error("Failed to load model settings");
      }
  };

  const handleModelChange = async (type: 'light' | 'middle' | 'large', value: string) => {
      const newPrefs = { ...modelPreferences, [type]: value };
      setModelPreferences(newPrefs); // Optimistic update

      try {
          await saveModelPreferences(newPrefs);
          toast.success("Preference saved");
      } catch (error) {
          toast.error("Failed to save preference");
          // Revert if needed, but for settings simple toast is usually enough
      }
  };

  const handleConnectGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to connect Google account");
    }
  };

  const SidebarItem = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
      <Button
          variant="ghost"
          onClick={() => setActiveTab(id)}
          className={cn(
              "w-full justify-start gap-3 h-10 px-4 font-medium transition-all duration-200",
              activeTab === id
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-sidebar-accent/50"
          )}
      >
          <Icon className="w-4 h-4" />
          {label}
      </Button>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[600px] p-0 gap-0 overflow-hidden outline-none flex rounded-2xl border border-white/10 shadow-2xl bg-background/80 backdrop-blur-xl">

        {/* Sidebar */}
        <div className="w-64 bg-muted/30 border-r border-white/5 flex flex-col p-4 gap-1 shrink-0">
             <div className="px-4 py-4 mb-2">
                 <h2 className="text-lg font-semibold tracking-tight text-foreground">Settings</h2>
             </div>

             <SidebarItem id="account" label="Account" icon={UserIcon} />
             <SidebarItem id="models" label="AI Models" icon={SparklesIcon} />
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 overflow-y-auto p-8">
                {activeTab === "account" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                            <h3 className="text-xl font-semibold mb-1">Connected Accounts</h3>
                            <p className="text-sm text-muted-foreground">Manage your external login methods.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlassCard variant="subtle" className="flex items-center p-4 gap-4">
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white shadow-sm border">
                                     <svg className="h-6 w-6" viewBox="0 0 24 24">
                                        <path
                                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                          fill="#4285F4"
                                        />
                                        <path
                                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                          fill="#34A853"
                                        />
                                        <path
                                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                          fill="#FBBC05"
                                        />
                                        <path
                                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                          fill="#EA4335"
                                        />
                                      </svg>
                                </div>
                                <div className="flex-1 space-y-0.5">
                                  <h4 className="font-medium text-foreground">Google</h4>
                                  <p className="text-xs text-muted-foreground">
                                    {connectedAccounts.includes("google") ? "Connected" : "Not connected"}
                                  </p>
                                </div>
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                ) : connectedAccounts.includes("google") ? (
                                  <Button variant="ghost" size="sm" disabled className="text-green-600 hover:text-green-700 bg-green-50/50 hover:bg-green-100/50 dark:bg-green-900/20 dark:text-green-400">
                                    <Check className="h-4 w-4 mr-1" />
                                    Linked
                                  </Button>
                                ) : (
                                  <Button variant="outline" size="sm" onClick={handleConnectGoogle}>
                                    Connect
                                  </Button>
                                )}
                            </GlassCard>
                        </div>
                    </div>
                )}

                {activeTab === "models" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        <div>
                             <h3 className="text-xl font-semibold mb-1">Model Configuration</h3>
                             <p className="text-sm text-muted-foreground">
                                Select models for different complexity levels. Changes save automatically.
                             </p>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-base font-medium">Light Model</Label>
                                <p className="text-sm text-muted-foreground">Used for simple tasks like title generation and quick suggestions.</p>
                                <SettingsModelSelector
                                    availableModels={availableModels}
                                    selectedModelId={modelPreferences.light}
                                    onModelChange={(val) => handleModelChange('light', val)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-medium">Middle Model</Label>
                                <p className="text-sm text-muted-foreground">The default for chat and standard editing tasks.</p>
                                <SettingsModelSelector
                                    availableModels={availableModels}
                                    selectedModelId={modelPreferences.middle}
                                    onModelChange={(val) => handleModelChange('middle', val)}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label className="text-base font-medium">Large Model</Label>
                                <p className="text-sm text-muted-foreground">Used for deep story planning, analysis, and high-quality prose generation.</p>
                                <SettingsModelSelector
                                    availableModels={availableModels}
                                    selectedModelId={modelPreferences.large}
                                    onModelChange={(val) => handleModelChange('large', val)}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
