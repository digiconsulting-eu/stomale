import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CONDITIONS_A, CONDITIONS_B, CONDITIONS_C, CONDITIONS_D,
  CONDITIONS_E, CONDITIONS_F, CONDITIONS_G, CONDITIONS_H,
  CONDITIONS_I, CONDITIONS_L, CONDITIONS_M, CONDITIONS_N,
  CONDITIONS_O, CONDITIONS_P, CONDITIONS_R, CONDITIONS_S,
  CONDITIONS_T, CONDITIONS_U, CONDITIONS_V, CONDITIONS_Z
} from "@/components/conditions/ConditionsList";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const getConditionsByLetter = (letter: string) => {
  // Get approved conditions from localStorage
  const approvedConditions = JSON.parse(localStorage.getItem('approvedConditions') || '[]');
  
  // Get base conditions from the static list
  let baseConditions: string[] = [];
  switch (letter) {
    case "A":
      baseConditions = CONDITIONS_A;
      break;
    case "B":
      baseConditions = CONDITIONS_B;
      break;
    case "C":
      baseConditions = CONDITIONS_C;
      break;
    case "D":
      baseConditions = CONDITIONS_D;
      break;
    case "E":
      baseConditions = CONDITIONS_E;
      break;
    case "F":
      baseConditions = CONDITIONS_F;
      break;
    case "G":
      baseConditions = CONDITIONS_G;
      break;
    case "H":
      baseConditions = CONDITIONS_H;
      break;
    case "I":
      baseConditions = CONDITIONS_I;
      break;
    case "L":
      baseConditions = CONDITIONS_L;
      break;
    case "M":
      baseConditions = CONDITIONS_M;
      break;
    case "N":
      baseConditions = CONDITIONS_N;
      break;
    case "O":
      baseConditions = CONDITIONS_O;
      break;
    case "P":
      baseConditions = CONDITIONS_P;
      break;
    case "R":
      baseConditions = CONDITIONS_R;
      break;
    case "S":
      baseConditions = CONDITIONS_S;
      break;
    case "T":
      baseConditions = CONDITIONS_T;
      break;
    case "U":
      baseConditions = CONDITIONS_U;
      break;
    case "V":
      baseConditions = CONDITIONS_V;
      break;
    case "Z":
      baseConditions = CONDITIONS_Z;
      break;
    default:
      baseConditions = [];
  }

  // Filter approved conditions that start with the current letter
  const approvedForLetter = approvedConditions.filter((condition: string) => 
    condition.startsWith(letter)
  );

  // Combine and sort all conditions
  return [...baseConditions, ...approvedForLetter].sort();
};

const SearchCondition = () => {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [conditions, setConditions] = useState<string[]>([]);

  // Update conditions when selected letter changes or when localStorage changes
  useEffect(() => {
    const updateConditions = () => {
      setConditions(getConditionsByLetter(selectedLetter));
    };

    updateConditions();

    // Listen for storage events to update the list when conditions are approved
    window.addEventListener('storage', updateConditions);
    return () => window.removeEventListener('storage', updateConditions);
  }, [selectedLetter]);

  const handleLetterChange = (letter: string) => {
    setSelectedLetter(letter);
    window.scrollTo(0, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Alphabet Navigation */}
      <nav className="mb-8 sticky top-20 bg-white/80 backdrop-blur-sm z-40 py-4 border-b">
        <div className="flex flex-wrap gap-2 justify-center">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => handleLetterChange(letter)}
              className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-semibold transition-all
                ${
                  selectedLetter === letter
                    ? "bg-primary text-white shadow-lg scale-110"
                    : "bg-secondary hover:bg-secondary-hover text-text"
                }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </nav>

      {/* Conditions List */}
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-text mb-6 flex items-center gap-2">
            <span className="text-primary">{selectedLetter}</span>
            <span className="text-text-light">/</span>
            <span className="text-text-light font-normal text-xl">Patologie</span>
          </h2>

          <div className="grid gap-3">
            {conditions.map((condition) => (
              <Link
                key={condition}
                to={`/patologia/${encodeURIComponent(condition.toLowerCase())}`}
                className="card group hover:border-primary/20 transition-all"
              >
                <h3 className="text-lg font-medium text-text group-hover:text-primary transition-colors">
                  {condition}
                </h3>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-primary hover:text-primary-hover transition-colors"
          >
            Torna all'indice alfabetico ↑
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchCondition;