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

    it("accepts components wrapped and exported as XWithRef, and components without ref", () => {
      const { wrapped, violations } = audit(`${header}
        function Box(props: React.ComponentProps<"div">) { return <div {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const BoxWithRef = withRef("Box", Box)
        export { BoxWithRef as Box }
        const Row = memo((props: React.ComponentProps<"div">) => <div {...props} />)
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const RowWithRef = memo(withRef("Row", Row.type))
        export { RowWithRef as Row }
        function Internal(props: React.ComponentProps<"div">) { return <div {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const InternalWithRef = withRef("Internal", Internal)
        export function Panel() { return <><InternalWithRef /><BoxWithRef /></> }
        export const Icon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => <svg ref={ref} {...props} />)
        const TetraScienceIcon = React.forwardRef<SVGSVGElement, React.ComponentProps<"svg">>((props, ref) => <svg ref={ref} {...props} />)
        export { TetraScienceIcon }
        export function Label({ text }: { text: string }) { return <span>{text}</span> }
        export const Count = ({ n }: { n: number }) => <b>{n}</b>
        export function useThing() { return 1 }
      `);
      // Icon is a new direct forwardRef; TetraScienceIcon predates the rule and is allowed.
      // Internal is never exported; it only needs a wrapper because Panel renders it.
      expect(violations.map((v) => [v.name, v.kind])).toEqual([["Icon", "direct-forward-ref"]]);
      expect(wrapped).toEqual([
        "src/components/__fixture__.tsx:Box",
        "src/components/__fixture__.tsx:Row",
        "src/components/__fixture__.tsx:Internal",
      ]);
    });

    it("requires each wrapper to be XWithRef around X itself", () => {
      const { violations } = audit(`${header}
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        export const InlineWithRef = withRef("Inline", function Inline(props: React.ComponentProps<"div">) { return <div {...props} /> })
        function Other(props: React.ComponentProps<"div">) { return <div {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        export const MisnamedWithRef = withRef("Misnamed", Other)
        function Thing(props: React.ComponentProps<"div">) { return <div {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const ThingWrapped = withRef("Thing", Thing)
        export { ThingWrapped as Thing }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["InlineWithRef", "render-name"],
        ["MisnamedWithRef", "render-name"],
        ["ThingWrapped", "wrapper-name"],
      ]);
      expect(formatViolations(violations)).toMatch(
        /^src\/components\/__fixture__\.tsx:\d+ ThingWrapped \[wrapper-name\] the wrapper for Thing must be named ThingWithRef$/m,
      );
    });

    it("flags an unwrapped export, and every same-file use of the plain component", () => {
      const { violations } = audit(`${header}
        function Box(props: React.ComponentProps<"div">) { return <div {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const BoxWithRef = withRef("Box", Box)
        export { Box }
        function Item(props: React.ComponentProps<"button">) { return <button {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const ItemWithRef = withRef("Item", Item)
        export { ItemWithRef as Item }
        function Hidden(props: React.ComponentProps<"span">) { return <span {...props} /> }
        declare const Trigger: React.FC<{ asChild?: boolean; children?: React.ReactNode }>
        export function Menu() {
          const ref = React.useRef<HTMLButtonElement>(null)
          return (
            <>
              <Trigger asChild><Item /></Trigger>
              <Item ref={ref} />
              <Trigger asChild><ItemWithRef /></Trigger>
              <Trigger asChild><Hidden /></Trigger>
              <Item>fine without a ref</Item>
            </>
          )
        }
        function Forwarding(props: React.ComponentProps<"button">) { return <Item {...props} /> }
        function Styled({ ref, ...rest }: React.ComponentProps<"button">) { void ref; return <Item {...rest} /> }
      `);
      const counts: Record<string, number> = {};
      for (const v of violations) counts[`${v.name} ${v.kind}`] = (counts[`${v.name} ${v.kind}`] ?? 0) + 1;
      // Item: under asChild, with a ref prop, plain children, spread with and without ref.
      // ItemWithRef is the only in-file use that passes.
      expect(counts).toEqual({
        "Box exported-unwrapped": 1,
        "Item same-file-unwrapped": 5,
        "Hidden same-file-unwrapped": 1,
      });
    });

    it("flags DOM props without ref unless the component is a documented exception", () => {
      const { excepted, violations } = audit(`${header}
        export function Chip(props: React.HTMLAttributes<HTMLSpanElement>) { return <span {...props} /> }
        export const Conversation = (props: React.HTMLAttributes<HTMLDivElement>) => <div {...props} />
        export function NavItem({ onClick }: { onClick: () => void }) { return <button onClick={onClick} /> }
        function Tag(props: React.HTMLAttributes<HTMLSpanElement>) { return <span {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const TagWithRef = withRef("Tag", Tag)
        export { TagWithRef as Tag }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Chip", "dom-props-without-ref"],
        ["Tag", "dom-props-without-ref"],
      ]);
      expect(excepted).toEqual(["Conversation"]);
    });

    it("flags every value use of a wrapped plain component, in any identity form", () => {
      const { violations } = audit(`${header}
        import { isElementOfType } from "@/lib/react18-compat"
        /** Doc mentioning {@link Separator} is fine. */
        function Separator(props: React.ComponentProps<"hr">) { return <hr {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const SeparatorWithRef = withRef("Separator", Separator)
        Separator.displayName = "Separator"
        export { SeparatorWithRef as Separator }
        type SeparatorProps = React.ComponentProps<typeof Separator>
        export function a(child: React.ReactElement) { return child.type === Separator }
        export function b(child: React.ReactElement) { switch (child.type) { case Separator: return true; default: return false } }
        export function c(child: React.ReactElement) { return [Separator].includes(child.type as never) }
        export function d(child: React.ReactElement) { return Object.is(child.type, Separator) }
        export function ok(child: React.ReactElement, _p?: SeparatorProps) { return isElementOfType(child, Separator) }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Separator", "plain-reference"],
        ["Separator", "plain-reference"],
        ["Separator", "plain-reference"],
        ["Separator", "plain-reference"],
      ]);
    });

    it("flags an internal ref and a ref-carrying spread on one element", () => {
      const { violations } = audit(`${header}
        import { useComposedRefs } from "@/lib/compose-refs"
        export function Before(props: { label: string } & { ref?: React.Ref<HTMLDivElement> }) {
          const own = React.useRef<HTMLDivElement>(null)
          return <div ref={own} {...props} />
        }
        export function After(props: { ref?: React.Ref<HTMLDivElement> }) {
          const own = React.useRef<HTMLDivElement>(null)
          return <div {...props} ref={own} />
        }
        export function Composed({ ref, ...props }: { label?: string; ref?: React.Ref<HTMLDivElement> }) {
          const own = React.useRef<HTMLDivElement>(null)
          return <div ref={useComposedRefs(own, ref)} {...props} />
        }
      `);
      const clobbered = violations.filter((v) => v.kind === "ref-clobbered");
      expect(clobbered.map((v) => v.detail.match(/so (.*) is lost/)?.[1])).toEqual([
        "the component's own ref",
        "the consumer's ref",
      ]);
    });

    it("requires the React 18 marker directly above each wrapper", () => {
      const { violations } = audit(`${header}
        function Plain(props: React.ComponentProps<"div">) { return <div {...props} /> }
        const PlainWithRef = withRef("Plain", Plain)
        function Doc(props: React.ComponentProps<"div">) { return <div {...props} /> }
        /** React 18 wrapper for {@link Doc}; see its documentation. */
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        const DocWithRef = withRef("Doc", Doc)
        function Late(props: React.ComponentProps<"div">) { return <div {...props} /> }
        // React 18 compatibility: forwards \`ref\` on React 18. Deprecated in a future release.
        /** The marker is not the last comment here. */
        const LateWithRef = withRef("Late", Late)
        export { PlainWithRef as Plain, DocWithRef as Doc, LateWithRef as Late }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["PlainWithRef", "missing-marker"],
        ["LateWithRef", "missing-marker"],
      ]);
    });

    it("flags direct forwardRef and boolean inert", () => {
      const { violations } = audit(`${header}
        export const Box = React.forwardRef<HTMLDivElement, React.ComponentProps<"div">>((props, ref) => <div ref={ref} {...props} />)
        export function Nav({ hidden }: { hidden: boolean }) { return <nav inert={hidden} /> }
      `);
      expect(violations.map((v) => [v.name, v.kind])).toEqual([
        ["Box", "direct-forward-ref"],
        ["inert", "boolean-inert"],
      ]);
    });
  });
});
