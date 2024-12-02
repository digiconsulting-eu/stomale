export interface Review {
  id: string;
  "condition (patologia)": string;
  "title (titolo)"?: string;
  "symptoms (sintomi)"?: string;
  "experience (esperienza)"?: string;
  "diagnosisDifficulty (difficoltà diagnosi)"?: number;
  "symptomsDiscomfort (fastidio sintomi)"?: number;
  "medicationEffectiveness (efficacia farmaci)"?: number;
  "healingPossibility (possibilità guarigione)"?: number;
  "socialDiscomfort (disagio sociale)"?: number;
  "date (data)"?: string;
  "username (nome utente)"?: string;
  "status (stato: approvata/in attesa)"?: string;
}