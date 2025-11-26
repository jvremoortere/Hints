import React from 'react';
import { GameCard } from '../types';

interface CardPreviewProps {
  cards: GameCard[];
  cardTitle: string;
}

export const CardPreview: React.FC<CardPreviewProps> = ({ cards, cardTitle }) => {
  const displayTitle = cardTitle.trim() || "wiskunde";

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-gray-400 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
        <p>Nog geen kaarten gegenereerd.</p>
      </div>
    );
  }

  // Calculate font size class based on title length
  const getTitleClass = (title: string) => {
      const len = title.length;
      if (len > 18) return "text-[8px]"; // Very long text
      if (len > 12) return "text-[10px]"; // Long text
      return "text-xs"; // Standard
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-2">
      {cards.map((card) => (
        <div 
          key={card.id} 
          className="relative bg-white border border-gray-300 shadow-sm rounded overflow-hidden flex"
          style={{ width: '100%', aspectRatio: '90/50', minHeight: '140px' }} // Approximate aspect ratio for screen
        >
          {/* Yellow Strip */}
          <div className="w-8 bg-yellow-400 h-full flex items-center justify-center flex-shrink-0">
             <span className={`text-black font-bold transform -rotate-90 whitespace-nowrap tracking-wider ${getTitleClass(displayTitle)}`}>
                {displayTitle}
             </span>
          </div>
          
          {/* Content */}
          <div className="flex-1 p-4 flex flex-col justify-center bg-gradient-to-br from-white to-gray-50">
            <ul className="space-y-1">
              {card.concepts.map((concept, idx) => (
                <li key={idx} className="text-sm font-bold text-gray-800 border-b border-gray-100 last:border-0 pb-0.5 truncate">
                  {concept}
                </li>
              ))}
              {/* Fill empty spots if less than 5 */}
              {Array.from({ length: 5 - card.concepts.length }).map((_, idx) => (
                 <li key={`empty-${idx}`} className="text-sm text-gray-200 border-b border-gray-100 pb-0.5">-</li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};