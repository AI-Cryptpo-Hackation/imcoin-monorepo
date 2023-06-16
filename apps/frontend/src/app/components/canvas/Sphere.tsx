import { Float } from '@react-three/drei'
import { Vector3 } from 'three'

export const Sphere = ({
  color = 'hotpink',
  floatIntensity = 15,
  position = new Vector3(0, 5, -8),
  scale = 1,
}) => {
  return (
    <Float floatIntensity={floatIntensity}>
      <mesh castShadow position={position} scale={scale}>
        <sphereGeometry />
        <meshBasicMaterial color={color} />
      </mesh>
    </Float>
  )
}
