import {
  Accessibility,
  BarChart3,
  LayoutDashboard,
  Moon,
  Puzzle,
  Sparkles,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

function Github({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.47.11-3.07 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.6.24 2.78.12 3.07.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.26 5.68.41.36.77 1.06.77 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56 4.56-1.52 7.85-5.83 7.85-10.91C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  )
}

import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card"
import { Separator } from "./ui/separator"


import type { Meta, StoryObj } from "@storybook/react-vite"

const VERSION = "0.5.0"
const PKG_NAME = "@tetrascience-npm/tetrascience-react-ui"

/** Detect dark mode by watching <html> class and URL globals */
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) return true
    if (typeof window !== "undefined") {
      return window.location.href.includes("theme:dark") || window.location.href.includes("theme%3Adark")
    }
    return false
  })

  useEffect(() => {
    const html = document.documentElement
    const update = () => {
      const hasDarkClass = html.classList.contains("dark")
      const hasDarkUrl = window.location.href.includes("theme:dark") || window.location.href.includes("theme%3Adark")
      setIsDark(hasDarkClass || hasDarkUrl)
    }

    // Watch for class changes on <html> (decorators toggle .dark)
    const mo = new MutationObserver(update)
    mo.observe(html, { attributes: true, attributeFilter: ["class"] })

    // Watch for Storybook URL changes (globals in hash/search)
    const onUrlChange = () => update()
    window.addEventListener("popstate", onUrlChange)
    window.addEventListener("hashchange", onUrlChange)

    update()
    return () => {
      mo.disconnect()
      window.removeEventListener("popstate", onUrlChange)
      window.removeEventListener("hashchange", onUrlChange)
    }
  }, [])

  return isDark
}

/*
 * Canvas-based animated hero backgrounds.
 *
 * Light mode: Bokeh Wave — soft blue bokeh circles with flowing particle waves.
 * Dark mode:  Neon Helix — 3D parametric particle helix with depth glow.
 *
 * Brand palette:
 *  Blue 500  #2F45B5   Light Blue 300 #549DFF
 *  Off Black 500  #0B112D
 */

/** Shared canvas resize handler — wires canvas dimensions to a mutable w/h pair */
function makeResizer(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  dpr: number,
  setDims: (w: number, h: number) => void
): () => void {
  return function () {
    const parent = canvas.parentElement
    if (!parent) return
    const w = parent.clientWidth
    const h = parent.clientHeight
    if (w === 0 || h === 0) return
    canvas.width = w * dpr
    canvas.height = h * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    setDims(w, h)
  }
}

