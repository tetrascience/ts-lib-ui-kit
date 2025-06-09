import React, { useState } from "react"
import { withStreamlitConnection } from "streamlit-component-lib"
import { AppHeader, IconName, ProtocolYamlCard, Sidebar } from "tetrascience-ui"
import { Label } from "tetrascience-ui"
import "./MoleculesShowcase.scss"

const MoleculesShowcase = ({ args }: { args: { name: string } }) => {
  const yaml = `name: My Protocol
steps:
  - name: Step 1
    description: This is step 1`

  return (
    <div className="molecules-showcase">
      <h2 className="title">Molecules Showcase</h2>

      <div>
        <div className="item">
          <Label>App Header Example:</Label>
          <AppHeader
            hostname="localhost"
            userProfile={{
              name: "John Doe",
              avatar: "https://via.placeholder.com/150",
            }}
          />
        </div>

        <div className="item">
          <Label>Protocol Yaml Card Example:</Label>
          <ProtocolYamlCard
            yaml={yaml}
            title="My Protocol"
            newVersionMode={true}
            selectedVersion="v1"
            versionOptions={[
              { label: "v1", value: "v1" },
              { label: "v2", value: "v2" },
            ]}
            onToggleNewVersionMode={() => {}}
            onVersionChange={() => {}}
            onDeploy={() => console.log("deploy")}
            onYamlChange={() => {}}
          />
        </div>
      </div>
    </div>
  )
}

export default withStreamlitConnection(MoleculesShowcase)
