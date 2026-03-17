import MonacoEditor from "@monaco-editor/react";
import { Copy, Rocket } from "lucide-react";
import React, { useCallback, useRef, useState } from "react";

import type { Monaco, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCodeEditorTheme } from "@/hooks/use-code-editor-theme";
import { cn } from "@/lib/utils";

export interface CodeEditorProps {
  value: string;
  onChange: OnChange;
  language?: string;
  theme?: "light" | "dark";
  height?: string | number;
  width?: string | number;
  options?: Record<string, unknown>;
  label?: string;
  onCopy?: (code: string) => void;
  onLaunch?: (code: string) => void;
  disabled?: boolean;
}

// Theme mapping for explicit theme prop overrides
const THEME_MAP = {
  light: "vs" as const,
  dark: "vs-dark" as const,
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "python",
  theme: themeProp,
  height = 400,
  width = "100%",
  options = {},
  onCopy,
  onLaunch,
  disabled = false,
}) => {
  const editorTheme = useCodeEditorTheme();

  const monacoRef = useRef<Monaco | null>(null);
  const [copyState, setCopyState] = useState<"Copy" | "Copied">("Copy");
  const [launchState, setLaunchState] = useState<"Launch" | "Launched">(
    "Launch"
  );
  /** Feedback reset delay in milliseconds */
  const FEEDBACK_RESET_DELAY_MS = 1000;

  const handleCopy = useCallback(
    (code: string) => {
      if (onCopy && !disabled) {
        onCopy(code);
        setCopyState("Copied");
        setTimeout(() => {
          setCopyState("Copy");
        }, FEEDBACK_RESET_DELAY_MS);
      }
    },
    [onCopy, disabled]
  );

  const handleLaunch = useCallback(
    (code: string) => {
      if (onLaunch && !disabled) {
        onLaunch(code);
        setLaunchState("Launched");
        setTimeout(() => {
          setLaunchState("Launch");
        }, FEEDBACK_RESET_DELAY_MS);
      }
    },
    [onLaunch, disabled]
  );

  const handleEditorWillMount = async (monaco: Monaco) => {
    monacoRef.current = monaco;
  };

  const defaultOptions = {
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    lineNumbers: "on" as editor.LineNumbersType,
    padding: { top: 12, bottom: 12, left: 20, right: 20 },
    scrollbar: {
      vertical: "hidden" as const,
      verticalScrollbarSize: 0,
    },
    readOnly: disabled,
    ...options,
  };



  return (
    <div className={cn("rounded-2xl overflow-hidden relative border", disabled && "opacity-60 cursor-not-allowed")}>
      <div className="ml-auto flex gap-2 px-4 py-2 absolute top-0 right-0 z-[1]">
        {onCopy && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-8 h-8 flex items-center justify-center">
                <Button
                  className="w-full h-full"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleCopy(value)}
                  disabled={disabled}
                >
                  <Copy />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {copyState}
            </TooltipContent>
          </Tooltip>
        )}
        {onLaunch && (
          <Tooltip >
            <TooltipTrigger asChild>
              <div className="w-8 h-8 flex items-center justify-center">
                <Button
                  className="w-full h-full"
                  variant="outline"
                  size="icon-sm"
                  onClick={() => handleLaunch(value)}
                  disabled={disabled}
                >
                  <Rocket />
                </Button>
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom">
              {launchState}
            </TooltipContent>
          </Tooltip>
        )}
      </div>
      <MonacoEditor
        value={value}
        onChange={onChange}
        language={language}
        theme={themeProp ? THEME_MAP[themeProp] : editorTheme.monacoTheme}
        height={height}
        width={width}
        options={defaultOptions}
        beforeMount={handleEditorWillMount}
      />
    </div>
  );
};

export { CodeEditor };
export default CodeEditor;
