import { useFrame } from '@react-three/fiber'
import { easing } from 'maath'
import { useRef } from 'react'
import type { Group } from 'three'

export const Light = () => {
  const ref = useRef<Group>()
  useFrame((state, delta) => {
    if (!ref.current) {
      return
    }
    easing.dampE(
      ref.current.rotation,
      [(state.pointer.y * Math.PI) / 50, (state.pointer.x * Math.PI) / 20, 0],
      0.2,
      delta,
    )
  })
  return (
    <group ref={ref}>
      <directionalLight
        position={[5, 5, -8]}
        castShadow
        intensity={5}
        shadow-mapSize={2048}
        shadow-bias={-0.001}
      >
        <orthographicCamera attach='shadow-camera' args={[-8.5, 8.5, 8.5, -8.5, 0.1, 20]} />
      </directionalLight>
    </group>
  )
}
