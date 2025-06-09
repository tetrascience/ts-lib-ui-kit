import React, { useCallback, useState } from "react";
import MonacoEditor, { Monaco, OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-expect-error - This is a workaround to avoid the error when importing the themes
import themes from "monaco-themes/themes/themelist";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import { Tooltip } from "@atoms/Tooltip";
import "./CodeEditor.scss";

// Helper function to dynamically import theme data
const loadTheme = async (themeName: string) => {
  try {
    // Use dynamic import instead of import.meta.glob for better bundler compatibility
    const themeModule = await import(`monaco-themes/themes/${themeName}.json`);
    return themeModule.default;
  } catch (error) {
    console.warn(`Failed to load theme ${themeName}:`, error);
    return null;
  }
};

interface CodeEditorProps {
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

// Theme mapping
const THEME_MAP = {
  light: "github-light",
  dark: "dracula",
};

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = "python",
  theme = "dark",
  height = 400,
  width = "100%",
  options = {},
  onCopy,
  onLaunch,
  disabled = false,
}) => {
  const [copyState, setCopyState] = useState<"Copy" | "Copied">("Copy");
  const [launchState, setLaunchState] = useState<"Launch" | "Launched">(
    "Launch"
  );

  const handleCopy = useCallback(
    (code: string) => {
      if (onCopy && !disabled) {
        onCopy(code);
        setCopyState("Copied");
        setTimeout(() => {
          setCopyState("Copy");
        }, 1000);
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
        }, 1000);
      }
    },
    [onLaunch, disabled]
  );

  const handleEditorWillMount = async (monaco: Monaco) => {
    const monacoTheme = THEME_MAP[theme];

    try {
      const themeFile = themes[monacoTheme];

      if (themeFile) {
        const themeData = await loadTheme(themeFile);
        if (themeData) {
          monaco.editor.defineTheme(monacoTheme, themeData);
        }
      }
      monaco.editor.setTheme(monacoTheme);
    } catch (error) {
      console.error("Error loading theme:", error);
      monaco.editor.setTheme("vs-dark");
    }
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

  const containerClasses = [
    "code-editor",
    `code-editor--${theme}`,
    disabled && "code-editor--disabled",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClasses}>
      <div className="code-editor__actions">
        {onCopy && (
          <Tooltip content={copyState} placement="bottom">
            <div className="code-editor__button-wrapper">
              <Button
                variant="tertiary"
                size="small"
                leftIcon={<Icon name={IconName.COPY} />}
                noPadding
                fullWidth
                onClick={() => handleCopy(value)}
                disabled={disabled}
              >
                {null}
              </Button>
            </div>
          </Tooltip>
        )}
        {onLaunch && (
          <Tooltip content={launchState} placement="bottom">
            <div className="code-editor__button-wrapper">
              <Button
                variant="tertiary"
                size="small"
                leftIcon={<Icon name={IconName.ROCKET_LAUNCH} />}
                noPadding
                fullWidth
                onClick={() => handleLaunch(value)}
                disabled={disabled}
              >
                {null}
              </Button>
            </div>
          </Tooltip>
        )}
      </div>

      <MonacoEditor
        value={value}
        onChange={onChange}
        language={language}
        theme={THEME_MAP[theme]}
        height={height}
        width={width}
        options={defaultOptions}
        beforeMount={handleEditorWillMount}
      />
    </div>
  );
};

export { CodeEditor };
export type { CodeEditorProps };
