import { useMemo, useRef, useState, memo } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { cardFaceTexture, cardBackTexture, cardEdgeTexture, chipTexture } from './cardTexture'
import { playCard, playChip } from '../lib/sound'
import { TABLE_RX, TABLE_RZ, DECK_ORIGIN, seatPos, seatAngle, type CardSlot } from './dealPlan'

const CARD_W = 0.42
const CARD_H = 0.58
const CARD_D = 0.009
const FACE_UP_RX = -Math.PI / 2
const FACE_DOWN_RX = Math.PI / 2

export interface HoverInfo { title: string; body: string }

// ---------------------------------------------------------------------------

function Tooltip({ text }: { text: string }) {
  return (
    <Html center distanceFactor={7} style={{ pointerEvents: 'none' }}>
      <div className="scene-tip">{text}</div>
    </Html>
  )
}

// ---------------------------------------------------------------------------

const Card3D = memo(function Card3D({
  slot, reduced, onHover,
}: { slot: CardSlot; reduced: boolean; onHover: (t: string | null) => void }) {
  const ref = useRef<THREE.Group>(null)
  const t = useRef(0)
  const landed = useRef(false)
  const [hovered, setHovered] = useState(false)

  const materials = useMemo(() => {
    const edge = new THREE.MeshStandardMaterial({ map: cardEdgeTexture(), roughness: 0.72, metalness: 0.02 })
    const face = new THREE.MeshStandardMaterial({
      map: slot.code ? cardFaceTexture(slot.code) : cardBackTexture(),
      roughness: 0.46, metalness: 0.03,
    })
    const back = new THREE.MeshStandardMaterial({ map: cardBackTexture(), roughness: 0.5, metalness: 0.12 })
    return [edge, edge, edge, edge, face, back]
  }, [slot.code])

  const targetRX = slot.faceUp ? FACE_UP_RX : FACE_DOWN_RX

  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    if (reduced) {
      g.position.set(...slot.pos)
      g.rotation.set(targetRX, slot.rot[1], slot.rot[2])
      g.visible = true
      return
    }
    t.current += dt
    const local = t.current - slot.delay
    if (local < 0) { g.visible = false; return }
    g.visible = true
    if (!landed.current && local >= 0.62) {
      landed.current = true
      playCard()
    }
    // Weighted ease-out: fast off the deck, settling slowly onto the felt.
    const p = Math.min(1, local / 0.62)
    const e = 1 - Math.pow(1 - p, 3)

    g.position.x = THREE.MathUtils.lerp(DECK_ORIGIN[0], slot.pos[0], e)
    g.position.z = THREE.MathUtils.lerp(DECK_ORIGIN[2], slot.pos[2], e)
    // A small arc so the card lifts off the deck rather than sliding through it.
    g.position.y = THREE.MathUtils.lerp(DECK_ORIGIN[1], slot.pos[1], e) + Math.sin(p * Math.PI) * 0.22

    g.rotation.x = THREE.MathUtils.lerp(FACE_DOWN_RX, targetRX, e)
    g.rotation.z = THREE.MathUtils.lerp(0, slot.rot[2], e)
    const lift = hovered ? 0.06 : 0
    g.position.y += lift
  })

  return (
    <group
      ref={ref}
      position={DECK_ORIGIN}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(slot.tooltip) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(null) }}
    >
      <mesh castShadow receiveShadow material={materials}>
        <boxGeometry args={[CARD_W, CARD_H, CARD_D]} />
      </mesh>
      {hovered && <Tooltip text={slot.tooltip} />}
    </group>
  )
})

// ---------------------------------------------------------------------------

function ChipStack({
  x, z, count, color, label, onHover,
}: { x: number; z: number; count: number; color: string; label: string; onHover: (t: string | null) => void }) {
  const [hovered, setHovered] = useState(false)
  const tex = useMemo(() => chipTexture(color, label), [color, label])
  const side = useMemo(
    () => new THREE.MeshStandardMaterial({ color: new THREE.Color(color).multiplyScalar(0.82), roughness: 0.55 }),
    [color],
  )
  const face = useMemo(
    () => new THREE.MeshStandardMaterial({ map: tex, roughness: 0.48 }),
    [tex],
  )
  const tip = `Chip stack — seat. Stacks are measured in big blinds, not currency: 100bb plays completely differently from 30bb with the same cards.`

  return (
    <group
      position={[x, 0.245, z]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(tip); playChip() }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(null) }}
    >
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[0, i * 0.036 + 0.018, 0]} castShadow receiveShadow material={[side, face, face]}>
          <cylinderGeometry args={[0.13, 0.13, 0.034, 24]} />
        </mesh>
      ))}
      {hovered && <Tooltip text={tip} />}
    </group>
  )
}

