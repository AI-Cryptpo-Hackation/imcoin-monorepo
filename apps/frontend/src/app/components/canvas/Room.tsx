'use client'
import { CameraControls, PerformanceMonitor, Sky, SoftShadows } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useControls } from 'leva'
import { Perf } from 'r3f-perf'
import { useState } from 'react'
import { Vector3 } from 'three'
import { Light } from './Light'
import { RoomModel } from './RoomModel'
import { Sphere } from './Sphere'

export const Room = () => {
  const [bad, set] = useState(false)
  const { debug, enabled, samples, ...config } = useControls({
    debug: true,
    enabled: true,
    size: { value: 35, min: 0, max: 100, step: 0.1 },
    focus: { value: 0.5, min: 0, max: 2, step: 0.1 },
    samples: { value: 16, min: 1, max: 40, step: 1 },
  })

  return (
    <Canvas shadows camera={{ position: [5, 2, 10], fov: 50 }}>
      {debug && <Perf position='top-left' />}
      <PerformanceMonitor onDecline={() => set(true)} />
      {enabled && <SoftShadows {...config} samples={bad ? Math.min(6, samples) : samples} />}
      <CameraControls makeDefault />
      <color attach='background' args={['#d0d0d0']} />
      <fog attach='fog' args={['#d0d0d0', 8, 35]} />
      <ambientLight intensity={0.4} />
      <Light />
      <RoomModel scale={0.5} position={[0, -1, 0]} />
      <Sphere />
      <Sphere position={new Vector3(2, 4, -8)} scale={0.9} />
      <Sphere position={new Vector3(-2, 2, -8)} scale={0.8} />
      <Sky inclination={0.52} />
    </Canvas>
  )
}
