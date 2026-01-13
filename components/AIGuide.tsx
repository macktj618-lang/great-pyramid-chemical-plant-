
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, FlaskConical, ShieldAlert, Activity } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Message, ChemicalMode } from '../types';

interface AIGuideProps {
  activeSim?: string | null;
  chemMode: ChemicalMode;
  isSystemRunning?: boolean;
}

const AIGuide: React.FC<AIGuideProps> = ({ activeSim, chemMode, isSystemRunning }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Simulation Environment Ready. Initiating Industrial Feasibility Protocol. I can analyze the chemical logistics of Giza as a mass-production plant." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (activeSim) {
      setIsOpen(true);
      generateAnalysis(activeSim);
    }
  }, [activeSim]);

  useEffect(() => {
    if (isSystemRunning) {
      setMessages(prev => [...prev, { role: 'assistant', content: "[ SYSTEM ALERT ] Scientific verification sequence engaged. Monitoring cross-chamber chemical transport and pressure differentials." }]);
    }
  }, [isSystemRunning]);

  const generateAnalysis = async (chamberId: string) => {
    setIsLoading(true);
    let specificContext = "";
    if (chemMode === 'industrial_acid') {
      switch (chamberId) {
        case 'subterranean-chamber': specificContext = "THE SUMP: Reservoir feasibility. Discuss the bedrock porosity and hydraulic sealing."; break;
        case 'queens-chamber': specificContext = "THE GAS MIXER: Shaft reagent delivery system. Discuss the 20x20cm cross-section as an industrial intake."; break;
        case 'antechamber': specificContext = "THE ACCELERATOR: Acoustic catalysis. Discuss the granite portcullis as a frequency resonator (sonochemistry)."; break;
        case 'kings-chamber': specificContext = "THE BURNER: Thermal containment. Discuss the red granite's resistance to sulfuric acid and high heat."; break;
        case 'grand-gallery': specificContext = "THE REACTION RAMP: Condensation mechanics. Discuss corbelled walls as passive heat exchangers."; break;
      }
    }

    const prompt = chemMode === 'combustion' 
      ? `Provide a technical combustion analysis for ${chamberId} in a methane engine scenario.`
      : `Provide a real-world industrial feasibility score for ${chamberId} as part of a sulfuric acid plant. ${specificContext} Discuss if this architecture 'actually works' for chemical manufacturing.`;

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          systemInstruction: `You are a Senior Chemical Engineer and Archaeometallurgist. 
          Analyze the Great Pyramid as a functional industrial machine.
          Be critical but explore the technical requirements:
          - Sonochemistry (ultrasound in the Antechamber).
          - Reagent intake (Queen's shafts).
          - Thermal containment (King's Chamber).
          Current simulation: ${chemMode}. 
          Provide a feasibility rating (0-100%) for each stage based on known engineering principles.`,
          temperature: 0.8,
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: `[ INDUSTRIAL AUDIT: ${chamberId.toUpperCase()} ]\n\n${response.text}` }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const contents = [...messages, { role: 'user', content: userMsg }]
        .map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
      while (contents.length > 0 && contents[0].role !== 'user') contents.shift();

      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents,
        config: {
          systemInstruction: `Industrial Feasibility Analyst. Critical evaluation of the Giza chemical plant theory. Discuss sonochemical rates, limestone corrosion resistance, and pressure vessels.`,
          temperature: 0.7,
        }
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response.text || "Diagnostic failed." }]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`absolute left-1/2 -translate-x-1/2 bottom-6 flex flex-col-reverse items-center pointer-events-none transition-all duration-300 ${isOpen ? 'h-[75vh]' : 'h-12'} z-50`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto flex items-center gap-2 px-6 py-3 rounded-xl shadow-2xl transition-all font-bold border-2 ${isSystemRunning ? 'bg-red-600 border-red-400 text-white animate-pulse' : 'bg-black/90 backdrop-blur-md text-yellow-500 border-yellow-500/50 hover:bg-yellow-500/10'}`}
      >
        {isSystemRunning ? <ShieldAlert size={18} className="animate-bounce" /> : <FlaskConical size={18} />}
        <span>{isOpen ? 'MINIMIZE DIAGNOSTICS' : 'REACTION ANALYSIS'}</span>
      </button>

      {isOpen && (
        <div className="mb-4 w-[500px] max-w-[90vw] flex-1 bg-black/95 backdrop-blur-3xl border border-white/10 rounded-2xl flex flex-col shadow-3xl pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-bottom-4 ring-1 ring-yellow-500/20">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot size={18} className="text-yellow-500" />
              <div className="flex flex-col">
                <span className="font-bold text-[10px] text-white/80 uppercase tracking-widest">FEASIBILITY AUDITOR v2.5</span>
                <span className="text-[8px] text-yellow-500/50 uppercase font-mono tracking-tighter">Real-time Scientific Verification</span>
              </div>
            </div>
            {isSystemRunning && <div className="text-[8px] text-red-500 font-bold animate-pulse px-2 py-0.5 rounded border border-red-500/30">MONITORING FLOW...</div>}
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide font-mono">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-xl text-[11px] leading-relaxed border ${
                  msg.role === 'user' ? 'bg-yellow-500 text-black border-yellow-400 font-bold' : 'bg-white/5 text-white/80 border-white/10'
                } max-w-[95%] whitespace-pre-wrap shadow-sm`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-[10px] text-yellow-500/50 italic animate-pulse">
                <Activity size={12} /> Running industrial audit...
              </div>
            )}
          </div>
          <div className="p-4 bg-black/40 border-t border-white/10 flex gap-2">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-yellow-500"
              placeholder="Query chemical logistics or feasibility scores..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="p-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors">
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGuide;
