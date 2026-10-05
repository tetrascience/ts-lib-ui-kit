import * as path from "node:path";
import { fileURLToPath } from "node:url";

import { Project } from "ts-morph";
import { describe, expect, it } from "vitest";

import { auditSourceFile, formatViolations } from "../audit-react18-compat";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * UXT-77: React 18 consumers (the TDP host and its Module Federation apps) lose
 * every `ref` passed to a kit component that is a plain function, and with it
 * Radix `asChild` trigger positioning, focus and outside-click handling.
 *
 * These fixtures prove each rule fires. The audit over the real component tree
 * runs as its own CI step (`yarn check:react18-compat` in the build job), not
 * here: it type-checks every component synchronously, and inside the combined
 * unit + Storybook coverage run that CPU load starved the Storybook browser
 * workers into Vitest's fixed 60s RPC timeout.
 */
describe("React 18 compatibility audit", () => {
  describe("rules", () => {
    const project = new Project({
      tsConfigFilePath: path.join(repoRoot, "tsconfig.json"),
      skipAddingFilesFromTsConfig: true,
    });

    const audit = (source: string) => {
      const file = project.createSourceFile(path.join(repoRoot, "src/components/__fixture__.tsx"), source, {
        overwrite: true,
      });
      return auditSourceFile(file, repoRoot);
    };

    const header = `import * as React from "react"\nimport { memo } from "react"\nimport { withRef } from "@/lib/react18-compat"\n`;

    it("flags function declarations and arrows whose props accept ref", { timeout: 60_000 }, () => {
      const { violations } = audit(`${header}
        export function Box(props: React.ComponentProps<"div">) { return <div {...props} /> }
        export const Row = (props: React.ComponentProps<"div">) => <div {...props} />
        export const Link: React.FC<React.ComponentProps<"a">> = (props) => <a {...props} />
        interface PanelProps extends React.HTMLAttributes<HTMLDivElement> { ref?: React.Ref<HTMLDivElement> }
        export function Panel({ ref, ...props }: PanelProps) { return <div ref={ref} {...props} /> }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Box", "unwrapped-ref"],
        ["Row", "unwrapped-ref"],
        ["Link", "unwrapped-ref"],
        ["Panel", "unwrapped-ref"],
      ]);
    });

    it("accepts X19 declarations exported through withRef, and components without ref", () => {
      const { wrapped, violations } = audit(`${header}
        function Box19(props: React.ComponentProps<"div">) { return <div {...props} /> }
        export const Box = withRef("Box", Box19)
        const Row19 = memo((props: React.ComponentProps<"div">) => <div {...props} />)
        export const Row = memo(withRef("Row", Row19.type))
        export const Icon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => <svg ref={ref} {...props} />)
        const TetraScienceIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => <svg ref={ref} {...props} />)
        export { TetraScienceIcon }
        export function Label({ text }: { text: string }) { return <span>{text}</span> }
        export const Count = ({ n }: { n: number }) => <b>{n}</b>
        export function useThing() { return 1 }
      `);
      // Icon is a new direct forwardRef; TetraScienceIcon predates the rule and is allowed.
      expect(violations.map((v) => [v.name, v.kind])).toEqual([["Icon", "direct-forward-ref"]]);
      expect(wrapped).toEqual(["src/components/__fixture__.tsx:Box", "src/components/__fixture__.tsx:Row"]);
    });

    it("requires withRef to export the React 19 declaration by its X19 name", () => {
      const { violations } = audit(`${header}
        export const Inline = withRef("Inline", function Inline(props: React.ComponentProps<"div">) { return <div {...props} /> })
        function Other(props: React.ComponentProps<"div">) { return <div {...props} /> }
        export const Misnamed = withRef("Misnamed", Other)
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Inline", "render-name"],
        ["Misnamed", "render-name"],
      ]);
    });

    it("flags DOM props without ref unless the component is a documented exception", () => {
      const { excepted, violations } = audit(`${header}
        export function Chip(props: React.HTMLAttributes<HTMLSpanElement>) { return <span {...props} /> }
        export const Conversation = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />
        export function NavItem({ onClick }: { onClick: () => void }) { return <button onClick={onClick} /> }
        function Tag19(props: React.HTMLAttributes<HTMLSpanElement>) { return <span {...props} /> }
        export const Tag = withRef("Tag", Tag19)
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Chip", "dom-props-without-ref"],
        ["Tag", "dom-props-without-ref"],
      ]);
      expect(excepted).toEqual(["Conversation"]);
    });

    it("flags direct forwardRef, a mismatched display name and boolean inert", () => {
      const { violations } = audit(`${header}
        export const Box = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>((props, ref) => <div ref={ref} {...props} />)
        function Row19(props: React.ComponentProps<"div">) { return <div {...props} /> }
        export const Row = withRef("Rwo", Row19)
        export function Nav({ hidden }: { hidden: boolean }) { return <nav inert={hidden} /> }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Box", "direct-forward-ref"],
        ["Row", "display-name"],
        ["inert", "boolean-inert"],
      ]);
      expect(formatViolations(violations)).toMatch(
        /^src\/components\/__fixture__\.tsx:\d+ Row \[display-name\] withRef display name is "Rwo"; expected "Row"$/m,
      );
    });
  });
});
