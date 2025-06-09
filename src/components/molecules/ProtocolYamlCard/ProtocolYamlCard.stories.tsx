import React, { useState } from "react";
import type { DropdownOption } from "./../../atoms/Dropdown";
import { ProtocolYamlCard } from "./ProtocolYamlCard";

export default {
  title: "Molecules/ProtocolYamlCard",
  component: ProtocolYamlCard,
};

const versionOptions: DropdownOption[] = [
  { value: "v0.0.1", label: "v0.0.1" },
  { value: "v0.0.0", label: "v0.0.0" },
];

const initialYaml = `protocolSchema: v3\nname: v3\ndescription: No description\nconfig: {}\nsteps: []\n`;

export const Default = () => {
  const [newVersionMode, setNewVersionMode] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState(
    versionOptions[0].value
  );
  const [yaml, setYaml] = useState(initialYaml);

  return (
    <ProtocolYamlCard
      title="Protocol Yaml"
      newVersionMode={newVersionMode}
      onToggleNewVersionMode={setNewVersionMode}
      versionOptions={versionOptions}
      selectedVersion={selectedVersion}
      onVersionChange={setSelectedVersion}
      onDeploy={() => alert("Deploy clicked!")}
      yaml={yaml}
      onYamlChange={setYaml}
    />
  );
};
