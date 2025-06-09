import React, { useState } from "react"
import { withStreamlitConnection } from "streamlit-component-lib"
import {
  Card,
  Checkbox,
  CodeEditor,
  Dropdown,
  ErrorAlert,
  Icon,
  MenuItem,
  Input,
  MarkdownDisplay,
  Textarea,
  Toggle,
  Tooltip,
  PopConfirm,
  Toast,
  SupportiveText,
  Tab,
  Modal,
} from "tetrascience-ui"
import { ButtonControl, IconName } from "tetrascience-ui"
import { Button } from "tetrascience-ui"
import { Badge } from "tetrascience-ui"
import { Label } from "tetrascience-ui"
import "./AtomsShowcase.scss"

const AtomsShowcase = ({ args }: { args: { name: string } }) => {
  const { name } = args
  const [isChecked, setIsChecked] = useState(false)
  const [toggleValue, setToggleValue] = useState(false)
  const [textareaValue, setTextareaValue] = useState("")
  const [codeValue, setCodeValue] = useState("print('Hello World')")
  const [dropdownValue, setDropdownValue] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  return (
    <div>
      <h2 className="title">Atoms Showcase</h2>

      <div>
        <div className="item">
          <Label>Badge Example:</Label>
          <Badge>Hello</Badge>
        </div>

        <div className="item">
          <Label>Button Example:</Label>
          Hello, {name}! &nbsp;
          <Button variant="primary" size="small">
            Click Me!
          </Button>
        </div>

        <div className="item">
          <Label>ButtonControl Example:</Label>
          <ButtonControl icon={<Icon name={IconName.CHECK} />}></ButtonControl>
        </div>

        <div className="item">
          <Label>Card Example:</Label>
          <Card title="Sample Card" variant="outlined" size="medium">
            <p>
              This is a sample Card component from tetrascience-ui. Cards are
              useful for grouping related content.
            </p>
          </Card>
        </div>

        <div className="item">
          <Label>Checkbox Example:</Label>
          <Checkbox
            checked={isChecked}
            onChange={setIsChecked}
            label="Toggle this checkbox"
          />
        </div>

        <div className="item">
          <Label>Toggle Example:</Label>
          <Toggle
            checked={toggleValue}
            onChange={setToggleValue}
            label="Toggle switch"
          />
        </div>

        <div className="item">
          <Label>Input Example:</Label>
          <Input placeholder="Enter your name" value={name} />
        </div>

        <div className="item">
          <Label>Textarea Example:</Label>
          <Textarea
            placeholder="Enter your thoughts here..."
            value={textareaValue}
            onChange={(e) => setTextareaValue(e.target.value)}
            rows={3}
          />
        </div>

        <div className="item">
          <Label>Tooltip Example:</Label>
          <Tooltip content="This is a helpful tooltip">
            <Button variant="secondary" size="small">
              Hover for tooltip
            </Button>
          </Tooltip>
        </div>

        <div className="item">
          <Label>Code Editor Example:</Label>
          <CodeEditor
            value={codeValue}
            onChange={(value) => setCodeValue(value || "")}
            language="python"
            height="100px"
          />
        </div>

        <div className="item">
          <Label>Dropdown Example:</Label>
          <Dropdown
            placeholder="Select an option"
            value={dropdownValue}
            onChange={(value) => setDropdownValue(value || "")}
            options={[
              { label: "Option 1", value: "option1" },
              { label: "Option 2", value: "option2" },
              { label: "Option 3", value: "option3" },
            ]}
          />
        </div>

        <div className="item">
          <Label>Error Alert Example:</Label>
          <ErrorAlert error="This is an error alert example" />
        </div>

        <div className="item">
          <Label>Markdown Display Example:</Label>
          <MarkdownDisplay
            markdown={`# Welcome to Markdown Display

This is a component for rendering Markdown with Ant Design styling.

## Features

-   **Styled with Ant Design:** Uses Ant Design's Typography component for consistent styling.
-   **GitHub Flavored Markdown:** Supports GFM features like:
    -   Task lists:
        -   [x] Completed task
        -   [ ] Incomplete task
    -   Tables:

        | Header 1 | Header 2 |
        | -------- | -------- |
        | Cell 1   | Cell 2   |
        | Cell 3   | Cell 4   |`}
          />
        </div>

        <div className="item">
          <Label>Menu Item Example:</Label>
          <MenuItem
            label="Sample Menu Item"
            onClick={() => console.log("Menu item clicked")}
          />
        </div>

        <div className="item">
          <Label>Modal Example:</Label>

          <div className="button-wrapper">
            <Button
              variant="primary"
              size="small"
              onClick={() => setShowModal(true)}
            >
              Open Modal
            </Button>
            <PopConfirm
              title="Are you sure?"
              description="This action cannot be undone."
              onConfirm={() => console.log("Confirmed")}
              onCancel={() => console.log("Cancelled")}
            >
              <Button variant="secondary" size="small">
                PopConfirm Example
              </Button>
            </PopConfirm>
            <Button
              variant="primary"
              size="small"
              onClick={() => setShowToast(!showToast)}
            >
              Toggle Toast
            </Button>
          </div>
        </div>

        {showModal && (
          <Modal
            title="Sample Modal"
            isOpen={showModal}
            onClose={() => setShowModal(false)}
            onConfirm={() => setShowModal(false)}
          >
            <p>This is a modal dialog example.</p>
          </Modal>
        )}

        {showToast && (
          <Toast
            type="success"
            heading="Success!"
            description="This is a success toast!"
          />
        )}

        <SupportiveText>
          This is supportive text to help explain something.
        </SupportiveText>

        <Tab
          label="Sample Tab"
          active={true}
          onClick={() => console.log("Tab clicked")}
        />
      </div>
    </div>
  )
}

export default withStreamlitConnection(AtomsShowcase)
