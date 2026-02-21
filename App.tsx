
import React, { useState, useEffect, useCallback } from 'react';
import { LogoGenerationParams, GeneratedLogo, LogoStyle } from './types';
import { generateLogo, editLogo } from './services/geminiService';
import LogoCard from './components/LogoCard';

const STYLES: { id: LogoStyle; label: string; icon: string }[] = [
  { id: 'minimalist', label: 'Minimalist', icon: '✨' },
  { id: 'cyberpunk', label: 'Cyberpunk', icon: '⚡' },
  { id: 'corporate', label: 'Corporate', icon: '💼' },
  { id: 'abstract', label: 'Abstract', icon: '🎨' },
  { id: '3d', label: '3D Glossy', icon: '🧊' },
  { id: 'line-art', label: 'Line Art', icon: '🖋️' },
  { id: 'gradient', label: 'Gradient', icon: '🌈' },
];

const PALETTES = [
  { name: 'Ocean Tech', colors: 'Blue, Cyan, Navy' },
  { name: 'Neon Night', colors: 'Purple, Pink, Black' },
  { name: 'Eco Future', colors: 'Green, White, Silver' },
  { name: 'Luxury Gold', colors: 'Black, Gold, Charcoal' },
  { name: 'Pure Minimal', colors: 'Black & White' },
];