// ---------------------------------------------------------------------------

function Seat({
  index, seats, isHero, label, onHover,
}: { index: number; seats: number; isHero: boolean; label: string; onHover: (t: string | null) => void }) {
  const [hovered, setHovered] = useState(false)
  const a = seatAngle(index, seats)
  const x = (TABLE_RX + 0.62) * Math.cos(a)
  const z = (TABLE_RZ + 0.62) * Math.sin(a)
  const tip = isHero
    ? 'Your seat. Position is measured from the dealer button — being last to act is the single largest structural edge in poker.'
    : `${label}. Every seat has a different profitable strategy: the button opens roughly four times as many hands as the seat under the gun.`

  return (
    <group
      position={[x, 0.08, z]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(tip) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(null) }}
    >
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.34, 28]} />
        <meshStandardMaterial
          color={isHero ? '#C9A24A' : '#1A1C20'}
          roughness={0.55}
          metalness={isHero ? 0.55 : 0.2}
          emissive={isHero ? '#4A3808' : '#000000'}
          emissiveIntensity={isHero ? 0.55 : 0}
        />
      </mesh>
      <mesh position={[0, 0.16, 0]} castShadow>
        <capsuleGeometry args={[0.13, 0.16, 4, 12]} />
        <meshStandardMaterial color={isHero ? '#E3C075' : '#33363C'} roughness={0.62} metalness={0.15} />
      </mesh>
      {hovered && <Tooltip text={tip} />}
    </group>
  )
}

// ---------------------------------------------------------------------------

function DealerButton({ seats, onHover }: { seats: number; onHover: (t: string | null) => void }) {
  const [hovered, setHovered] = useState(false)
  const [sx, sz] = seatPos(0, seats, 1.38)
  const tip = 'The dealer button. It marks who acts last after the flop and moves one seat clockwise every hand — which is why position is a rotating, temporary advantage rather than a fixed one.'
  return (
    <group
      position={[sx + 0.42, 0.262, sz]}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(tip) }}
      onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onHover(null) }}
    >
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.028, 28]} />
        <meshStandardMaterial color="#F4EFE6" roughness={0.42} metalness={0.06} />
      </mesh>
      <Html center distanceFactor={9} style={{ pointerEvents: 'none' }}>
        <div className="scene-dealer">D</div>
      </Html>
      {hovered && <Tooltip text={tip} />}
    </group>
  )
}

// ---------------------------------------------------------------------------

function TableSurface() {
  return (
    <group>
      {/* Body. Its top sits just BELOW the felt so the felt is what you see. */}
      <mesh position={[0, 0, 0]} scale={[TABLE_RX + 0.2, 1, TABLE_RZ + 0.2]} receiveShadow>
        <cylinderGeometry args={[1, 0.93, 0.42, 96]} />
        <meshStandardMaterial color="#0C0D10" roughness={0.75} metalness={0.22} />
      </mesh>

      {/* Felt */}
      <mesh position={[0, 0.22, 0]} scale={[TABLE_RX, 1, TABLE_RZ]} receiveShadow>
        <cylinderGeometry args={[1, 1, 0.04, 96]} />
        <meshStandardMaterial color="#17714F" roughness={1} metalness={0} />
      </mesh>

      {/* Brass inlay ring, sitting a hair proud of the felt */}
      <mesh position={[0, 0.242, 0]} scale={[TABLE_RX * 0.86, 1, TABLE_RZ * 0.82]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.99, 1, 96]} />
        <meshStandardMaterial color="#C9A24A" roughness={0.3} metalness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Padded rail — a TORUS, so it rings the felt instead of covering it.
          A solid cylinder here hides the felt and swallows the cards. */}
      <mesh position={[0, 0.215, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[TABLE_RX + 0.1, TABLE_RZ + 0.16, 1.7]} castShadow receiveShadow>
        <torusGeometry args={[1, 0.055, 16, 110]} />
        <meshStandardMaterial color="#191B20" roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Pedestal */}
      <mesh position={[0, -0.62, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[0.55, 0.95, 0.85, 40]} />
        <meshStandardMaterial color="#0A0B0D" roughness={0.8} metalness={0.25} />
      </mesh>

      {/* Floor catches the lamp pool */}
      <mesh position={[0, -1.06, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[16, 48]} />
        <meshStandardMaterial color="#08090B" roughness={1} metalness={0} />
      </mesh>
    </group>
  )
}

