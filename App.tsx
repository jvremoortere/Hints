import React, { useState, useEffect, useCallback } from 'react';
import { ConceptInput } from './components/ConceptInput';
import { CardPreview } from './components/CardPreview';
import { generatePDF } from './utils/pdfGenerator';
import { GameCard } from './types';
import { Settings, Printer, List, AlertCircle, RefreshCw, Trash2, Type } from 'lucide-react';

export default function App() {
  const [concepts, setConcepts] = useState<string[]>([]);
  const [generatedCards, setGeneratedCards] = useState<GameCard[]>([]);
  const [targetCardCount, setTargetCardCount] = useState<number>(8);
  const [cardTitle, setCardTitle] = useState<string>("wiskunde");
  const [hasGenerated, setHasGenerated] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  // Add a key to force re-render of input component when clearing
  const [resetKey, setResetKey] = useState(0);

  // Calculate stats
  const totalConcepts = concepts.length;
  const maxPossibleCards = Math.floor(totalConcepts / 5);

  const handleConceptsUpdate = (newConcepts: string[]) => {
    // Unique filter
    const unique = Array.from(new Set(newConcepts)).filter(c => c.trim().length > 0);
    setConcepts(unique);
    setHasGenerated(false); // Reset generated state when data changes
  };

  const clearConcepts = () => {
      setConcepts([]);
      setGeneratedCards([]);
      setHasGenerated(false);
      setResetKey(prev => prev + 1); // Force clear the input component
  }

  const generateCards = useCallback(() => {
    if (concepts.length < 5) return;

    // Shuffle concepts
    const shuffled = [...concepts].sort(() => 0.5 - Math.random());
    const newCards: GameCard[] = [];
    
    // Logic: Loop until we reach target count or run out of unique concepts?
    // User requirement: "User can see how many cards need to be made".
    // Let's prioritize filling unique cards first. If target > possible, we warn or loop.
    // For now, let's just loop the content if we need more cards than concepts allow, 
    // ensuring at least within a single card concepts are unique.
    
    let conceptIndex = 0;
    
    for (let i = 0; i < targetCardCount; i++) {
        const cardConcepts: string[] = [];
        for (let j = 0; j < 5; j++) {
            // Loop over concepts array if we run out
            cardConcepts.push(shuffled[conceptIndex % shuffled.length]);
            conceptIndex++;
        }
        newCards.push({
            id: `card-${i}-${Date.now()}`,
            concepts: cardConcepts
        });
    }

    setGeneratedCards(newCards);
    setHasGenerated(true);
  }, [concepts, targetCardCount]);

  const handleDownloadPdf = async () => {
    if (generatedCards.length > 0) {
      setIsGeneratingPdf(true);
      try {
        await generatePDF(generatedCards, cardTitle);
      } catch (error) {
        console.error("Failed to generate PDF", error);
        alert("Er ging iets mis bij het genereren van de PDF.");
      } finally {
        setIsGeneratingPdf(false);
      }
    }
  };

  // Auto-set target card count based on concepts initially, but allow override
  useEffect(() => {
    if (!hasGenerated && totalConcepts > 0) {
        // Default to max possible full cards, or at least 1
        const possible = Math.floor(totalConcepts / 5);
        setTargetCardCount(possible > 0 ? possible : 1);
    }
  }, [totalConcepts, hasGenerated]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-yellow-400 p-1.5 rounded">
                 <List className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
              30 Seconds Generator
            </h1>
          </div>
          <div className="text-sm text-gray-500 hidden sm:block">
             Maak je eigen spel in seconden
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input & Settings */}
          <div className="lg:col-span-5 space-y-6">
            
            <section>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">1</span>
                    Invoer
                </h2>
                <ConceptInput key={resetKey} onConceptsUpdate={handleConceptsUpdate} />
                
                {totalConcepts > 0 && (
                     <div className="mt-4 flex items-center justify-between bg-blue-50 text-blue-700 px-4 py-3 rounded-lg border border-blue-100 text-sm">
                        <span className="font-medium">{totalConcepts} begrippen gevonden</span>
                        <button onClick={clearConcepts} className="text-blue-600 hover:text-red-600 hover:bg-white p-1 rounded transition-colors">
                            <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                )}
            </section>

            <section className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">2</span>
                    Instellingen
                </h2>
                
                <div className="space-y-4">
                    {/* Card Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Titel op kaartje
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Type className="h-4 w-4 text-gray-400" />
                            </div>
                            <input 
                                type="text"
                                value={cardTitle}
                                onChange={(e) => setCardTitle(e.target.value)}
                                maxLength={25}
                                className="pl-9 block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                placeholder="wiskunde"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Max 25 tekens. Lettergrootte past zich automatisch aan.</p>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aantal Kaartjes
                        </label>
                        <div className="flex items-center gap-4">
                            <input 
                                type="range" 
                                min="1" 
                                max={Math.max(50, Math.ceil(totalConcepts/5) + 10)} 
                                value={targetCardCount} 
                                onChange={(e) => {
                                    setTargetCardCount(parseInt(e.target.value));
                                    setHasGenerated(false);
                                }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <input 
                                type="number" 
                                value={targetCardCount}
                                onChange={(e) => {
                                    setTargetCardCount(Math.max(1, parseInt(e.target.value) || 0));
                                    setHasGenerated(false);
                                }}
                                className="w-16 p-2 border border-gray-300 rounded-md text-center font-bold"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {targetCardCount * 5} begrippen nodig. 
                            {totalConcepts < targetCardCount * 5 && (
                                <span className="text-orange-500 ml-1 flex items-center inline-flex gap-1">
                                    <AlertCircle className="w-3 h-3" />
                                    Begrippen worden herhaald.
                                </span>
                            )}
                        </p>
                    </div>

                    <button 
                        onClick={generateCards}
                        disabled={totalConcepts < 5}
                        className="w-full py-3 bg-gray-900 text-white rounded-lg hover:bg-black transition-all flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                    >
                        <RefreshCw className={`w-5 h-5 ${hasGenerated ? '' : 'animate-pulse'}`} />
                        {hasGenerated ? "Kaarten Opnieuw Husselen" : "Genereer Kaarten"}
                    </button>
                </div>
            </section>
          </div>

          {/* Right Column: Preview */}
          <div className="lg:col-span-7 space-y-6">
             <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold">3</span>
                    Voorbeeld
                </h2>
                {generatedCards.length > 0 && (
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                        {generatedCards.length} Kaartjes klaar
                    </span>
                )}
             </div>

             <div className="bg-gray-200 p-6 rounded-xl min-h-[400px] border border-gray-300 shadow-inner">
                 <CardPreview cards={generatedCards} cardTitle={cardTitle} />
             </div>

             {generatedCards.length > 0 && (
                 <div className="sticky bottom-6 bg-white p-4 rounded-xl shadow-lg border border-gray-200 flex items-center justify-between animate-fade-in-up">
                    <div className="text-sm text-gray-600">
                        Klaar om te printen? Er passen 8 kaartjes op 1 A4.
                    </div>
                    <button 
                        onClick={handleDownloadPdf}
                        disabled={isGeneratingPdf}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-75 disabled:cursor-wait"
                    >
                        {isGeneratingPdf ? (
                            <>
                             <RefreshCw className="w-5 h-5 animate-spin" />
                             Bezig...
                            </>
                        ) : (
                            <>
                            <Printer className="w-5 h-5" />
                            Download PDF
                            </>
                        )}
                    </button>
                 </div>
             )}
          </div>

        </div>
      </main>
    </div>
  );
}