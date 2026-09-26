import * as THREE from 'three'
import { parseCard, SUIT_GLYPH, SUIT_COLOR, type Suit } from '../lib/poker'

const W = 256
const H = 358 // 0.715 aspect — a real playing card is 2.5 x 3.5 inches

const faceCache = new Map<string, THREE.CanvasTexture>()
let backCache: THREE.CanvasTexture | null = null
let blankCache: THREE.CanvasTexture | null = null

function ctx2d(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const g = c.getContext('2d')
  if (!g) throw new Error('2d context unavailable')
  return [c, g]
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function finish(c: HTMLCanvasElement): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.needsUpdate = true
  return tex
}

/** A readable card face: corner index top-left and bottom-right, big centre glyph. */
export function cardFaceTexture(code: string): THREE.CanvasTexture {
  const hit = faceCache.get(code)
  if (hit) return hit

  const card = parseCard(code)
  const [c, g] = ctx2d()

  g.fillStyle = '#F7F3EB'
  roundRect(g, 0, 0, W, H, 26)
  g.fill()

  if (!card) {
    // Unknown code renders as a blank face rather than throwing.
    const tex = finish(c)
    faceCache.set(code, tex)
    return tex
  }

  const colour = SUIT_COLOR[card.suit].startsWith('var(') ? '#14151A' : SUIT_COLOR[card.suit]
  const glyph = SUIT_GLYPH[card.suit]

  g.strokeStyle = 'rgba(20,21,26,.16)'
  g.lineWidth = 3
  roundRect(g, 1.5, 1.5, W - 3, H - 3, 25)
  g.stroke()

  // Corner index
  const drawCorner = (flip: boolean) => {
    g.save()
    if (flip) { g.translate(W, H); g.rotate(Math.PI) }
    g.fillStyle = colour
    g.textAlign = 'center'
    g.font = 'bold 62px ui-sans-serif, system-ui, sans-serif'
    g.fillText(card.rank, 40, 66)
    g.font = '46px ui-sans-serif, system-ui, sans-serif'
    g.fillText(glyph, 40, 112)
    g.restore()
  }
  drawCorner(false)
  drawCorner(true)

  // Centre glyph
  g.fillStyle = colour
  g.globalAlpha = 0.92
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = '150px ui-sans-serif, system-ui, sans-serif'
  g.fillText(glyph, W / 2, H / 2 + 6)
  g.globalAlpha = 1

  const tex = finish(c)
  faceCache.set(code, tex)
  return tex
}

/** The brass-on-ink card back. Shared by every face-down card. */
export function cardBackTexture(): THREE.CanvasTexture {
  if (backCache) return backCache
  const [c, g] = ctx2d()

  g.fillStyle = '#0E1512'
  roundRect(g, 0, 0, W, H, 26)
  g.fill()

  g.strokeStyle = '#C9A24A'
  g.lineWidth = 4
  roundRect(g, 14, 14, W - 28, H - 28, 16)
  g.stroke()

  // Diagonal lattice
  g.save()
  roundRect(g, 18, 18, W - 36, H - 36, 13)
  g.clip()
  g.strokeStyle = 'rgba(201,162,74,.30)'
  g.lineWidth = 2
  for (let i = -H; i < W + H; i += 18) {
    g.beginPath(); g.moveTo(i, 0); g.lineTo(i + H, H); g.stroke()
    g.beginPath(); g.moveTo(i, H); g.lineTo(i + H, 0); g.stroke()
  }
  g.restore()

  // Centre diamond mark
  g.fillStyle = '#C9A24A'
  g.beginPath()
  g.moveTo(W / 2, H / 2 - 46)
  g.lineTo(W / 2 + 34, H / 2)
  g.lineTo(W / 2, H / 2 + 46)
  g.lineTo(W / 2 - 34, H / 2)
  g.closePath()
  g.fill()
  g.fillStyle = '#0E1512'
  g.beginPath()
  g.moveTo(W / 2, H / 2 - 24)
  g.lineTo(W / 2 + 18, H / 2)
  g.lineTo(W / 2, H / 2 + 24)
  g.lineTo(W / 2 - 18, H / 2)
  g.closePath()
  g.fill()

  backCache = finish(c)
  return backCache
}

/** Plain edge/blank texture for the card's sides. */
export function cardEdgeTexture(): THREE.CanvasTexture {
  if (blankCache) return blankCache
  const [c, g] = ctx2d()
  g.fillStyle = '#E6E0D4'
  g.fillRect(0, 0, W, H)
  blankCache = finish(c)
  return blankCache
}

/** Chip face: value ring with alternating edge spots. */
export function chipTexture(color: string, label: string): THREE.CanvasTexture {
  const [c, g] = ctx2d()
  c.width = 256; c.height = 256
  g.clearRect(0, 0, 256, 256)
  g.fillStyle = color
  g.beginPath(); g.arc(128, 128, 126, 0, Math.PI * 2); g.fill()

  g.strokeStyle = 'rgba(255,255,255,.85)'
  g.lineWidth = 16
  for (let i = 0; i < 6; i++) {
    g.beginPath()
    g.arc(128, 128, 112, (i * Math.PI) / 3 + 0.22, (i * Math.PI) / 3 + 0.82)
    g.stroke()
  }
  g.fillStyle = 'rgba(0,0,0,.22)'
  g.beginPath(); g.arc(128, 128, 84, 0, Math.PI * 2); g.fill()
  g.fillStyle = '#F4EFE6'
  g.beginPath(); g.arc(128, 128, 74, 0, Math.PI * 2); g.fill()

  g.fillStyle = '#14151A'
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.font = 'bold 56px ui-monospace, monospace'
  g.fillText(label, 128, 132)

  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  return tex
}

export function disposeCardTextures() {
  faceCache.forEach((t) => t.dispose())
  faceCache.clear()
  backCache?.dispose(); backCache = null
  blankCache?.dispose(); blankCache = null
}

export type { Suit }
