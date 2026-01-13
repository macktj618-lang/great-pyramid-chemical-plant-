
import React from 'react';
import { Layers, Box, Info, X, Map, Droplets, Zap, Thermometer, Gauge, Activity, RefreshCcw, FlaskConical, Shovel, Music, Power, PlayCircle } from 'lucide-react';
import { ViewMode, SimState, ChemicalMode } from '../types';
import { PYRAMID_FEATURES } from '../constants';

interface UIOverlayProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  chemMode: ChemicalMode;
  setChemMode: (mode: ChemicalMode) => void;
  selectedFeature: string | null;
  setSelectedFeature: (id: string | null) => void;
  chamberSims: Record<string, SimState>;
  onUpdateSim: (id: string, updates: Partial<SimState>) => void;
  onRunReaction: (id: string) => void;
  onRunAll: () => void;
  onReset: (id: string) => void;
  onResetAll: () => void;
  isSystemRunning: boolean;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  viewMode, 
  setViewMode, 
  chemMode,
  setChemMode,
  selectedFeature, 
  setSelectedFeature,
  chamberSims,
  onUpdateSim,
  onRunReaction,
  onRunAll,
  onReset,
  onResetAll,
  isSystemRunning
}) => {
  const currentFeature = PYRAMID_FEATURES.find(f => f.id === selectedFeature);
  const sim = selectedFeature ? chamberSims[selectedFeature] : null;

  const getTheoreticalName = (id: string) => {
    if (chemMode === 'combustion') return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    switch (id) {
      case 'kings-chamber': return 'The Burner (SO2 Refining)';
      case 'antechamber': return 'The Acoustic Accelerator';
      case 'queens-chamber': return 'The Gas Mixer (H2 Synth)';
      case 'grand-gallery': return 'The Reaction Ramp';
      case 'subterranean-chamber': return 'The Sump (Hydraulic Reservoir)';
      default: return id;
    }
  };

  const isAnyReacting = (Object.values(chamberSims) as SimState[]).some(s => s.isReacting);

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* HUD Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/80 backdrop-blur-md p-4 border border-white/10 rounded-lg shadow-2xl">
          <h1 className="text-xl font-bold text-yellow-500 tracking-wider flex items-center gap-2">
            <Activity className={isAnyReacting ? "text-red-500 animate-pulse" : "text-green-500"} size={20} />
            {chemMode === 'combustion' ? 'COMBUSTION ENGINE ANALYSIS' : 'H2SO4 INDUSTRIAL PLANT'}
          </h1>
          <p className="text-[10px] text-white/40 tracking-[0.2em] uppercase">Giza Technical Analysis HUD</p>
        </div>

        <div className="flex gap-2">
          <div className="bg-black/60 rounded-full p-1 border border-white/10 flex mr-4">
            <button
              onClick={() => setChemMode('combustion')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${chemMode === 'combustion' ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              COMBUSTION
            </button>
            <button
              onClick={() => setChemMode('industrial_acid')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${chemMode === 'industrial_acid' ? 'bg-green-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
            >
              ACID PLANT
            </button>
          </div>
          {['exterior', 'xray', 'interior'].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={`px-4 py-2 rounded-full transition-all border text-xs uppercase tracking-widest ${
                viewMode === mode ? 'bg-yellow-500 text-black border-yellow-400 font-bold shadow-lg' : 'bg-black/60 text-white border-white/20'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Main Control Panel */}
      <div className="flex justify-between items-end gap-6 h-2/5">
        <div className="pointer-events-auto flex flex-col gap-2 bg-black/60 p-4 rounded-xl border border-white/10 backdrop-blur-md w-72">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Process Sequence Sensors</h3>
            <button 
              onClick={onResetAll}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/30 hover:text-white"
              title="Reset All Chambers"
            >
              <RefreshCcw size={12} />
            </button>
          </div>
          
          <div className="flex flex-col gap-1.5">
            {PYRAMID_FEATURES.map((feature) => {
              const fSim = chamberSims[feature.id];
              return (
                <button
                  key={feature.id}
                  onClick={() => setSelectedFeature(feature.id)}
                  className={`flex flex-col gap-1 p-2 rounded-lg transition-all border ${
                    selectedFeature === feature.id ? 'bg-white/10 border-yellow-500/50' : 'border-transparent hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-[10px] font-bold text-left ${selectedFeature === feature.id ? 'text-yellow-400' : 'text-white/70'}`}>
                      {getTheoreticalName(feature.id)}
                    </span>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${fSim.isReacting ? 'bg-red-500 animate-ping' : fSim.hasReacted ? 'bg-zinc-600' : chemMode === 'combustion' ? 'bg-cyan-500' : 'bg-green-500'}`} />
                  </div>
                  <div className="flex justify-between text-[8px] text-white/40 font-mono">
                    {chemMode === 'combustion' ? (
                      <><span>{fSim.temperature.toFixed(0)}°C</span><span>{fSim.pressure.toFixed(1)} Bar</span></>
                    ) : (
                      <><span>pH {fSim.phLevel.toFixed(1)}</span><span>{fSim.temperature.toFixed(0)}°C</span></>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={onRunAll}
            disabled={isSystemRunning}
            className={`mt-2 py-3 rounded-lg font-bold text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${
              isSystemRunning 
              ? 'bg-zinc-800 text-yellow-500 border-yellow-500/40 animate-pulse cursor-wait'
              : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/40 hover:bg-yellow-500 hover:text-black hover:border-yellow-400 shadow-xl'
            }`}
          >
            {isSystemRunning ? <Power size={14} className="animate-spin" /> : <PlayCircle size={14} />}
            {isSystemRunning ? 'EXECUTING REAL-LIFE SIM' : 'ACTIVATE SCIENTIFIC SEQUENCE'}
          </button>
        </div>

        {currentFeature && sim && (
          <div className="pointer-events-auto flex-1 max-w-2xl bg-black/90 backdrop-blur-2xl border border-white/20 p-6 rounded-2xl shadow-3xl relative animate-in slide-in-from-bottom-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{getTheoreticalName(currentFeature.id)}</h2>
                <div className="flex gap-4 mt-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${chemMode === 'combustion' ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-green-500/20 text-green-400 border-green-500/30'}`}>
                    {chemMode === 'combustion' ? 'GAS: CH4' : 'REAGENT: H2SO4'}
                  </span>
                  {chemMode === 'industrial_acid' && currentFeature.id === 'antechamber' && (
                    <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 font-bold flex items-center gap-1">
                      <Music size={10} /> SONOCHEMICAL ACTIVATION
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onReset(currentFeature.id)} className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg transition-colors">
                  <RefreshCcw size={18} />
                </button>
                <button onClick={() => setSelectedFeature(null)} className="p-2 bg-white/5 text-white/40 hover:text-white rounded-lg transition-colors">
                  <X size={18} />
                </button>
              </div>
            </div>

            <p className="text-white/60 text-[10px] mb-6 leading-relaxed font-mono border-l-2 border-yellow-500/30 pl-4">
              {chemMode === 'combustion' ? currentFeature.description : 
                currentFeature.id === 'kings-chamber' ? "THE BURNER: Primary refining stage. High-temperature oxidation of sulfur compounds within a granite enclosure capable of containing 600°C+ gases." :
                currentFeature.id === 'antechamber' ? "THE ACCELERATOR: Sonochemical zone. Ultrasound waves generated by oscillating granite portcullis slabs increase reaction rates by 10^3-10^5." :
                currentFeature.id === 'queens-chamber' ? "THE GAS MIXER: Binary reagent combining zone. Dilute acid and ammonia/salt salts injected via 20x20cm shafts to produce highly reactive precursors." :
                currentFeature.id === 'grand-gallery' ? "THE REACTION RAMP: Final synthesis and compression. Step-like corbelling creates pressure differentials optimized for acid condensation." :
                "THE SUMP: Hydraulic reservoir. Bedrock chamber serving as a closed-loop waste filtration and chemical cycling point."
              }
            </p>

            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex justify-between">
                    {chemMode === 'combustion' ? 'Methane Conc.' : 'Stage Efficacy'} <span>{sim.concentration}%</span>
                  </label>
                  <input 
                    type="range" min="0" max="100" step="0.5"
                    value={sim.concentration}
                    disabled={sim.isReacting || sim.hasReacted || isSystemRunning}
                    onChange={(e) => onUpdateSim(currentFeature.id, { concentration: parseFloat(e.target.value) })}
                    className={`w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer ${chemMode === 'combustion' ? 'accent-cyan-500' : 'accent-green-500'}`}
                  />
                </div>

                {!sim.hasReacted && (
                  <button
                    onClick={() => onRunReaction(currentFeature.id)}
                    disabled={sim.isReacting || isSystemRunning}
                    className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                      sim.concentration > 0
                      ? chemMode === 'combustion' ? 'bg-red-600 text-white hover:bg-red-500 shadow-lg shadow-red-500/20' : 'bg-green-600 text-white hover:bg-green-500 shadow-lg shadow-green-500/20'
                      : 'bg-white/5 text-white/20 cursor-not-allowed'
                    }`}
                  >
                    <Zap size={16} />
                    {sim.isReacting ? 'PROCESSING...' : (chemMode === 'combustion' ? 'IGNITE' : 'ACTIVATE')}
                  </button>
                )}
                {sim.hasReacted && (
                  <div className={`p-3 rounded-xl border text-[10px] font-bold text-center ${chemMode === 'combustion' ? 'bg-zinc-800 border-red-900/50 text-red-500' : 'bg-zinc-800 border-green-900/50 text-green-500'}`}>
                    {chemMode === 'combustion' ? 'CYCLE COMPLETE' : 'STAGE STABILIZED'}
                  </div>
                )}
              </div>

              <div className="col-span-2 grid grid-cols-2 gap-3">
                {[
                  { label: 'Thermal Output', value: `${sim.temperature.toFixed(1)}°C`, icon: Thermometer, color: 'text-orange-500' },
                  { label: chemMode === 'combustion' ? 'Vapor P' : 'Process pH', value: chemMode === 'combustion' ? `${sim.pressure.toFixed(2)} Bar` : `${sim.phLevel.toFixed(1)}`, icon: chemMode === 'combustion' ? Gauge : FlaskConical, color: 'text-cyan-400' },
                  { label: 'Energy Flux', value: chemMode === 'combustion' ? `${sim.energyReleased.toFixed(1)} MJ` : `${(sim.corrosionLevel * 100).toFixed(0)}%`, icon: chemMode === 'combustion' ? Zap : Activity, color: 'text-yellow-400' },
                  { label: 'Integrity', value: sim.hasReacted ? 'Post-Op' : 'Ready', icon: Activity, color: sim.hasReacted ? 'text-red-500' : 'text-green-500' }
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-3 rounded-xl flex items-center gap-3 backdrop-blur-sm">
                    <stat.icon className={`${stat.color} opacity-80`} size={18} />
                    <div>
                      <span className="block text-[7px] uppercase tracking-tighter text-white/30 font-bold">{stat.label}</span>
                      <span className="block text-xs font-mono text-white font-medium">{stat.value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UIOverlay;
