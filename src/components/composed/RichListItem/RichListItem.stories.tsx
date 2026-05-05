import { MoreHorizontal } from "lucide-react";

import { RichListItem, RichListItemAvatar } from "./RichListItem";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const meta: Meta<typeof RichListItem> = {
  title: "Composed/RichListItem",
  component: RichListItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div className="w-[480px] rounded-lg border bg-card">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    leading: <RichListItemAvatar initials="JS" />,
    primary: "Dr. Jane Smith",
    secondary: "Principal Scientist · Biology Platform",
    trailing: (
      <>
        <span className="text-xs text-muted-foreground">Last active 2h ago</span>
        <Badge variant="positive" className="text-xs">
          Active
        </Badge>
      </>
    ),
    actions: (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
  },
};

export const TeamList: Story = {
  render: () => {
    const members = [
      {
        initials: "JS",
        name: "Dr. Jane Smith",
        role: "Principal Scientist · Biology Platform",
        meta: "Last active 2h ago",
        status: "Active",
        statusVariant: "positive" as const,
        color: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
      },
      {
        initials: "MT",
        name: "Mark Thompson",
        role: "Data Engineer · Informatics",
        meta: "Last active 5h ago",
        status: "Active",
        statusVariant: "positive" as const,
        color: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      },
      {
        initials: "SC",
        name: "Sarah Chen",
        role: "Research Associate · Chemistry",
        meta: "Invited 3 days ago",
        status: "Invited",
        statusVariant: "warning" as const,
        color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
      },
      {
        initials: "RJ",
        name: "Robert Johnson",
        role: "Lab Manager · Operations",
        meta: "Inactive since Jan 2024",
        status: "Inactive",
        statusVariant: "outline" as const,
        color: "",
      },
    ];

    return (
      <div className="divide-y divide-border">
        {members.map((m, i) => (
          <RichListItem
            key={i}
            leading={
              <RichListItemAvatar
                initials={m.initials}
                className={m.color || undefined}
              />
            }
            primary={m.name}
            secondary={m.role}
            trailing={
              <>
                <span className="text-xs text-muted-foreground">{m.meta}</span>
                <Badge variant={m.statusVariant}>{m.status}</Badge>
              </>
            }
            actions={
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
        ))}
      </div>
    );
  },
};

export const MinimalList: Story = {
  render: () => (
    <div className="divide-y divide-border">
      {["Dataset Alpha", "Dataset Beta", "Dataset Gamma"].map((name) => (
        <RichListItem
          key={name}
          primary={name}
          secondary="Last modified 1 day ago"
          trailing={<Badge variant="secondary">CSV</Badge>}
        />
      ))}
    </div>
  ),
};
