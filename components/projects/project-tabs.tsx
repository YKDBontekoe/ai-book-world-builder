"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import { User, Globe } from "lucide-react";
import { ReactNode } from "react";

export function ProjectTabs({
    currentTab,
    children
}: {
    currentTab: string;
    children: ReactNode;
}) {
    const router = useRouter();

    return (
        <Tabs value={currentTab} onValueChange={(val) => router.push(`/projects?tab=${val}`)} className="mt-8">
            <TabsList className="mb-6">
                <TabsTrigger value="mine" className="gap-2">
                    <User className="h-4 w-4" />
                    My Projects
                </TabsTrigger>
                <TabsTrigger value="shared" className="gap-2">
                    <Globe className="h-4 w-4" />
                    Community
                </TabsTrigger>
            </TabsList>
            {children}
        </Tabs>
    );
}
