"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { getConnectedAccounts } from "@/app/actions/user";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

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

  useEffect(() => {
    if (open) {
      loadAccounts();
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

  const handleConnectGoogle = async () => {
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      toast.error("Failed to connect Google account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] gap-0 p-0 overflow-hidden outline-none">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Manage your account and preferences.</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-row">
          <div className="w-48 border-r bg-muted/30 py-4">
             <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-1 px-2">
                <TabsTrigger
                  value="account"
                  className="w-full justify-start data-[state=active]:bg-muted"
                >
                  Account
                </TabsTrigger>
                {/* Add more tabs here if needed */}
             </TabsList>
          </div>

          <div className="flex-1 p-6">
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
                  {isLoading ? (
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
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
