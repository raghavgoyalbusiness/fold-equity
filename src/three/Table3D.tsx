import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { TableScene } from './Scene'
import type { CardSlot } from './dealPlan'

/**
 * The WebGL half of the table, in its own module so React.lazy can pull
 * three.js into a separate chunk. Pages with no table never load it.
 */
export default function Table3D({
  slots, seats, reduced, interactive, autoRotate, onHover,
}: {
  slots: CardSlot[]
  seats: number
  reduced: boolean
  interactive: boolean
  autoRotate: boolean
  onHover: (t: string | null) => void
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.8]}
      camera={{ position: [0, 6.4, 8.4], fov: 38, near: 0.1, far: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <Suspense fallback={null}>
        <TableScene slots={slots} seats={seats} reduced={reduced} onHover={onHover} />
        {interactive && (
          <OrbitControls
            enablePan={false}
            enableZoom
            minDistance={5}
            maxDistance={12}
            minPolarAngle={0.32}
            maxPolarAngle={1.24}
            enableDamping
            dampingFactor={0.055}
            rotateSpeed={0.55}
            autoRotate={autoRotate}
            autoRotateSpeed={0.22}
          />
        )}
      </Suspense>
    </Canvas>
  )
}