const App: React.FC = () => {
  const [params, setParams] = useState<LogoGenerationParams>({
    prompt: '',
    style: 'minimalist',
    colorPalette: 'Ocean Tech',
    isHighQuality: false,
  });

  const [logos, setLogos] = useState<GeneratedLogo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isIterating, setIsIterating] = useState<GeneratedLogo | null>(null);
  const [iterationInstruction, setIterationInstruction] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isApiKeyReady, setIsApiKeyReady] = useState(false);

  // Check Pro Mode API key requirements
  const checkApiKey = useCallback(async () => {
    if (typeof (window as any).aistudio?.hasSelectedApiKey === 'function') {
      const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setIsApiKeyReady(hasKey);
    }
  }, []);

  useEffect(() => {
    checkApiKey();
  }, [checkApiKey]);

  const handleOpenKeyPicker = async () => {
    if (typeof (window as any).aistudio?.openSelectKey === 'function') {
      await (window as any).aistudio.openSelectKey();
      setIsApiKeyReady(true); // Assume success per guidelines
    }
  };

  const handleGenerate = async () => {
    if (params.isHighQuality && !isApiKeyReady) {
      setError("Please select an API key for High Quality (Pro) mode.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      const url = await generateLogo(params);
      const newLogo: GeneratedLogo = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        prompt: params.prompt,
        timestamp: Date.now(),
        params: { ...params },
      };
      setLogos(prev => [newLogo, ...prev]);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to generate logo. Please try again.");
      if (err.message?.includes("Requested entity was not found")) {
        setIsApiKeyReady(false);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleIterate = async () => {
    if (!isIterating) return;
    setIsGenerating(true);
    setError(null);
    try {
      const url = await editLogo({
        baseImage: isIterating.url,
        instruction: iterationInstruction,
      });
      const newLogo: GeneratedLogo = {
        id: Math.random().toString(36).substr(2, 9),
        url,
        prompt: iterationInstruction,
        timestamp: Date.now(),
        params: { ...isIterating.params, prompt: `${isIterating.params.prompt} -> ${iterationInstruction}` },
      };
      setLogos(prev => [newLogo, ...prev]);
      setIsIterating(null);
      setIterationInstruction('');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to iterate. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLogo = (logo: GeneratedLogo) => {
    const link = document.createElement('a');
    link.href = logo.url;
    link.download = `lingko-tech-${logo.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-lg">L</div>
            <h1 className="font-heading text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              Lingko Studio
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {params.isHighQuality && !isApiKeyReady ? (
              <button 
                onClick={handleOpenKeyPicker}
                className="text-xs bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1.5 rounded-full hover:bg-amber-500/20 transition-all"
              >
                Setup Pro API Key
              </button>
            ) : params.isHighQuality ? (
              <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-full border border-green-400/20">Pro Mode Active</span>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Sidebar - Controls */}
        <aside className="lg:col-span-4 space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" /></svg>
              Design Configuration
            </h2>
            
            <div className="space-y-4">
              {/* Brand Prompt */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1.5">Brand Identity / Keywords</label>
                <textarea 
                  value={params.prompt}
                  onChange={(e) => setParams({ ...params, prompt: e.target.value })}
                  placeholder="e.g. futuristic networking, bridge between data points, digital synergy"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all h-24 resize-none"
                />
              </div>

              {/* Style Presets */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Visual Style</label>
                <div className="grid grid-cols-2 gap-2">
                  {STYLES.map((style) => (
                    <button
                      key={style.id}
                      onClick={() => setParams({ ...params, style: style.id })}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                        params.style === style.id 
                        ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-600'
                      }`}
                    >
                      <span>{style.icon}</span>
                      {style.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Palettes */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Color Palette</label>
                <select 
                  value={params.colorPalette}
                  onChange={(e) => setParams({ ...params, colorPalette: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm outline-none appearance-none"
                >
                  {PALETTES.map(p => (
                    <option key={p.name} value={p.name}>{p.name} ({p.colors})</option>
                  ))}
                </select>
              </div>

              {/* Quality Toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Pro Quality (1K)</span>
                  {!isApiKeyReady && params.isHighQuality && (
                     <div className="group relative">
                        <svg className="w-4 h-4 text-amber-500 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <div className="absolute left-0 bottom-full mb-2 w-48 bg-slate-800 text-xs p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-slate-700">
                          Requires setup of a billing-enabled API key.
                        </div>
                     </div>
                  )}
                </div>
                <button 
                  onClick={() => setParams({ ...params, isHighQuality: !params.isHighQuality })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${params.isHighQuality ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${params.isHighQuality ? 'translate-x-6' : ''}`} />
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !params.prompt}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isGenerating || !params.prompt 
                  ? 'bg-slate-700 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white'
                }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Synthesizing...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Generate Logo
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content - Gallery */}
        <section className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-heading font-bold">Studio Canvas</h2>
            <div className="text-sm text-slate-500">
              {logos.length} designs generated
            </div>
          </div>

          {logos.length === 0 && !isGenerating ? (
            <div className="bg-slate-800/20 border-2 border-dashed border-slate-700 rounded-2xl h-[400px] flex flex-col items-center justify-center text-slate-500 text-center px-8">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <p className="text-lg font-medium text-slate-400">Your vision starts here</p>
              <p className="max-w-xs mt-1">Configure your design on the left and click generate to see the magic of AI architecture.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {isGenerating && (
                 <div className="animate-pulse bg-slate-800/50 rounded-xl aspect-square border border-slate-700 flex items-center justify-center">
                   <div className="flex flex-col items-center gap-4">
                     <div className="w-12 h-12 bg-slate-700 rounded-full animate-bounce"></div>
                     <span className="text-xs text-slate-500">Generating next concept...</span>
                   </div>
                 </div>
              )}
              {logos.map(logo => (
                <LogoCard 
                  key={logo.id} 
                  logo={logo} 
                  onSelect={setIsIterating}
                  onDownload={downloadLogo}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Iteration Modal */}
      {isIterating && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
            <div className="md:w-1/2 p-6 bg-slate-900 flex items-center justify-center">
              <img src={isIterating.url} alt="Base" className="w-full h-full object-contain max-h-[300px] rounded-lg" />
            </div>
            <div className="md:w-1/2 p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold font-heading">Refine Design</h3>
                <button onClick={() => setIsIterating(null)} className="text-slate-500 hover:text-white">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className="text-sm text-slate-400">Give specific instructions to modify this design while maintaining the core identity.</p>
              
              <textarea 
                value={iterationInstruction}
                onChange={(e) => setIterationInstruction(e.target.value)}
                placeholder="e.g. Add a glowing blue ring around the logo, or make the font bolder..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none h-32 resize-none"
              />

              <div className="flex gap-3">
                <button 
                  onClick={() => setIsIterating(null)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleIterate}
                  disabled={!iterationInstruction || isGenerating}
                  className={`flex-1 font-bold py-3 rounded-xl transition-all ${
                    !iterationInstruction || isGenerating 
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                  }`}
                >
                  {isGenerating ? 'Processing...' : 'Apply Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">© 2024 Lingko Tech Studio. Built with Gemini Visual Intelligence.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Brand Guidelines</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Design Systems</a>
            <a href="#" className="text-xs text-slate-500 hover:text-slate-300">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
