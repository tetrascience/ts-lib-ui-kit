import React, { useCallback, useState } from "react";
import MonacoEditor, { Monaco, OnChange } from "@monaco-editor/react";
import { editor } from "monaco-editor";
// @ts-expect-error - This is a workaround to avoid the error when importing the themes
import themes from "monaco-themes/themes/themelist";
import styled from "styled-components";
import { Button } from "@atoms/Button";
import { Icon, IconName } from "@atoms/Icon";
import { Tooltip } from "@atoms/Tooltip";

// Use import.meta.glob only if available (Vite), otherwise use empty object (webpack/Next.js)
const themeModules = typeof import.meta.glob === 'function'
  ? import.meta.glob("/node_modules/monaco-themes/themes/*.json")
  : {};

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

// Theme mapping
const THEME_MAP = {
  light: "github-light",
  dark: "dracula",
};

const EditorContainer = styled.div<{ themeMode?: string; disabled?: boolean }>`
  border-radius: 16px;
  overflow: hidden;
  background-color: ${(props) =>
    props.themeMode === "dark" ? "var(--grey-800)" : "var(--grey-50)"};
  position: relative;
  border: 1px solid var(--grey-200);
  opacity: ${(props) => (props.disabled ? 0.6 : 1)};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "default")};
`;

const EditorActions = styled.div`
  margin-left: auto;
  display: flex;
  gap: 8px;
  padding: 8px 16px;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 1;
`;

const ButtonWrapper = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const StyledButton = styled(Button)`
  width: 100%;
  height: 100%;
`;

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
        const themeModule =
          themeModules[`/node_modules/monaco-themes/themes/${themeFile}.json`];
        if (themeModule) {
          const themeData = (
            (await themeModule()) as { default: editor.IStandaloneThemeData }
          ).default;
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

  return (
    <EditorContainer themeMode={theme} disabled={disabled}>
      <EditorActions>
        {onCopy && (
          <Tooltip content={copyState} placement="bottom">
            <ButtonWrapper>
              <StyledButton
                variant="tertiary"
                size="small"
                leftIcon={<Icon name={IconName.COPY} />}
                noPadding
                fullWidth
                onClick={() => handleCopy(value)}
                disabled={disabled}
              >
                {null}
              </StyledButton>
            </ButtonWrapper>
          </Tooltip>
        )}
        {onLaunch && (
          <Tooltip content={launchState} placement="bottom">
            <ButtonWrapper>
              <StyledButton
                variant="tertiary"
                size="small"
                leftIcon={<Icon name={IconName.ROCKET_LAUNCH} />}
                noPadding
                fullWidth
                onClick={() => handleLaunch(value)}
                disabled={disabled}
              >
                {null}
              </StyledButton>
            </ButtonWrapper>
          </Tooltip>
        )}
      </EditorActions>

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
    </EditorContainer>
  );
};

export default CodeEditor;
