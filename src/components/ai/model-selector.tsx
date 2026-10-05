import type { ComponentProps, ReactNode } from "react";

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";
import { withRef } from "@/lib/react18-compat";
import { cn } from "@/lib/utils";

export type ModelSelectorProps = ComponentProps<typeof Dialog>;

export const ModelSelector = (props: ModelSelectorProps) => (
  <Dialog {...props} />
);

export type ModelSelectorTriggerProps = ComponentProps<typeof DialogTrigger>;

const ModelSelectorTrigger19 = (props: ModelSelectorTriggerProps) => (
  <DialogTrigger {...props} />
);

export const ModelSelectorTrigger = withRef("ModelSelectorTrigger", ModelSelectorTrigger19);

export type ModelSelectorContentProps = ComponentProps<typeof DialogContent> & {
  title?: ReactNode;
};

const ModelSelectorContent19 = ({
  className,
  children,
  title = "Model Selector",
  ...props
}: ModelSelectorContentProps) => (
  <DialogContent
    aria-describedby={undefined}
    className={cn(
      "outline! border-none! p-0 outline-border! outline-solid!",
      className
    )}
    {...props}
  >
    <DialogTitle className="sr-only">{title}</DialogTitle>
    <Command className="**:data-[slot=command-input-wrapper]:h-auto">
      {children}
    </Command>
  </DialogContent>
);

export const ModelSelectorContent = withRef("ModelSelectorContent", ModelSelectorContent19);

export type ModelSelectorDialogProps = ComponentProps<typeof CommandDialog>;

export const ModelSelectorDialog = (props: ModelSelectorDialogProps) => (
  <CommandDialog {...props} />
);

export type ModelSelectorInputProps = ComponentProps<typeof CommandInput>;

const ModelSelectorInput19 = ({
  className,
  ...props
}: ModelSelectorInputProps) => (
  <CommandInput className={cn("h-auto py-3.5", className)} {...props} />
);

export const ModelSelectorInput = withRef("ModelSelectorInput", ModelSelectorInput19);

export type ModelSelectorListProps = ComponentProps<typeof CommandList>;

const ModelSelectorList19 = (props: ModelSelectorListProps) => (
  <CommandList {...props} />
);

export const ModelSelectorList = withRef("ModelSelectorList", ModelSelectorList19);

export type ModelSelectorEmptyProps = ComponentProps<typeof CommandEmpty>;

const ModelSelectorEmpty19 = (props: ModelSelectorEmptyProps) => (
  <CommandEmpty {...props} />
);

export const ModelSelectorEmpty = withRef("ModelSelectorEmpty", ModelSelectorEmpty19);

export type ModelSelectorGroupProps = ComponentProps<typeof CommandGroup>;

const ModelSelectorGroup19 = (props: ModelSelectorGroupProps) => (
  <CommandGroup {...props} />
);

export const ModelSelectorGroup = withRef("ModelSelectorGroup", ModelSelectorGroup19);

export type ModelSelectorItemProps = ComponentProps<typeof CommandItem>;

const ModelSelectorItem19 = (props: ModelSelectorItemProps) => (
  <CommandItem {...props} />
);

export const ModelSelectorItem = withRef("ModelSelectorItem", ModelSelectorItem19);

export type ModelSelectorShortcutProps = ComponentProps<typeof Kbd>;

const ModelSelectorShortcut19 = ({
  className,
  ...props
}: ModelSelectorShortcutProps) => (
  <Kbd className={cn("ml-auto", className)} {...props} />
);

export const ModelSelectorShortcut = withRef("ModelSelectorShortcut", ModelSelectorShortcut19);

export type ModelSelectorSeparatorProps = ComponentProps<
  typeof CommandSeparator
>;

const ModelSelectorSeparator19 = (props: ModelSelectorSeparatorProps) => (
  <CommandSeparator {...props} />
);

export const ModelSelectorSeparator = withRef("ModelSelectorSeparator", ModelSelectorSeparator19);

export type ModelSelectorLogoProps = Omit<
  ComponentProps<"img">,
  "src" | "alt"
> & {
  provider:
    | "moonshotai-cn"
    | "lucidquery"
    | "moonshotai"
    | "zai-coding-plan"
    | "alibaba"
    | "xai"
    | "vultr"
    | "nvidia"
    | "upstage"
    | "groq"
    | "github-copilot"
    | "mistral"
    | "vercel"
    | "nebius"
    | "deepseek"
    | "alibaba-cn"
    | "google-vertex-anthropic"
    | "venice"
    | "chutes"
    | "cortecs"
    | "github-models"
    | "togetherai"
    | "azure"
    | "baseten"
    | "huggingface"
    | "opencode"
    | "fastrouter"
    | "google"
    | "google-vertex"
    | "cloudflare-workers-ai"
    | "inception"
    | "wandb"
    | "openai"
    | "zhipuai-coding-plan"
    | "perplexity"
    | "openrouter"
    | "zenmux"
    | "v0"
    | "iflowcn"
    | "synthetic"
    | "deepinfra"
    | "zhipuai"
    | "submodel"
    | "zai"
    | "inference"
    | "requesty"
    | "morph"
    | "lmstudio"
    | "anthropic"
    | "aihubmix"
    | "fireworks-ai"
    | "modelscope"
    | "llama"
    | "scaleway"
    | "amazon-bedrock"
    | "cerebras"
    // oxlint-disable-next-line typescript-eslint(ban-types) -- intentional pattern for autocomplete-friendly string union
    | (string & {});
};

const ModelSelectorLogo19 = ({
  provider,
  className,
  ...props
}: ModelSelectorLogoProps) => (
  <img
    {...props}
    alt={`${provider} logo`}
    className={cn("size-3 dark:invert", className)}
    height={12}
    src={`https://models.dev/logos/${provider}.svg`}
    width={12}
  />
);

export const ModelSelectorLogo = withRef("ModelSelectorLogo", ModelSelectorLogo19);

export type ModelSelectorLogoGroupProps = ComponentProps<"div">;

const ModelSelectorLogoGroup19 = ({
  className,
  ...props
}: ModelSelectorLogoGroupProps) => (
  <div
    className={cn(
      "flex shrink-0 items-center -space-x-1 [&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 dark:[&>img]:bg-foreground",
      className
    )}
    {...props}
  />
);

export const ModelSelectorLogoGroup = withRef("ModelSelectorLogoGroup", ModelSelectorLogoGroup19);

export type ModelSelectorNameProps = ComponentProps<"span">;

const ModelSelectorName19 = ({
  className,
  ...props
}: ModelSelectorNameProps) => (
  <span className={cn("flex-1 truncate text-left", className)} {...props} />
);

export const ModelSelectorName = withRef("ModelSelectorName", ModelSelectorName19);
