import { useState } from "react";
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
  switch (letter) {
    case "A":
      return CONDITIONS_A;
    case "B":
      return CONDITIONS_B;
    case "C":
      return CONDITIONS_C;
    case "D":
      return CONDITIONS_D;
    case "E":
      return CONDITIONS_E;
    case "F":
      return CONDITIONS_F;
    case "G":
      return CONDITIONS_G;
    case "H":
      return CONDITIONS_H;
    case "I":
      return CONDITIONS_I;
    case "L":
      return CONDITIONS_L;
    case "M":
      return CONDITIONS_M;
    case "N":
      return CONDITIONS_N;
    case "O":
      return CONDITIONS_O;
    case "P":
      return CONDITIONS_P;
    case "R":
      return CONDITIONS_R;
    case "S":
      return CONDITIONS_S;
    case "T":
      return CONDITIONS_T;
    case "U":
      return CONDITIONS_U;
    case "V":
      return CONDITIONS_V;
    case "Z":
      return CONDITIONS_Z;
    default:
      return [];
  }
};

const SearchCondition = () => {
  const [selectedLetter, setSelectedLetter] = useState("A");

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
            {getConditionsByLetter(selectedLetter).map((condition) => (
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