"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ComponentProps } from "react";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";


interface SnippetContextType {
  code: string;
}

const SnippetContext = createContext<SnippetContextType>({
  code: "",
});

export type SnippetProps = ComponentProps<typeof InputGroup> & {
  code: string;
};

const Snippet19 = ({
  code,
  className,
  children,
  ...props
}: SnippetProps) => {
  const contextValue = useMemo(() => ({ code }), [code]);

  return (
    <SnippetContext.Provider value={contextValue}>
      <InputGroup className={cn("font-mono", className)} {...props}>
        {children}
      </InputGroup>
    </SnippetContext.Provider>
  );
};

export const Snippet = withRef("Snippet", Snippet19);

export type SnippetAddonProps = ComponentProps<typeof InputGroupAddon>;

const SnippetAddon19 = (props: SnippetAddonProps) => (
  <InputGroupAddon {...props} />
);

export const SnippetAddon = withRef("SnippetAddon", SnippetAddon19);

export type SnippetTextProps = ComponentProps<typeof InputGroupText>;

const SnippetText19 = ({ className, ...props }: SnippetTextProps) => (
  <InputGroupText
    className={cn("pl-2 font-normal text-muted-foreground", className)}
    {...props}
  />
);

export const SnippetText = withRef("SnippetText", SnippetText19);

export type SnippetInputProps = Omit<
  ComponentProps<typeof InputGroupInput>,
  "readOnly" | "value"
>;

const SnippetInput19 = ({ className, ...props }: SnippetInputProps) => {
  const { code } = useContext(SnippetContext);

  return (
    <InputGroupInput
      aria-label="Code snippet"
      className={cn("text-foreground", className)}
      readOnly
      value={code}
      {...props}
    />
  );
};

export const SnippetInput = withRef("SnippetInput", SnippetInput19);

export type SnippetCopyButtonProps = ComponentProps<typeof InputGroupButton> & {
  onCopy?: () => void;
  onError?: (error: Error) => void;
  timeout?: number;
};

const SnippetCopyButton19 = ({
  onCopy,
  onError,
  timeout = 2000,
  children,
  className,
  ...props
}: SnippetCopyButtonProps) => {
  const [isCopied, setIsCopied] = useState(false);
  const timeoutRef = useRef<number>(0);
  const { code } = useContext(SnippetContext);

  const copyToClipboard = useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      onError?.(new Error("Clipboard API not available"));
      return;
    }

    try {
      if (!isCopied) {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        onCopy?.();
        timeoutRef.current = window.setTimeout(
          () => setIsCopied(false),
          timeout
        );
      }
    } catch (error) {
      onError?.(error as Error);
    }
  }, [code, onCopy, onError, timeout, isCopied]);

  useEffect(
    () => () => {
      window.clearTimeout(timeoutRef.current);
    },
    []
  );

  const Icon = isCopied ? CheckIcon : CopyIcon;

  return (
    <InputGroupButton
      aria-label="Copy"
      className={className}
      onClick={copyToClipboard}
      size="icon-sm"
      title="Copy"
      {...props}
    >
      {children ?? <Icon className="size-3.5" size={14} />}
    </InputGroupButton>
  );
};

export const SnippetCopyButton = withRef("SnippetCopyButton", SnippetCopyButton19);
