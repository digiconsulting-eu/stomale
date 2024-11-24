import { useState } from "react";
import { Link } from "react-router-dom";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const CONDITIONS_A = [
  "ACALASIA", "ACETONEMIA", "ACIDOSI METABOLICA", "ACNE", "ACONDROPLASIA",
  "ACROMEGALIA", "ADENOIDI IPERTROFICHE", "ADENOIDITE", "AIDS", "ALBINISMO",
  "ALCOLISMO", "ALGODISTROFIA", "ALLERGIA ALIMENTARE", "ALLERGIA AL NICHEL e SNAS",
  "ALLERGIA AL LATTOSIO", "ALLERGIA DA CONTATTO", "ALLERGIE RESPIRATORIE",
  "ALLUCE VALGO", "ALOPECIA AREATA", "AMBLIOPIA", "AMEBIASI", "AMILOIDOSI",
  "ANAFILASSI", "ANEMIA", "ANEMIA DI FANCONI", "ANEMIA EMOLITICA",
  "ANEURISMA AORTICO", "ANEURISMA CEREBRALE", "ANGINA ADDOMINALE",
  "ANGINA INSTABILE", "ANGINA PECTORIS", "ANGIODISPLASIA", "ANGIOMA",
  "ANISAKIASI", "ANORESSIA", "ANSIA", "ANTRACE", "APNEA NOTTURNA",
  "APPENDICITE", "ARRESTO CARDIACO", "ARTERITE A CELLULE GIGANTI", "ARTRITE",
  "ARTRITE GOTTOSA", "ARTRITE IDIOPATICA GIOVANILE", "ARTRITE PSORIASICA",
  "ARTRITE REATTIVA", "ARTRITE REUMATOIDE", "ARTROSI", "ARTROSI DELLE MANI",
  "ARTROSI CERVICALE", "ASBESTOSI", "ASCESSO GENGIVALE", "ASCESSO PERIANALE",
  "ASCESSO POLMONARE", "ASMA", "ASPERGILLOSI", "ASTIGMATISMO", "ATEROSCLEROSI",
  "ATRESIA ESOFAGEA", "ATROFIA MUSCOLARE SPINALE", "ATTACCO DI ANSIA",
  "ATTACCO DI PANICO", "ATTACCO ISCHEMICO TRANSITORIO", "AUTISMO"
];

const SearchCondition = () => {
  const [selectedLetter, setSelectedLetter] = useState("A");

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Alphabet Navigation */}
      <nav className="mb-8 sticky top-20 bg-white/80 backdrop-blur-sm z-40 py-4 border-b">
        <div className="flex flex-wrap gap-2 justify-center">
          {ALPHABET.map((letter) => (
            <button
              key={letter}
              onClick={() => setSelectedLetter(letter)}
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
            {(selectedLetter === "A" ? CONDITIONS_A : []).map((condition) => (
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