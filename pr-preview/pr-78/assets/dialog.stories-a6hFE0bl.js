import{j as e}from"./iframe-14YYbrss.js";import{B as i}from"./button-BSJeE99h.js";import{D as l,a as h,b as T,c as p,d as D,e as B,f as w,g as b,h as C}from"./dialog-kFPe969i.js";import"./preload-helper-BbFkF2Um.js";import"./index-B8eA1Gpy.js";import"./x-B6L8IQUu.js";import"./index-CKyK_5sn.js";import"./index-Bjo__dt-.js";const{expect:n,userEvent:y,waitFor:x,within:r}=__STORYBOOK_MODULE_TEST__,H={title:"Components/Dialog",component:l,parameters:{layout:"centered",docs:{story:{inline:!1,iframeHeight:400}}},tags:["autodocs"],argTypes:{showCloseButton:{control:{type:"boolean"}}},args:{showCloseButton:!0}};function v(a){const{...t}=a??{};return e.jsx(h,{open:!0,children:e.jsxs(l,{...t,children:[e.jsxs(p,{children:[e.jsx(D,{children:"Share workspace"}),e.jsx(B,{children:"Invite teammates, manage permissions, and choose the default access level for new collaborators."})]}),e.jsxs(w,{className:"grid gap-3 text-sm text-muted-foreground",children:[e.jsx("div",{className:"rounded-lg border p-3",children:"Members: 12 active users"}),e.jsx("div",{className:"rounded-lg border p-3",children:"Default role: Viewer"})]}),e.jsx(b,{children:e.jsx(i,{children:"Save changes"})})]})})}const c={render:v,parameters:{zephyr:{testCaseId:"SW-T1230"}},play:async({canvasElement:a,step:t})=>{const o=r(a.ownerDocument.body);await t("Dialog portal content renders",async()=>{n(o.getByRole("dialog")).toBeInTheDocument(),n(o.getByText("Share workspace")).toBeInTheDocument()}),await t("Description, body, and save action render",async()=>{n(o.getByText("Invite teammates, manage permissions, and choose the default access level for new collaborators.")).toBeInTheDocument(),n(o.getByText("Members: 12 active users")).toBeInTheDocument(),n(o.getByRole("button",{name:"Save changes"})).toBeInTheDocument()}),await t("Header close button is present",async()=>{n(o.getByRole("button",{name:"Close"})).toBeInTheDocument()}),await t("Dialog has correct data-slot on content",async()=>{const s=o.getByRole("dialog");n(s).toHaveAttribute("data-slot","dialog-content")})}},d={render:a=>{const{...t}=a??{};return e.jsx(h,{open:!0,children:e.jsxs(l,{...t,children:[e.jsxs(p,{children:[e.jsx(D,{children:"Share workspace"}),e.jsx(B,{children:"Invite teammates, manage permissions, and choose the default access level for new collaborators."})]}),e.jsxs(w,{className:"grid gap-3 text-sm text-muted-foreground",children:[e.jsx("div",{className:"rounded-lg border p-3",children:"Members: 12 active users"}),e.jsx("div",{className:"rounded-lg border p-3",children:"Default role: Viewer"})]}),e.jsx(b,{showCloseButton:!0,children:e.jsx(i,{children:"Save changes"})})]})})},parameters:{zephyr:{testCaseId:"SW-T1231"}},play:async({canvasElement:a,step:t})=>{const o=r(a.ownerDocument.body);await t("Dialog portal content renders",async()=>{n(o.getByRole("dialog")).toBeInTheDocument(),n(o.getByText("Share workspace")).toBeInTheDocument()}),await t("Footer close button and save button both render",async()=>{const s=o.getByText("Save changes").closest("[data-slot='dialog-footer']");n(r(s).getByRole("button",{name:"Close"})).toBeInTheDocument(),n(o.getByRole("button",{name:"Save changes"})).toBeInTheDocument()})}},g={args:{showCloseButton:!1},render:v,parameters:{zephyr:{testCaseId:"SW-T1232"}},play:async({canvasElement:a,step:t})=>{const o=r(a.ownerDocument.body);await t("Dialog portal content renders",async()=>{n(o.getByRole("dialog")).toBeInTheDocument(),n(o.getByText("Share workspace")).toBeInTheDocument()}),await t("Header close control is not shown",async()=>{n(o.queryByRole("button",{name:"Close"})).not.toBeInTheDocument()})}},u={render:()=>e.jsxs(h,{children:[e.jsx(T,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open Dialog"})}),e.jsxs(l,{children:[e.jsxs(p,{children:[e.jsx(D,{children:"Triggered dialog"}),e.jsx(B,{children:"This dialog was opened via a trigger button."})]}),e.jsxs(b,{children:[e.jsx(C,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Cancel"})}),e.jsx(i,{children:"Confirm"})]})]})]}),play:async({canvasElement:a,step:t})=>{const o=r(a),s=r(a.ownerDocument.body);await t("Trigger button renders and dialog is initially closed",async()=>{n(o.getByRole("button",{name:"Open Dialog"})).toBeInTheDocument(),n(s.queryByRole("dialog")).not.toBeInTheDocument()}),await t("Clicking trigger opens the dialog",async()=>{await y.click(o.getByRole("button",{name:"Open Dialog"})),n(s.getByRole("dialog")).toBeInTheDocument(),n(s.getByText("Triggered dialog")).toBeInTheDocument()}),await t("Dialog footer has cancel and confirm buttons",async()=>{n(s.getByRole("button",{name:"Cancel"})).toBeInTheDocument(),n(s.getByRole("button",{name:"Confirm"})).toBeInTheDocument()}),await t("Clicking cancel closes the dialog",async()=>{await y.click(s.getByRole("button",{name:"Cancel"})),await x(()=>{n(s.queryByRole("dialog")).not.toBeInTheDocument()})})},parameters:{zephyr:{testCaseId:"SW-T1478"}}},m={render:()=>e.jsxs(h,{children:[e.jsx(T,{asChild:!0,children:e.jsx(i,{variant:"outline",children:"Open"})}),e.jsx(l,{children:e.jsxs(p,{children:[e.jsx(D,{children:"Closable dialog"}),e.jsx(B,{children:"Click the X button to close this dialog."})]})})]}),play:async({canvasElement:a,step:t})=>{const o=r(a),s=r(a.ownerDocument.body);await t("Open the dialog",async()=>{await y.click(o.getByRole("button",{name:"Open"})),n(s.getByRole("dialog")).toBeInTheDocument()}),await t("Clicking the header close button closes the dialog",async()=>{await y.click(s.getByRole("button",{name:"Close"})),await x(()=>{n(s.queryByRole("dialog")).not.toBeInTheDocument()})})},parameters:{zephyr:{testCaseId:"SW-T1479"}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: renderDialog,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1230"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
      expect(body.getByText("Share workspace")).toBeInTheDocument();
    });
    await step("Description, body, and save action render", async () => {
      expect(body.getByText("Invite teammates, manage permissions, and choose the default access level for new collaborators.")).toBeInTheDocument();
      expect(body.getByText("Members: 12 active users")).toBeInTheDocument();
      expect(body.getByRole("button", {
        name: "Save changes"
      })).toBeInTheDocument();
    });
    await step("Header close button is present", async () => {
      expect(body.getByRole("button", {
        name: "Close"
      })).toBeInTheDocument();
    });
    await step("Dialog has correct data-slot on content", async () => {
      const dialog = body.getByRole("dialog");
      expect(dialog).toHaveAttribute("data-slot", "dialog-content");
    });
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: args => {
    const {
      ...contentArgs
    } = args ?? {};
    return <Dialog open>
        <DialogContent {...contentArgs}>
          <DialogHeader>
            <DialogTitle>Share workspace</DialogTitle>
            <DialogDescription>
              Invite teammates, manage permissions, and choose the default access level for new collaborators.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="grid gap-3 text-sm text-muted-foreground">
            <div className="rounded-lg border p-3">Members: 12 active users</div>
            <div className="rounded-lg border p-3">Default role: Viewer</div>
          </DialogBody>
          <DialogFooter showCloseButton>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>;
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1231"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
      expect(body.getByText("Share workspace")).toBeInTheDocument();
    });
    await step("Footer close button and save button both render", async () => {
      const footer = body.getByText("Save changes").closest("[data-slot='dialog-footer']")!;
      expect(within(footer).getByRole("button", {
        name: "Close"
      })).toBeInTheDocument();
      expect(body.getByRole("button", {
        name: "Save changes"
      })).toBeInTheDocument();
    });
  }
}`,...d.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    showCloseButton: false
  },
  render: renderDialog,
  parameters: {
    zephyr: {
      testCaseId: "SW-T1232"
    }
  },
  play: async ({
    canvasElement,
    step
  }) => {
    const body = within(canvasElement.ownerDocument.body);
    await step("Dialog portal content renders", async () => {
      expect(body.getByRole("dialog")).toBeInTheDocument();
      expect(body.getByText("Share workspace")).toBeInTheDocument();
    });
    await step("Header close control is not shown", async () => {
      expect(body.queryByRole("button", {
        name: "Close"
      })).not.toBeInTheDocument();
    });
  }
}`,...g.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Triggered dialog</DialogTitle>
          <DialogDescription>
            This dialog was opened via a trigger button.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Trigger button renders and dialog is initially closed", async () => {
      expect(canvas.getByRole("button", {
        name: "Open Dialog"
      })).toBeInTheDocument();
      expect(body.queryByRole("dialog")).not.toBeInTheDocument();
    });
    await step("Clicking trigger opens the dialog", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open Dialog"
      }));
      expect(body.getByRole("dialog")).toBeInTheDocument();
      expect(body.getByText("Triggered dialog")).toBeInTheDocument();
    });
    await step("Dialog footer has cancel and confirm buttons", async () => {
      expect(body.getByRole("button", {
        name: "Cancel"
      })).toBeInTheDocument();
      expect(body.getByRole("button", {
        name: "Confirm"
      })).toBeInTheDocument();
    });
    await step("Clicking cancel closes the dialog", async () => {
      await userEvent.click(body.getByRole("button", {
        name: "Cancel"
      }));
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1478"
    }
  }
}`,...u.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Closable dialog</DialogTitle>
          <DialogDescription>
            Click the X button to close this dialog.
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await step("Open the dialog", async () => {
      await userEvent.click(canvas.getByRole("button", {
        name: "Open"
      }));
      expect(body.getByRole("dialog")).toBeInTheDocument();
    });
    await step("Clicking the header close button closes the dialog", async () => {
      await userEvent.click(body.getByRole("button", {
        name: "Close"
      }));
      await waitFor(() => {
        expect(body.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  },
  parameters: {
    zephyr: {
      testCaseId: "SW-T1479"
    }
  }
}`,...m.parameters?.docs?.source}}};const W=["Default","FooterCloseButton","WithoutCloseButton","WithTrigger","CloseViaHeaderButton"];export{m as CloseViaHeaderButton,c as Default,d as FooterCloseButton,u as WithTrigger,g as WithoutCloseButton,W as __namedExportsOrder,H as default};