/** Bokeh Wave canvas — light mode hero background */
function BokehWaveCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    let w = 0
    let h = 0
    let raf = 0

    const resize = makeResizer(canvas, ctx, dpr, (nw, nh) => { w = nw; h = nh })

    // Watch for visibility changes (hidden → visible on theme toggle)
    const ro = new ResizeObserver(() => resize())
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // Bokeh circles
    const bokehs = Array.from({ length: 25 }, () => ({
      x: Math.random() * 1.2 - 0.1,
      y: Math.random() * 1.2 - 0.1,
      r: 20 + Math.random() * 70,
      vx: (Math.random() - 0.5) * 0.00008,
      vy: (Math.random() - 0.5) * 0.00006,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.0005 + Math.random() * 0.001,
      color: [
        [140, 190, 250], [100, 170, 245], [170, 210, 255],
        [80, 155, 235], [190, 215, 250], [120, 180, 248],
      ][Math.floor(Math.random() * 6)],
      opacity: 0.03 + Math.random() * 0.07,
    }))

    // Wave particles
    const waveParticles = Array.from({ length: 200 }, (_, i) => ({
      offset: i / 200,
      size: 1 + Math.random() * 2.5,
      yJitter: (Math.random() - 0.5) * 30,
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.003 + Math.random() * 0.008,
      color: [
        [200, 230, 255], [160, 210, 255], [255, 255, 255],
        [130, 195, 250], [180, 220, 255],
      ][Math.floor(Math.random() * 5)],
      alpha: 0.3 + Math.random() * 0.5,
    }))

    function getWaveY(xFrac: number, time: number, base: number, amp: number, freq: number, speed: number) {
      return (
        base +
        Math.sin(xFrac * Math.PI * 2 * freq + time * speed) * amp +
        Math.sin(xFrac * Math.PI * 2 * freq * 2.3 + time * speed * 0.7) * amp * 0.3 +
        Math.cos(xFrac * Math.PI * 2 * freq * 0.6 + time * speed * 1.3) * amp * 0.2
      )
    }

    function draw(t: number) {
      const time = t * 0.001
      // Background gradient
      const bg = ctx!.createRadialGradient(w * 0.4, h * 0.4, 0, w * 0.5, h * 0.5, w * 0.8)
      bg.addColorStop(0, "#c8ddf5")
      bg.addColorStop(0.3, "#a8c8ec")
      bg.addColorStop(0.6, "#88b4e2")
      bg.addColorStop(1, "#6a9ed6")
      ctx!.fillStyle = bg
      ctx!.fillRect(0, 0, w, h)

      // Warm light spot
      const warm = ctx!.createRadialGradient(w * 0.6, h * 0.35, 0, w * 0.6, h * 0.35, w * 0.3)
      warm.addColorStop(0, "rgba(240,230,250,0.2)")
      warm.addColorStop(0.4, "rgba(220,210,240,0.08)")
      warm.addColorStop(1, "rgba(200,200,230,0)")
      ctx!.fillStyle = warm
      ctx!.fillRect(0, 0, w, h)

      // Draw bokeh circles
      for (const b of bokehs) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < -0.15 || b.x > 1.15) b.vx *= -1
        if (b.y < -0.15 || b.y > 1.15) b.vy *= -1
        const pulse = 0.7 + Math.sin(t * b.pulseSpeed + b.phase) * 0.3
        const bx = b.x * w
        const by = b.y * h
        const br = b.r * pulse
        const [r, g, bl] = b.color
        const alpha = b.opacity * pulse
        const grad = ctx!.createRadialGradient(bx, by, br * 0.1, bx, by, br)
        grad.addColorStop(0, `rgba(${r},${g},${bl},${alpha * 0.6})`)
        grad.addColorStop(0.6, `rgba(${r},${g},${bl},${alpha * 0.3})`)
        grad.addColorStop(0.85, `rgba(${r},${g},${bl},${alpha * 0.15})`)
        grad.addColorStop(1, `rgba(${r},${g},${bl},0)`)
        ctx!.fillStyle = grad
        ctx!.beginPath()
        ctx!.arc(bx, by, br, 0, Math.PI * 2)
        ctx!.fill()
        // Ring edge
        ctx!.beginPath()
        ctx!.arc(bx, by, br * 0.85, 0, Math.PI * 2)
        ctx!.strokeStyle = `rgba(${r},${g},${bl},${alpha * 0.2})`
        ctx!.lineWidth = 1.5
        ctx!.stroke()
      }

      // Wave glow path
      ctx!.beginPath()
      for (let i = 0; i <= 100; i++) {
        const xf = i / 100
        const wy = getWaveY(xf, time, h * 0.48, h * 0.1, 0.8, 0.4)
        if (i === 0) ctx!.moveTo(xf * w, wy)
        else ctx!.lineTo(xf * w, wy)
      }
      ctx!.strokeStyle = "rgba(180,215,255,0.08)"
      ctx!.lineWidth = 60
      ctx!.lineCap = "round"
      ctx!.stroke()

      // Wave particles
      for (const p of waveParticles) {
        p.phase += p.pulseSpeed
        const xFrac = (p.offset + time * 0.02) % 1.0
        const x = xFrac * w
        const baseY = getWaveY(xFrac, time, h * 0.48, h * 0.1, 0.8, 0.4)
        const y = baseY + p.yJitter * Math.sin(p.phase * 0.5)
        const alpha = p.alpha * (0.4 + Math.sin(p.phase) * 0.6)
        const sz = p.size * (0.7 + Math.sin(p.phase * 0.8) * 0.3)
        const [r, g, b] = p.color
        const gr = ctx!.createRadialGradient(x, y, 0, x, y, sz * 5)
        gr.addColorStop(0, `rgba(${r},${g},${b},${alpha * 0.2})`)
        gr.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx!.fillStyle = gr
        ctx!.beginPath()
        ctx!.arc(x, y, sz * 5, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.beginPath()
        ctx!.arc(x, y, sz, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx!.fill()
      }

      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
}

/** Neon Helix canvas — dark mode hero background */
function NeonHelixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio, 2)
    let w = 0
    let h = 0
    let raf = 0

    const resize = makeResizer(canvas, ctx, dpr, (nw, nh) => { w = nw; h = nh })

    // Watch for visibility changes (hidden → visible on theme toggle)
    const ro = new ResizeObserver(() => resize())
    if (canvas.parentElement) ro.observe(canvas.parentElement)

    // Helix particles
    const particles = Array.from({ length: 600 }, (_, i) => ({
      t: i / 600,
      offset: (Math.random() - 0.5) * 18,
      zOffset: (Math.random() - 0.5) * 18,
      size: 1 + Math.random() * 2.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.003 + Math.random() * 0.008,
      brightness: 0.5 + Math.random() * 0.5,
    }))

    const glowParticles = Array.from({ length: 80 }, () => ({
      t: Math.random(),
      offset: (Math.random() - 0.5) * 30,
      zOffset: (Math.random() - 0.5) * 30,
      size: 3 + Math.random() * 6,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.001 + Math.random() * 0.004,
      brightness: 0.3 + Math.random() * 0.4,
    }))

    const bgParticles = Array.from({ length: 30 }, () => ({
      x: Math.random() * 1600,
      y: Math.random() * 1000,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
      size: 0.5 + Math.random() * 1.5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.005 + Math.random() * 0.01,
      color: [[84, 157, 255], [12, 199, 228], [178, 211, 255]][Math.floor(Math.random() * 3)],
      alpha: 0.1 + Math.random() * 0.2,
    }))

    type DrawItem = { x: number; y: number; z: number; size: number; alpha: number; type: string }

    function renderItem(d: DrawItem) {
      if (d.alpha < 0.02) return
      const depthNorm = (d.z + 120) / 240
      const r = Math.round(30 + depthNorm * 60)
      const g = Math.round(100 + depthNorm * 100)
      const b = Math.round(200 + depthNorm * 55)
      if (d.type === "glow") {
        const gr = ctx!.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 3)
        gr.addColorStop(0, `rgba(${r},${g},${b},${d.alpha * 0.3})`)
        gr.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx!.fillStyle = gr
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.size * 3, 0, Math.PI * 2)
        ctx!.fill()
      } else {
        const gr = ctx!.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.size * 4)
        gr.addColorStop(0, `rgba(${r},${g},${b},${d.alpha * 0.2})`)
        gr.addColorStop(1, `rgba(${r},${g},${b},0)`)
        ctx!.fillStyle = gr
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.size * 4, 0, Math.PI * 2)
        ctx!.fill()
        ctx!.beginPath()
        ctx!.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${d.alpha})`
        ctx!.fill()
        if (d.alpha > 0.5) {
          ctx!.beginPath()
          ctx!.arc(d.x, d.y, d.size * 0.35, 0, Math.PI * 2)
          ctx!.fillStyle = `rgba(255,255,255,${(d.alpha - 0.5) * 0.8})`
          ctx!.fill()
        }
      }
    }

    function getHelixPoint(t: number, time: number) {
      const x = t * w * 1.4 - w * 0.2
      const helixAngle = t * Math.PI * 4 + time * 0.3
      const helixRadius = 80 + Math.sin(t * Math.PI * 2 + time * 0.1) * 30
      const y = h * 0.5 + Math.cos(helixAngle) * helixRadius + Math.sin(t * Math.PI + time * 0.15) * 40
      const z = Math.sin(helixAngle) * helixRadius
      return { x, y, z }
    }

    function draw(ts: number) {
      const time = ts * 0.001

      // Dark background
      const bg = ctx!.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.7)
      bg.addColorStop(0, "#0a1230")
      bg.addColorStop(0.5, "#070e24")
      bg.addColorStop(1, "#050a1a")
      ctx!.fillStyle = bg
      ctx!.fillRect(0, 0, w, h)

      // Ambient glow
      ctx!.globalCompositeOperation = "screen"
      for (let i = 0; i < 8; i++) {
        const t = (i + 0.5) / 8
        const p = getHelixPoint(t, time)
        const gr = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, 120)
        gr.addColorStop(0, "rgba(47,69,181,0.04)")
        gr.addColorStop(1, "rgba(47,69,181,0)")
        ctx!.fillStyle = gr
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, 120, 0, Math.PI * 2)
        ctx!.fill()
      }

      // Background particles
      for (const p of bgParticles) {
        p.x += p.vx
        p.y += p.vy
        p.pulse += p.pulseSpeed
        if (p.x < -10) p.x = w + 10
        if (p.x > w + 10) p.x = -10
        if (p.y < -10) p.y = h + 10
        if (p.y > h + 10) p.y = -10
        const a = p.alpha * (0.4 + Math.sin(p.pulse) * 0.6)
        const [r, g, b] = p.color
        ctx!.beginPath()
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${a})`
        ctx!.fill()
      }

      // Collect draw list with depth
      const drawList: DrawItem[] = []

      for (const gp of glowParticles) {
        gp.pulse += gp.pulseSpeed
        const pt = (gp.t + time * 0.02) % 1
        const base = getHelixPoint(pt, time)
        const baseNext = getHelixPoint(pt + 0.001, time)
        const dx = baseNext.x - base.x
        const dy = baseNext.y - base.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = -dy / len
        const ny = dx / len
        void ny // tangent used for offset direction
        const x = base.x + nx * gp.offset
        const y = base.y + (dx / len) * gp.offset
        const z = base.z + gp.zOffset
        const depthAlpha = 0.4 + (z / 120 + 0.5) * 0.3
        drawList.push({ x, y, z, size: gp.size, alpha: gp.brightness * depthAlpha * (0.3 + Math.sin(gp.pulse) * 0.3), type: "glow" })
      }

      for (const p of particles) {
        p.pulse += p.pulseSpeed
        const pt = (p.t + time * 0.02) % 1
        const base = getHelixPoint(pt, time)
        const baseNext = getHelixPoint(pt + 0.001, time)
        const dx = baseNext.x - base.x
        const dy = baseNext.y - base.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = -dy / len
        const ny = dx / len
        void ny
        const x = base.x + nx * p.offset
        const y = base.y + (dx / len) * p.offset
        const z = base.z + p.zOffset
        const depthAlpha = 0.5 + (z / 120 + 0.5) * 0.5
        drawList.push({ x, y, z, size: p.size * (0.8 + Math.sin(p.pulse) * 0.2), alpha: p.brightness * depthAlpha * (0.5 + Math.sin(p.pulse) * 0.5), type: "core" })
      }

      drawList.sort((a, b) => a.z - b.z)

      for (const d of drawList) renderItem(d)

      ctx!.globalCompositeOperation = "source-over"
      raf = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener("resize", resize)
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener("resize", resize)
      ro.disconnect()
    }
  }, [])

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/50 p-4 text-sm">
      <code className="text-foreground">{children}</code>
    </pre>
  )
}

