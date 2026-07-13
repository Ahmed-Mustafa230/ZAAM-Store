'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Environment, ContactShadows, Float, Html } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { FiRotateCw, FiZoomIn, FiZoomOut, FiAlertTriangle } from 'react-icons/fi'

interface ProductViewerProps {
  images?: string[]
  modelPath?: string
  alt?: string
}

function ProductModel({ modelPath, images }: { modelPath?: string; images?: string[] }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)

  useEffect(() => {
    if (images && images.length > 0) {
      const loader = new THREE.TextureLoader()
      loader.load(images[0], (tex) => {
        setTexture(tex)
      })
    }
  }, [images])

  useFrame((_state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.15
    }
  })

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <mesh ref={meshRef} rotation={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 2.5, 0.3]} />
        <meshPhysicalMaterial
          color={texture ? undefined : '#d4af37'}
          map={texture || undefined}
          metalness={0.8}
          roughness={0.2}
          clearcoat={0.3}
          clearcoatRoughness={0.4}
          envMapIntensity={1.5}
          side={THREE.DoubleSide}
        />
        {Array.from({ length: 4 }).map((_, i) => {
          const angle = (i / 4) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.sin(angle) * 0.6, 0, Math.cos(angle) * 0.6]}
              rotation={[0, 0, 0]}
            >
              <sphereGeometry args={[0.05, 16, 16]} />
              <meshPhysicalMaterial
                color='#f0d060'
                emissive='#d4af37'
                emissiveIntensity={0.3}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
          )
        })}
      </mesh>
    </Float>
  )
}

function ProductScene({ modelPath, images }: ProductViewerProps) {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.5} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color='#d4af37' />
      <pointLight position={[0, 3, 2]} intensity={0.8} color='#f0d060' />
      <spotLight
        position={[0, 5, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.5}
        color='#d4af37'
      />

      <Suspense
        fallback={
          <Html center>
            <div className='text-white/40 text-sm'>Loading 3D model...</div>
          </Html>
        }
      >
        <ProductModel modelPath={modelPath} images={images} />
        <Environment preset='studio' />
        <ContactShadows
          position={[0, -1.5, 0]}
          opacity={0.4}
          scale={5}
          blur={2.5}
          far={4}
        />
      </Suspense>

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={1.5}
        enableDamping
        dampingFactor={0.08}
      />
    </>
  )
}

function FallbackView({ image, alt }: { image?: string; alt?: string }) {
  return (
    <div className='w-full h-full flex items-center justify-center bg-[#1a1a2e] rounded-2xl'>
      {image ? (
        <img
          src={image}
          alt={alt || 'Product'}
          className='w-full h-full object-contain p-8'
        />
      ) : (
        <div className='text-center text-white/30'>
          <FiAlertTriangle className='text-4xl mx-auto mb-3' />
          <p className='text-sm'>3D view not available</p>
        </div>
      )}
    </div>
  )
}

export default function ProductViewer({ images, modelPath, alt }: ProductViewerProps) {
  const [hasWebGL, setHasWebGL] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [isAutoRotating, setIsAutoRotating] = useState(true)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) {
        setHasWebGL(false)
      }
    } catch {
      setHasWebGL(false)
    }
  }, [])

  return (
    <div className='relative w-full aspect-square rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 group'>
      {!hasWebGL ? (
        <FallbackView image={images?.[0]} alt={alt} />
      ) : (
        <>
          <Canvas
            shadows
            camera={{ position: [0, 0, 5], fov: 45 }}
            dpr={[1, 2]}
            style={{ background: '#0a0a0a' }}
            onCreated={({ gl }) => {
              gl.setClearColor('#0a0a0a')
              gl.toneMapping = THREE.ACESFilmicToneMapping
              gl.toneMappingExposure = 1.2
            }}
          >
            <ProductScene modelPath={modelPath} images={images} />
          </Canvas>

          <div className='absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
            <motion.button
              onClick={() => setIsAutoRotating(!isAutoRotating)}
              className={`px-3 py-2 rounded-lg backdrop-blur-md text-xs font-medium flex items-center gap-1.5 border transition-all ${
                isAutoRotating
                  ? 'bg-[#d4af37]/20 border-[#d4af37]/30 text-[#d4af37]'
                  : 'bg-white/5 border-white/10 text-white/50'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiRotateCw className={`text-sm ${isAutoRotating ? '' : 'line-through'}`} />
              Auto-rotate
            </motion.button>

            <motion.button
              onClick={() => setZoom((z) => Math.min(z + 0.2, 2))}
              className='px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiZoomIn />
            </motion.button>

            <motion.button
              onClick={() => setZoom((z) => Math.max(z - 0.2, 0.5))}
              className='px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 text-xs flex items-center gap-1.5 transition-all'
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiZoomOut />
            </motion.button>
          </div>

          <div className='absolute top-4 left-4'>
            <span className='px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur-md border border-white/10 text-white/40 text-xs'>
              Drag to rotate
            </span>
          </div>
        </>
      )}
    </div>
  )
}
