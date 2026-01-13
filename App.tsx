
import React, { useState, Suspense, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Sky, Stars, Environment, ContactShadows } from '@react-three/drei';
import PyramidScene from './components/PyramidScene';
import UIOverlay from './components/UIOverlay';
import AIGuide from './components/AIGuide';
import { ViewMode, SimState, ChemicalMode } from './types';
import { PYRAMID_FEATURES } from './constants';

const INITIAL_SIM: SimState = {
  concentration: 0,
  temperature: 25,
  pressure: 1,
  isReacting: false,
  hasReacted: false,
  energyReleased: 0,
  corrosionLevel: 0,
  phLevel: 7
};

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('xray');
  const [chemMode, setChemMode] = useState<ChemicalMode>('industrial_acid');
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isSystemRunning, setIsSystemRunning] = useState(false);
  const [chamberSims, setChamberSims] = useState<Record<string, SimState>>({
    'kings-chamber': { ...INITIAL_SIM },
    'antechamber': { ...INITIAL_SIM },
    'queens-chamber': { ...INITIAL_SIM },
    'subterranean-chamber': { ...INITIAL_SIM },
    'grand-gallery': { ...INITIAL_SIM }
  });

  const updateSim = (id: string, updates: Partial<SimState>) => {
    setChamberSims(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const runSimulation = (id: string, silent: boolean = false): Promise<void> => {
    return new Promise((resolve) => {
      const sim = chamberSims[id];
      
      if (chemMode === 'combustion') {
        if (sim.concentration < 5) {
          updateSim(id, { concentration: 10 }); // Auto-prime for sequence
        }
      } else {
        if (sim.concentration < 10) {
          updateSim(id, { concentration: 100 }); // Auto-prime for sequence
        }
      }

      updateSim(id, { isReacting: true });
      let progress = 0;
      const interval = setInterval(() => {
        progress += 0.04;
        let updates: Partial<SimState> = {
          isReacting: true,
          corrosionLevel: progress,
          temperature: 25 + (30 * progress),
          pressure: 1 + (0.5 * progress)
        };

        if (chemMode === 'industrial_acid') {
          if (id === 'queens-chamber') {
            updates.phLevel = Math.max(1.0, 7 - (100 / 8) * progress);
          } else if (id === 'kings-chamber') {
            updates.temperature = 25 + (600 * progress);
            updates.pressure = 1 + (2.0 * progress);
          } else if (id === 'antechamber') {
            updates.pressure = 1 + Math.sin(progress * 50) * 0.5;
          } else if (id === 'grand-gallery') {
            updates.phLevel = Math.max(0.5, 7 - (100 / 5) * progress);
            updates.pressure = 1 + (5.0 * progress);
          } else if (id === 'subterranean-chamber') {
            updates.phLevel = Math.max(2.0, 7 - (100 / 15) * progress);
          }
        } else {
          const peakTemp = 1950;
          updates.temperature = 25 + peakTemp * progress;
          updates.pressure = 1 + 8 * progress;
        }

        updateSim(id, updates);

        if (progress >= 1) {
          clearInterval(interval);
          updateSim(id, { isReacting: false, hasReacted: true });
          resolve();
        }
      }, 50);
    });
  };

  const runRealLifeSimulation = async () => {
    if (isSystemRunning) return;
    setIsSystemRunning(true);
    resetAll();

    // Sequence: Sump -> Mixer -> Accelerator -> Burner -> Ramp
    const sequence = [
      'subterranean-chamber',
      'queens-chamber',
      'antechamber',
      'kings-chamber',
      'grand-gallery'
    ];

    for (const chamberId of sequence) {
      setSelectedFeature(chamberId);
      await runSimulation(chamberId, true);
      await new Promise(r => setTimeout(r, 800)); // Delay between stages
    }

    setIsSystemRunning(false);
  };

  const resetSim = (id: string) => {
    updateSim(id, INITIAL_SIM);
  };

  const resetAll = () => {
    const resetStates: Record<string, SimState> = {};
    PYRAMID_FEATURES.forEach(f => resetStates[f.id] = { ...INITIAL_SIM });
    setChamberSims(resetStates);
    setIsSystemRunning(false);
  };

  return (
    <div className="relative w-full h-screen bg-black">
      <Canvas shadows gl={{ antialias: true }}>
        <PerspectiveCamera makeDefault position={[30, 20, 30]} fov={45} />
        <OrbitControls 
          enableDamping 
          dampingFactor={0.05} 
          maxPolarAngle={Math.PI / 2.1} 
          minDistance={10} 
          maxDistance={100} 
        />
        
        <Suspense fallback={null}>
          <Sky sunPosition={[100, 20, 100]} turbidity={0.1} rayleigh={2} />
          <Stars radius={100} depth={50} count={5000} factor={4} />
          <Environment preset="sunset" />
          
          <ambientLight intensity={0.4} />
          <directionalLight position={[50, 50, 50]} intensity={1.2} castShadow />
          
          <PyramidScene 
            viewMode={viewMode} 
            chemMode={chemMode}
            selectedFeature={selectedFeature} 
            onFeatureClick={(id) => setSelectedFeature(id)} 
            chamberSims={chamberSims}
            isSystemRunning={isSystemRunning}
          />

          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
            <planeGeometry args={[1000, 1000]} />
            <meshStandardMaterial color="#c2b280" roughness={0.9} />
          </mesh>
          <ContactShadows resolution={1024} scale={50} blur={2} opacity={0.5} far={10} color="#000000" />
        </Suspense>
      </Canvas>

      <UIOverlay 
        viewMode={viewMode} 
        setViewMode={setViewMode} 
        chemMode={chemMode}
        setChemMode={setChemMode}
        selectedFeature={selectedFeature}
        setSelectedFeature={setSelectedFeature}
        chamberSims={chamberSims}
        onUpdateSim={updateSim}
        onRunReaction={runSimulation}
        onRunAll={runRealLifeSimulation}
        onReset={resetSim}
        onResetAll={resetAll}
        isSystemRunning={isSystemRunning}
      />

      <AIGuide 
        activeSim={Object.keys(chamberSims).find(id => chamberSims[id].isReacting) || null} 
        chemMode={chemMode}
        isSystemRunning={isSystemRunning}
      />

      <div className="absolute bottom-4 left-4 text-white/50 text-[10px] pointer-events-none select-none font-mono flex flex-col gap-1">
        <span>MODE: {chemMode === 'combustion' ? 'INTERNAL COMBUSTION ANALYSIS' : 'H2SO4 INDUSTRIAL FEASIBILITY'}</span>
        <div className="flex gap-4">
          <span>{chemMode === 'combustion' ? '$CH_4 + 2O_2 \\rightarrow CO_2 + 2H_2O$' : '$CaCO_3 + H_2SO_4 \\rightarrow CaSO_4 + H_2O + CO_2$'}</span>
          {isSystemRunning && <span className="text-yellow-500 animate-pulse tracking-widest">[ EXECUTING SYSTEM FLOW ]</span>}
        </div>
      </div>
    </div>
  );
};

export default App;
