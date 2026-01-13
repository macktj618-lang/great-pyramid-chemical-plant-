
import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Html } from '@react-three/drei';
import * as THREE from 'three';
import { PYRAMID_HEIGHT, PYRAMID_BASE, PYRAMID_FEATURES, COLORS } from '../constants';
import { ViewMode, SimState, ChemicalMode } from '../types';

interface PyramidSceneProps {
  viewMode: ViewMode;
  chemMode: ChemicalMode;
  selectedFeature: string | null;
  onFeatureClick: (id: string) => void;
  chamberSims: Record<string, SimState>;
  isSystemRunning?: boolean;
}

const FlowParticles = ({ start, end, active, color }: { start: THREE.Vector3, end: THREE.Vector3, active: boolean, color: string }) => {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 5; i++) pts.push(new THREE.Vector3().copy(start));
    return pts;
  }, [start]);

  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!active || !groupRef.current) return;
    groupRef.current.children.forEach((child, i) => {
      const t = (state.clock.elapsedTime * 0.5 + i / 5) % 1;
      child.position.lerpVectors(start, end, t);
      (child as THREE.Mesh).scale.setScalar(0.1 + Math.sin(t * Math.PI) * 0.1);
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef}>
      {points.map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

const ChemicalAtmosphere = ({ sim, chemMode }: { sim: SimState, chemMode: ChemicalMode }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      const pulse = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
      meshRef.current.scale.setScalar(sim.isReacting ? 1.2 : pulse);
    }
  });

  const color = useMemo(() => {
    if (sim.isReacting) return chemMode === 'combustion' ? "#ffffff" : "#ffff00";
    if (sim.hasReacted) return chemMode === 'combustion' ? "#708090" : "#aacc00"; 
    return chemMode === 'combustion' ? "#00ffff" : "#32cd32"; 
  }, [sim.isReacting, sim.hasReacted, chemMode]);

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.6, 0.9, 1.3]} />
      <MeshDistortMaterial
        color={color}
        speed={sim.isReacting ? 8 : 1}
        distort={sim.isReacting ? 0.6 : 0.3}
        transparent
        opacity={(sim.concentration / 100) * 0.7}
        emissive={color}
        emissiveIntensity={sim.isReacting ? 3 : 0.3}
      />
    </mesh>
  );
};

const Passage = ({ start, end, active, chemMode, size = 0.2 }: { start: THREE.Vector3, end: THREE.Vector3, active: boolean, chemMode: ChemicalMode, size?: number }) => {
  const direction = new THREE.Vector3().subVectors(end, start);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
  const dummy = new THREE.Object3D();
  dummy.position.copy(midpoint);
  dummy.lookAt(end);
  
  return (
    <group>
      <mesh position={midpoint} quaternion={dummy.quaternion}>
        <boxGeometry args={[size, size, length]} />
        <meshBasicMaterial 
          color={active ? (chemMode === 'combustion' ? "#ff4400" : "#ffff00") : "#444"} 
          transparent 
          opacity={active ? 0.8 : 0.2} 
        />
      </mesh>
      <FlowParticles 
        start={start} 
        end={end} 
        active={active} 
        color={chemMode === 'combustion' ? "#00ffff" : "#ffff00"} 
      />
    </group>
  );
};

