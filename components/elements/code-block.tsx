"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import type { ComponentProps, HTMLAttributes, ReactNode } from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useTheme } from "next-themes";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { cn } from "@/lib/utils";

const SyntaxHighlighter = dynamic(
  () => import("react-syntax-highlighter").then((mod) => mod.Prism),
  {
    loading: () => (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    ),
    ssr: false,
  }
);

type CodeBlockContextType = {
  code: string;
};

const CodeBlockContext = createContext<CodeBlockContextType>({
  code: "",
});

export type CodeBlockProps = HTMLAttributes<HTMLDivElement> & {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  children?: ReactNode;
};

export const CodeBlock = ({
  code,
  language,
  showLineNumbers = false,
  className,
  children,
  ...props
}: CodeBlockProps) => {
  return (
    <CodeBlockContext.Provider value={{ code }}>
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border bg-background text-foreground",
          className
        )}
        {...props}
      >
        <div className="relative">
          <SyntaxHighlighterWrapper
            code={code}
            language={language}
            showLineNumbers={showLineNumbers}
          />
          {children && (
            <div className="absolute top-2 right-2 flex items-center gap-2">
              {children}
            </div>
          )}
        </div>
      </div>
    </CodeBlockContext.Provider>
  );
};

const SyntaxHighlighterWrapper = ({
  code,
  language,
  showLineNumbers,
}: {
  code: string;
  language: string;
  showLineNumbers: boolean;
}) => {
  const { theme } = useTheme();
  const [style, setStyle] = useState<any>(undefined);

  useEffect(() => {
    let mounted = true;
    const loadStyle = async () => {
      const s =
        theme === "dark"
          ? await import(
              "react-syntax-highlighter/dist/esm/styles/prism/one-dark"
            )
          : await import(
              "react-syntax-highlighter/dist/esm/styles/prism/one-light"
            );
      if (mounted) {
        setStyle(s.default);
      }
    };
    loadStyle();
    return () => {
      mounted = false;
    };
  }, [theme]);

  if (!style)
    return (
      <div className="flex items-center justify-center p-4">
        <LoadingSpinner />
      </div>
    );

  return (
    <SyntaxHighlighter
      className="overflow-hidden"
      codeTagProps={{
        className: "font-mono text-sm",
      }}
      customStyle={{
        margin: 0,
        padding: "1rem",
        fontSize: "0.875rem",
        background: "hsl(var(--background))",
        color: "hsl(var(--foreground))",
        overflowX: "auto",
        overflowWrap: "break-word",
        wordBreak: "break-all",
      }}
      language={language}
      lineNumberStyle={{
        color: "hsl(var(--muted-foreground))",
        paddingRight: "1rem",
        minWidth: "2.5rem",
      }}
      showLineNumbers={showLineNumbers}
      style={style}
    >
      {code}
    </SyntaxHighlighter>
  );
};

export type CodeBlockCopyButtonProps = ComponentProps<typeof Button> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

export const CodeBlockCopyButton = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: CodeBlockCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const { code } = useContext(CodeBlockContext);

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !navigator.clipboard.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), timeout);
    } catch (error) {
      onError?.(error as Error);
    }
  };

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <Button
      className={cn("shrink-0", className)}
      onClick={copyToClipboard}
      size="icon"
      variant="ghost"
      {...props}
    >
      {children ?? <Icon size={14} />}
    </Button>
  );
};
