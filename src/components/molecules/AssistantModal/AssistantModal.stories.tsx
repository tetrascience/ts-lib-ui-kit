import React, { useState } from "react";
import { AssistantModal } from "./AssistantModal";

export default {
  title: "Molecules/AssistantModal",
  component: AssistantModal,
};

export const Default = () => {
  const [open, setOpen] = useState(false);
  const [lastCode, setLastCode] = useState("");
  const [lastInput, setLastInput] = useState("");

  return (
    <div>
      <button onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Open Assistant Modal
      </button>
      <AssistantModal
        open={open}
        title="Tetrascience Assistant"
        prompt="Here you may ask questions about task scripts, protocols, and pipelines."
        initialCode={lastCode || "Description\n"}
        userQuery={`Please generate an example protocol v3 yaml for Tecan D300e and PerkinElmer EnVision to Dotmatics`}
        onCopy={(code) => {
          setLastCode(code);
          alert("Copied code: " + code);
        }}
        onLaunch={(code) => {
          alert("Launch with code: " + code);
        }}
        onSend={(input) => {
          setLastInput(input);
          alert("Sent input: " + input);
        }}
        onCancel={() => {
          setOpen(false);
        }}
      />
      {lastCode && (
        <div style={{ marginTop: 16 }}>
          <strong>Last Code:</strong>
          <pre style={{ background: "#f5f5f5", padding: 8, borderRadius: 4 }}>
            {lastCode}
          </pre>
        </div>
      )}
      {lastInput && (
        <div style={{ marginTop: 8 }}>
          <strong>Last Input:</strong> {lastInput}
        </div>
      )}
    </div>
  );
};