const PyramidScene: React.FC<PyramidSceneProps> = ({ 
  viewMode, 
  chemMode,
  selectedFeature, 
  onFeatureClick, 
  chamberSims,
  isSystemRunning
}) => {
  const radius = PYRAMID_BASE / Math.SQRT2;

  const entrance = new THREE.Vector3(0, 1.7, 11.5);
  const subterranean = new THREE.Vector3(0, -3.0, 0);
  const junction = new THREE.Vector3(0, -0.5, 3.5);
  const galleryStart = new THREE.Vector3(0, 2.1, 1.5);
  const galleryEnd = new THREE.Vector3(0, 4.3, 0.8);
  const kingsChamberPos = new THREE.Vector3(0, 4.3, 0);
  const queensChamberPos = new THREE.Vector3(0, 2.1, 0);

  // Shafts
  const qnShaft = new THREE.Vector3(0, 2.1, 0).add(new THREE.Vector3(0, 5, 8));
  const qsShaft = new THREE.Vector3(0, 2.1, 0).add(new THREE.Vector3(0, 5, -8));
  const knShaft = new THREE.Vector3(0, 4.3, 0).add(new THREE.Vector3(0, 6, 8));
  const ksShaft = new THREE.Vector3(0, 4.3, 0).add(new THREE.Vector3(0, 6, -8));

  return (
    <group>
      <mesh position={[0, PYRAMID_HEIGHT / 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <cylinderGeometry args={[0, radius, PYRAMID_HEIGHT, 4]} />
        <meshStandardMaterial 
          color={COLORS.stone} 
          transparent={viewMode !== 'exterior'}
          opacity={viewMode === 'exterior' ? 1.0 : viewMode === 'xray' ? 0.15 : 0.05}
          side={THREE.DoubleSide}
        />
      </mesh>

      <group visible={viewMode !== 'exterior'}>
        <Passage start={entrance} end={subterranean} active={chamberSims['subterranean-chamber'].isReacting} chemMode={chemMode} />
        <Passage start={junction} end={galleryStart} active={chamberSims['grand-gallery'].isReacting || chamberSims['queens-chamber'].isReacting} chemMode={chemMode} />
        <Passage start={galleryStart} end={galleryEnd} active={chamberSims['grand-gallery'].isReacting} chemMode={chemMode} size={0.3} />
        <Passage start={galleryEnd} end={kingsChamberPos} active={chamberSims['kings-chamber'].isReacting} chemMode={chemMode} />
        <Passage start={galleryStart} end={queensChamberPos} active={chamberSims['queens-chamber'].isReacting} chemMode={chemMode} />
        
        {/* Shafts */}
        <Passage start={qnShaft} end={queensChamberPos} active={chamberSims['queens-chamber'].isReacting} chemMode={chemMode} size={0.05} />
        <Passage start={qsShaft} end={queensChamberPos} active={chamberSims['queens-chamber'].isReacting} chemMode={chemMode} size={0.05} />
        <Passage start={knShaft} end={kingsChamberPos} active={chamberSims['kings-chamber'].isReacting} chemMode={chemMode} size={0.08} />
        <Passage start={ksShaft} end={kingsChamberPos} active={chamberSims['kings-chamber'].isReacting} chemMode={chemMode} size={0.08} />

        {PYRAMID_FEATURES.map((feature) => {
          const sim = chamberSims[feature.id];
          const isSelected = selectedFeature === feature.id;
          const isAntechamber = feature.id === 'antechamber';

          return (
            <group key={feature.id} position={feature.position}>
              <ChemicalAtmosphere sim={sim} chemMode={chemMode} />

              <mesh onClick={(e) => { e.stopPropagation(); onFeatureClick(feature.id); }}>
                <boxGeometry args={isAntechamber ? [0.6, 0.8, 0.4] : [1.5, 0.8, 1.2]} />
                <meshStandardMaterial 
                  color={sim.hasReacted ? (chemMode === 'combustion' ? "#221100" : "#667700") : isSelected ? COLORS.gold : COLORS.glow} 
                  emissive={sim.isReacting ? (chemMode === 'combustion' ? "#ffcc00" : "#ffff00") : (isSelected ? COLORS.gold : "#000")}
                  emissiveIntensity={sim.isReacting ? 5 : 1}
                  transparent 
                  opacity={0.8}
                />
              </mesh>

              <Html distanceFactor={10} position={[0, 1.2, 0]}>
                <div className={`px-2 py-1 rounded border text-[10px] font-mono whitespace-nowrap transition-all pointer-events-none select-none ${
                  sim.isReacting ? 'bg-black text-white border-white scale-110' :
                  sim.hasReacted ? 'bg-zinc-800 text-yellow-500 border-yellow-900' :
                  isSelected ? 'bg-yellow-500 text-black border-yellow-300 font-bold' : 'bg-black/60 text-cyan-300'
                }`}>
                  {feature.name} {sim.isReacting && "PROCESS ACTIVE"}
                </div>
              </Html>
            </group>
          );
        })}
      </group>
    </group>
  );
};

export default PyramidScene;
