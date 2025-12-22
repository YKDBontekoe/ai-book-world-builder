"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/atoms/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/atoms/tabs";
import { Button } from "@/components/atoms/button";
import { Label } from "@/components/atoms/label";
import { getConnectedAccounts } from "@/app/actions/user";
import { getAvailableModels, getModelPreferences, saveModelPreferences } from "@/app/actions/settings";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { SettingsModelSelector } from "@/components/organisms/settings/settings-model-selector";

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
  const [isSavingModels, setIsSavingModels] = useState(false);

  // Model Settings State
  const [availableModels, setAvailableModels] = useState<any[]>([]);
  const [modelPreferences, setModelPreferences] = useState({
      light: "",
      middle: "",
      large: ""
  });

  useEffect(() => {
    if (open) {
      if (activeTab === "account") loadAccounts();
      if (activeTab === "models") loadModelSettings();
    }
  }, [open, activeTab]);

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
      setIsLoading(true);
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
      } finally {
          setIsLoading(false);
      }
  };

  const handleSaveModelPreferences = async () => {
      setIsSavingModels(true);
      try {
          await saveModelPreferences({
              light: modelPreferences.light || null,
              middle: modelPreferences.middle || null,
              large: modelPreferences.large || null
          });
          toast.success("Model preferences saved");
      } catch (error) {
          toast.error("Failed to save model preferences");
      } finally {
          setIsSavingModels(false);
      }
  };

  const handleConnectGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to connect Google account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] gap-0 p-0 overflow-hidden outline-none h-[600px] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account and preferences.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-1 flex-row overflow-hidden">
          <div className="w-48 border-r bg-muted/30 py-4 shrink-0">
             <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 px-2">
                <TabsTrigger
                  value="account"
                  className="w-full justify-start data-[state=active]:bg-muted"
                >
                  Account
                </TabsTrigger>
                <TabsTrigger
                  value="models"
                  className="w-full justify-start data-[state=active]:bg-muted"
                >
                  AI Models
                </TabsTrigger>
             </TabsList>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            <TabsContent value="account" className="mt-0 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Connected Accounts</h3>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border shadow-sm">
                         <svg className="h-5 w-5" viewBox="0 0 24 24">
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
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium leading-none">Google</h4>
                      <p className="text-sm text-muted-foreground">
                        Use your Google account to log in.
                      </p>
                    </div>
                  </div>
                  {isLoading && activeTab === 'account' ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : connectedAccounts.includes("google") ? (
                    <Button variant="outline" disabled className="gap-2 text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
                      <Check className="h-4 w-4" />
                      Connected
                    </Button>
                  ) : (
                    <Button variant="outline" onClick={handleConnectGoogle}>
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="models" className="mt-0 space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                         <h3 className="text-lg font-medium">Model Configuration</h3>
                         <Button onClick={handleSaveModelPreferences} disabled={isSavingModels}>
                             {isSavingModels && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                             Save Changes
                         </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Select the AI models you want to use for different complexity levels.
                        These settings will apply across the application (Chat, Story Generation, etc.).
                    </p>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-2">
                            <Label>Light Model (Fast, low cost)</Label>
                            <p className="text-xs text-muted-foreground">Used for simple tasks like title generation and quick suggestions.</p>
                            <SettingsModelSelector
                                availableModels={availableModels}
                                selectedModelId={modelPreferences.light}
                                onModelChange={(val) => setModelPreferences(prev => ({ ...prev, light: val }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Middle Model (Balanced)</Label>
                            <p className="text-xs text-muted-foreground">The default for chat and standard editing tasks.</p>
                            <SettingsModelSelector
                                availableModels={availableModels}
                                selectedModelId={modelPreferences.middle}
                                onModelChange={(val) => setModelPreferences(prev => ({ ...prev, middle: val }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Large Model (Complex reasoning)</Label>
                            <p className="text-xs text-muted-foreground">Used for deep story planning, analysis, and high-quality prose generation.</p>
                            <SettingsModelSelector
                                availableModels={availableModels}
                                selectedModelId={modelPreferences.large}
                                onModelChange={(val) => setModelPreferences(prev => ({ ...prev, large: val }))}
                            />
                        </div>
                    </div>
                </div>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
