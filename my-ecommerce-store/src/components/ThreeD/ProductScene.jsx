import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, MeshDistortMaterial, Sphere } from '@react-three/drei';

const ProductScene = () => {
  return (
    // Ensure the container has a defined height/width
    <div style={{ width: '100%', height: '400px' }}>
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} />
        <OrbitControls enableZoom={false} />
        <Sphere args={[1, 100, 200]} scale={2}>
          <MeshDistortMaterial
            color="#003366" // Your brand primary blue
            attach="material"
            distort={0.4}
            speed={1.5}
          />
        </Sphere>
      </Canvas>
    </div>
  );
};

export default ProductScene;