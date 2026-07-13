'use client'

import { Suspense, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, Float, Html, useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { motion } from 'framer-motion'
import { FiShoppingBag, FiHeart } from 'react-icons/fi'

interface ThreeDProductCardProps {
  name: string
  brand: string
  price: number
  image: string
  onAddToCart?: () => void
}

function FloatingProduct({ image }: { image: string }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [texture, setTexture] = useState<THREE.Texture | null>(null)
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const loader = new THREE.TextureLoader()
    loader.load(
      image,
      (tex) => setTexture(tex),
      undefined,
      () => setTexture(null)
    )
  }, [image])

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * (hovered ? 0.5 : 0.2)
      meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.15
    }
  })

  return (
    <mesh
      ref={meshRef}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={hovered ? 1.08 : 1}
    >
      <boxGeometry args={[2, 2.5, 0.15]} />
      {texture ? (
        <meshPhysicalMaterial
          map={texture}
          metalness={0.3}
          roughness={0.4}
          clearcoat={0.2}
          side={THREE.DoubleSide}
        />
      ) : (
        <meshPhysicalMaterial
          color='#d4af37'
          metalness={0.6}
          roughness={0.3}
          clearcoat={0.4}
          emissive='#d4af37'
          emissiveIntensity={0.1}
          side={THREE.DoubleSide}
        />
      )}
    </mesh>
  )
}

function ProductScene({ image }: { image: string }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} />
      <directionalLight position={[-3, 2, -3]} intensity={0.4} color='#d4af37' />
      <pointLight position={[0, 2, 3]} intensity={0.5} color='#f0d060' />

      <Suspense
        fallback={
          <Html center>
            <div className='text-white/40 text-xs'>Loading...</div>
          </Html>
        }
      >
        <Float speed={0.5} rotationIntensity={0.1} floatIntensity={0.3}>
          <FloatingProduct image={image} />
        </Float>
        <Environment preset='city' />
      </Suspense>
    </>
  )
}

export default function ThreeDProductCard({
  name,
  brand,
  price,
  image,
  onAddToCart,
}: ThreeDProductCardProps) {
  const [hasWebGL, setHasWebGL] = useState(true)
  const [isWishlisted, setIsWishlisted] = useState(false)

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      if (!gl) setHasWebGL(false)
    } catch {
      setHasWebGL(false)
    }
  }, [])

  if (!hasWebGL) {
    return (
      <div className='relative rounded-2xl overflow-hidden bg-[#1a1a2e] border border-white/5 group'>
        <div className='aspect-[3/4]'>
          <img
            src={image}
            alt={name}
            className='w-full h-full object-cover'
            onError={(e) => {
              const target = e.currentTarget
              target.style.display = 'none'
            }}
          />
        </div>
        <div className='absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 to-transparent'>
          <p className='text-white/50 text-xs uppercase'>{brand}</p>
          <h3 className='text-white font-semibold text-lg'>{name}</h3>
          <p className='text-[#d4af37] font-semibold'>Rs {price.toFixed(2)}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className='relative rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5 group'
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className='aspect-[3/4] w-full'>
        <Canvas
          camera={{ position: [0, 0, 4], fov: 50 }}
          dpr={[1, 2]}
          gl={{ alpha: false }}
          style={{ background: '#0a0a0a' }}
          onCreated={({ gl }) => {
            gl.setClearColor('#0a0a0a')
          }}
        >
          <ProductScene image={image} />
        </Canvas>
      </div>

      <div className='absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-black/90 via-black/50 to-transparent'>
        <p className='text-white/40 text-xs uppercase tracking-wider mb-1'>{brand}</p>
        <h3
          className='text-white font-semibold text-lg truncate'
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {name}
        </h3>
        <div className='flex items-center justify-between mt-2'>
          <span className='text-[#d4af37] font-semibold text-lg'>
            Rs {price.toFixed(2)}
          </span>
        </div>
      </div>

      <div className='absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
        <motion.button
          onClick={() => setIsWishlisted(!isWishlisted)}
          className='w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-black/60 transition-colors'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label='Add to wishlist'
        >
          <FiHeart
            className={`${isWishlisted ? 'text-rose-400 fill-rose-400' : 'text-white/70'} text-sm`}
          />
        </motion.button>

        <motion.button
          onClick={onAddToCart}
          className='w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:bg-[#d4af37]/20 hover:border-[#d4af37]/30 transition-colors'
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label='Add to cart'
        >
          <FiShoppingBag className='text-white/70 text-sm' />
        </motion.button>
      </div>
    </motion.div>
  )
}
