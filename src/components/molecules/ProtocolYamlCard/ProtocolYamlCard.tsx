import React from "react";
import styled from "styled-components";
import { Button } from "@atoms/Button";
import { CodeEditor } from "@atoms/CodeEditor";
import { Dropdown, DropdownOption } from "@atoms/Dropdown";
import { Toggle } from "@atoms/Toggle";

export interface ProtocolYamlCardProps {
  title: string;
  newVersionMode: boolean;
  onToggleNewVersionMode: (checked: boolean) => void;
  versionOptions: DropdownOption[];
  selectedVersion: string;
  onVersionChange: (value: string) => void;
  onDeploy: () => void;
  yaml: string;
  onYamlChange: (value: string) => void;
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 0;
  gap: 16px;
  width: 928px;
  background: transparent;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 928px;
  height: 36px;
`;

const Title = styled.span`
  font-family: "Inter", sans-serif;
  font-weight: 600;
  font-size: 18px;
  line-height: 28px;
  color: var(--black-900);
`;

const Controls = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  justify-content: flex-end;
`;

const Divider = styled.div`
  width: 1px;
  height: 20px;
  background: var(--grey-200);
`;

const EditorContainer = styled.div`
  width: 100%;
`;

const StyledToggle = styled(Toggle)`
  min-width: 176px;
`;

const StyledDropdown = styled(Dropdown)``;

const ProtocolYamlCard: React.FC<ProtocolYamlCardProps> = ({
  title,
  newVersionMode,
  onToggleNewVersionMode,
  versionOptions,
  selectedVersion,
  onVersionChange,
  onDeploy,
  yaml,
  onYamlChange,
}) => {
  return (
    <Container>
      <Header>
        <Title>{title}</Title>
        <Controls>
          <StyledToggle
            checked={newVersionMode}
            onChange={onToggleNewVersionMode}
            label="New Version Mode"
          />
          <Divider />
          <StyledDropdown
            options={versionOptions}
            value={selectedVersion}
            onChange={onVersionChange}
            size="small"
            width="120px"
          />
          <Button variant="primary" size="medium" onClick={onDeploy}>
            Deploy
          </Button>
        </Controls>
      </Header>
      <EditorContainer>
        <CodeEditor
          value={yaml}
          onChange={(v) => onYamlChange(v ?? "")}
          language="yaml"
          theme="light"
          onCopy={() => {}}
          onLaunch={() => {}}
        />
      </EditorContainer>
    </Container>
  );
};

export default ProtocolYamlCard;
