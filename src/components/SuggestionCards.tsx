import React from 'react';

const suggestions = [
  "Chill Evening",
  "Workout Energy",
  "Road Trip Vibes",
];

interface SuggestionCardsProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SuggestionCards: React.FC<SuggestionCardsProps> = ({ onSuggestionClick }) => {
  return (
    <div className="py-8 px-4">
      <div className="flex flex-wrap justify-center gap-4 max-w-3xl mx-auto">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="px-4 py-2 rounded-lg bg-secondary border border-border-color text-text-secondary hover:bg-border-color hover:text-text-primary transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionCards; 