const features = [
  {
    icon: Puzzle,
    title: "Composable",
    description:
      "Built on the shadcn/ui pattern. Components are yours to copy, paste, and customize.",
  },
  {
    icon: Moon,
    title: "Themeable",
    description:
      "Light and dark mode out of the box with oklch design tokens and CSS custom properties.",
  },
  {
    icon: Accessibility,
    title: "Accessible",
    description:
      "WCAG 2.1 compliant components built on Radix UI primitives with keyboard navigation and screen reader support.",
  },
] as const

const GITHUB_URL = "https://github.com/tetrascience/ts-lib-ui-kit"

function IntroductionPage() {
  const isDark = useDarkMode()

  return (
    <div className={`min-h-screen bg-background text-foreground ${isDark ? "dark" : ""}`}>
      {/* Hero with canvas background */}
      <div className="relative overflow-hidden border-b border-border">
        {/* Light mode: Bokeh Wave */}
        <div className="dark:hidden absolute inset-0">
          <BokehWaveCanvas />
        </div>
        {/* Dark mode: Neon Helix */}
        <div className="hidden dark:block absolute inset-0">
          <NeonHelixCanvas />
        </div>
        <div className="relative mx-auto max-w-4xl px-8 py-16 md:px-12 md:py-24">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold tracking-tight text-[#0B112D] dark:text-white md:text-5xl">
                TetraScience React UI
              </h1>
              <Badge variant="outline" className="text-xs font-mono border-[#0B112D]/20 text-[#0B112D]/80 dark:border-white/20 dark:text-white/80">
                v{VERSION}
              </Badge>
            </div>
            <p className="max-w-xl text-lg text-[#465364] dark:text-white/70">
              A React component library for scientific UI workflows on the TDP platform
            </p>
            <code className="text-sm text-[#6C7F98] dark:text-[#B2D3FF]/50">{PKG_NAME}</code>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="mx-auto max-w-4xl space-y-10 px-8 py-10 md:px-12">
        {/* What's Inside */}
        <section className="space-y-5">
          <h2 className="text-xl font-semibold">{"What's Inside"}</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <LayoutDashboard className="size-4.5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Components &amp; Examples</p>
                <p className="text-sm text-muted-foreground">
                  50+ production-ready UI primitives, composed patterns, and
                  full-page examples like dashboards and data lakes.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <BarChart3 className="size-4.5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Charts</p>
                <p className="text-sm text-muted-foreground">
                  Plotly-based visualizations including area, bar, line, scatter,
                  heatmap, chromatogram, and more.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-tertiary/10">
                <Sparkles className="size-4.5 text-tertiary" />
              </div>
              <div>
                <p className="font-medium">
                  AI Elements{" "}
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    Coming Soon
                  </Badge>
                </p>
                <p className="text-sm text-muted-foreground">
                  Conversational UI, assistant modals, and AI-powered components
                  for scientific workflows.
                </p>
              </div>
            </div>
          </div>
        </section>

        <Separator />

        {/* Feature Cards */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Highlights</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <Card key={title} size="sm">
                <CardHeader>
                  <Icon className="size-5 text-primary" />
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <Separator />

        {/* Quick Start */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold">Quick Start</h2>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Install the package:
            </p>
            <CodeBlock>{`yarn add ${PKG_NAME}`}</CodeBlock>

            <p className="text-sm text-muted-foreground">
              Import a component and the stylesheet:
            </p>
            <CodeBlock>
              {`import { Button } from '${PKG_NAME}'
import '${PKG_NAME}/dist/index.css'`}
            </CodeBlock>
          </div>
        </section>

        <Separator />

        {/* Footer */}
        <div className="flex items-center justify-between pb-6">
          <p className="text-xs text-muted-foreground">
            Made with ❤️ by the Scientific Workspace Team
          </p>
          <Button variant="outline" size="icon" className="bg-foreground text-background border-foreground hover:bg-foreground/90 hover:text-background" asChild>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub Repository"
            >
              <Github className="size-4" />
            </a>
          </Button>
        </div>
      </div>
    </div>
  )
}

const meta: Meta = {
  title: "Introduction",
  tags: ["autodocs", "!dev"],
  parameters: {
    layout: "fullscreen",
    controls: { disable: true },
    actions: { disable: true },
    docs: {
      page: () => <IntroductionPage />,
      container: ({ children }: { children: React.ReactNode }) => (
        <div style={{ margin: 0, padding: 0 }}>{children}</div>
      ),
    },
  },
}

export default meta

type Story = StoryObj

export const Overview: Story = {
  render: () => <IntroductionPage />,
  parameters: {
    zephyr: { testCaseId: "SW-T1469" },
  },
}
