import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Line } from '@react-three/drei';
import * as THREE from 'three';
import {
  Point3D,
  TemporalFeature,
  generateConnections,
  getActivePoints,
} from '../services/aves3DService';

interface PointCloudProps {
  points: Point3D[];
  temporalFeatures: TemporalFeature[];
  currentTime: number;
  isPlaying: boolean;
}

const PointCloud: React.FC<PointCloudProps> = ({
  points,
  temporalFeatures,
  currentTime,
  isPlaying,
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const linesRef = useRef<THREE.Group>(null);

  // Find active points based on current time
  const activeIndices = useMemo(
    () => getActivePoints(temporalFeatures, currentTime),
    [temporalFeatures, currentTime]
  );

  // Create point geometries and materials
  const { positions, colors, sizes } = useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const siz: number[] = [];

    points.forEach((point, index) => {
      pos.push(point.x, point.y, point.z);

      const isActive = activeIndices.includes(index);

      if (isActive) {
        // Active: vibrant green/cyan
        const feature = temporalFeatures[index] || { energy: 0.5, frequency: 4000 };
        const intensity = 0.5 + feature.energy * 0.5;
        col.push(0.1 * intensity, 1.0 * intensity, 0.6 * intensity);
        siz.push(0.06 + feature.energy * 0.04);
      } else {
        // Inactive: subtle gray
        col.push(0.3, 0.3, 0.3);
        siz.push(0.02);
      }
    });

    return {
      positions: new Float32Array(pos),
      colors: new Float32Array(col),
      sizes: new Float32Array(siz),
    };
  }, [points, activeIndices, temporalFeatures]);

  // Animate point pulsing
  useFrame(({ clock }) => {
    if (pointsRef.current && isPlaying) {
      const time = clock.getElapsedTime();

      // Gentle rotation
      pointsRef.current.rotation.y = time * 0.05;

      // Pulse active points
      const geometry = pointsRef.current.geometry;
      const sizesAttr = geometry.attributes.size as THREE.BufferAttribute;

      activeIndices.forEach((index) => {
        const pulse = 1 + Math.sin(time * 10) * 0.3;
        const baseSize = 0.06 + (temporalFeatures[index]?.energy || 0.5) * 0.04;
        sizesAttr.setX(index, baseSize * pulse);
      });

      sizesAttr.needsUpdate = true;
    }
  });

  // Generate connections between points
  const connections = useMemo(() => generateConnections(points), [points]);

  return (
    <group>
      {/* Point cloud */}
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={sizes.length}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          sizeAttenuation={true}
          vertexColors={true}
          transparent={true}
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Connection lines */}
      <group ref={linesRef}>
        {connections.map(([start, end], index) => {
          const startPoint = points[start];
          const endPoint = points[end];

          const isActive =
            activeIndices.includes(start) || activeIndices.includes(end);

          return (
            <Line
              key={index}
              points={[
                [startPoint.x, startPoint.y, startPoint.z],
                [endPoint.x, endPoint.y, endPoint.z],
              ]}
              color={isActive ? '#10b981' : '#404040'}
              lineWidth={isActive ? 2 : 0.5}
              transparent
              opacity={isActive ? 0.8 : 0.2}
            />
          );
        })}
      </group>
    </group>
  );
};

interface Audio3DVisualizationProps {
  points: Point3D[];
  temporalFeatures: TemporalFeature[];
  currentTime: number;
  isPlaying: boolean;
}

const Audio3DVisualization: React.FC<Audio3DVisualizationProps> = ({
  points,
  temporalFeatures,
  currentTime,
  isPlaying,
}) => {
  const [mouseOver, setMouseOver] = useState(false);

  if (points.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-900 rounded-lg border-2 border-gray-800 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="mx-auto h-16 w-16 text-gray-700 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-500">
            No 3D Data Available
          </h3>
          <p className="text-gray-600 mt-2">Record audio to generate visualization</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-96 bg-black rounded-lg border-2 border-neon-green overflow-hidden relative">
      {/* Info overlay */}
      <div className="absolute top-4 left-4 z-10 bg-black bg-opacity-70 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-sm">
          <div className="text-neon-green font-semibold">3D Audio Embedding</div>
          <div className="text-gray-400 text-xs mt-1">
            {points.length} points • {isPlaying ? '▶ Playing' : '⏸ Paused'}
          </div>
          <div className="text-gray-500 text-xs mt-1">
            {mouseOver ? 'Drag to rotate • Scroll to zoom' : 'Hover to interact'}
          </div>
        </div>
      </div>

      {/* Time indicator */}
      <div className="absolute top-4 right-4 z-10 bg-black bg-opacity-70 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="text-neon-blue font-mono text-sm">
          {currentTime.toFixed(2)}s
        </div>
      </div>

      {/* 3D Canvas */}
      <Canvas
        onPointerEnter={() => setMouseOver(true)}
        onPointerLeave={() => setMouseOver(false)}
      >
        <PerspectiveCamera makeDefault position={[2, 1, 2]} fov={60} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <pointLight position={[-10, -10, -10]} intensity={0.3} color="#10b981" />

        {/* Point cloud */}
        <PointCloud
          points={points}
          temporalFeatures={temporalFeatures}
          currentTime={currentTime}
          isPlaying={isPlaying}
        />

        {/* Grid helper */}
        <gridHelper args={[4, 20, '#444444', '#222222']} />

        {/* Controls */}
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          rotateSpeed={0.5}
          zoomSpeed={0.8}
          minDistance={1}
          maxDistance={10}
        />
      </Canvas>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-black bg-opacity-70 px-4 py-2 rounded-lg backdrop-blur-sm">
        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-neon-green rounded-full"></div>
            <span className="text-gray-400">Active</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-600 rounded-full"></div>
            <span className="text-gray-400">Inactive</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Audio3DVisualization;