function Lamp({ reduced }: { reduced: boolean }) {
  const ref = useRef<THREE.Group>(null)
  useFrame((state) => {
    if (reduced || !ref.current) return
    // A barely-there sway — the room should feel lived in, not animated.
    ref.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.22) * 0.006
  })
  return (
    <group ref={ref} position={[0, 4.2, 0]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.8, 8]} />
        <meshStandardMaterial color="#2A2C31" roughness={0.6} metalness={0.7} />
      </mesh>
      <mesh castShadow>
        <coneGeometry args={[1.05, 0.72, 40, 1, true]} />
        <meshStandardMaterial color="#1A1C20" roughness={0.42} metalness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.17, 20, 20]} />
        <meshBasicMaterial color="#FFE9BC" />
      </mesh>
      {/* Visible light shaft — deliberately faint; the spotlight does the work. */}
      <mesh position={[0, -1.5, 0]} renderOrder={-1}>
        <coneGeometry args={[2.2, 2.6, 32, 1, true]} />
        <meshBasicMaterial color="#FFE3B0" transparent opacity={0.022} side={THREE.BackSide} depthWrite={false} />
      </mesh>
      <spotLight
        position={[0, -0.3, 0]}
        angle={0.86}
        penumbra={0.5}
        intensity={40}
        distance={18}
        decay={1.5}
        color="#FFF0DA"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
      />
    </group>
  )
}

// ---------------------------------------------------------------------------

export interface SceneProps {
  slots: CardSlot[]
  seats: number
  reduced: boolean
  showChips?: boolean
  onHover: (t: string | null) => void
}

export function TableScene({ slots, seats, reduced, showChips = true, onHover }: SceneProps) {
  const stacks = useMemo(() => {
    const palette = [
      { color: '#B3261E', label: '5' }, { color: '#1B4E7A', label: '10' },
      { color: '#1E6B41', label: '25' }, { color: '#3B3B40', label: '100' },
    ]
    return Array.from({ length: seats }, (_, s) => {
      const [x, z] = seatPos(s, seats, 0.26)
      const p = palette[s % palette.length]
      return { s, x, z, count: 4 + ((s * 3) % 6), ...p }
    })
  }, [seats])

  const seatLabels = useMemo(() => {
    const six = ['Your seat', 'Small blind', 'Big blind', 'Under the gun', 'Hijack', 'Cutoff', 'Seat 7', 'Seat 8', 'Seat 9']
    return Array.from({ length: seats }, (_, i) => six[i] ?? `Seat ${i + 1}`)
  }, [seats])

  return (
    <>
      <color attach="background" args={['#070709']} />
      <fog attach="fog" args={['#070709', 16, 34]} />

      <ambientLight intensity={0.3} color="#8AA6BA" />
      <hemisphereLight args={['#2A7A5C', '#08090B', 0.7]} />
      <pointLight position={[-7, 3.0, -5]} intensity={30} color="#2E5F7A" distance={22} decay={2} />
      <pointLight position={[7, 2.2, 5]} intensity={20} color="#C9A24A" distance={20} decay={2} />

      <Lamp reduced={reduced} />
      <TableSurface />

      {Array.from({ length: seats }, (_, i) => (
        <Seat key={i} index={i} seats={seats} isHero={i === 0} label={seatLabels[i]} onHover={onHover} />
      ))}

      {showChips && stacks.map((st) => (
        <ChipStack key={st.s} x={st.x} z={st.z} count={st.count} color={st.color} label={st.label} onHover={onHover} />
      ))}

      <DealerButton seats={seats} onHover={onHover} />

      {slots.map((slot) => (
        <Card3D key={slot.id} slot={slot} reduced={reduced} onHover={onHover} />
      ))}
    </>
  )
}
