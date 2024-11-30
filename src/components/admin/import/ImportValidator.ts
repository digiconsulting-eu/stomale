interface ImportedReview {
  condition: string;
  title: string;
  symptoms: string;
  experience: string;
  diagnosisDifficulty: number;
  symptomsDiscomfort: number;
  medicationEffectiveness: number;
  healingPossibility: number;
  socialDiscomfort: number;
  date: string;
  username: string;
  email: string;
}

export const validateRow = (row: any): ImportedReview | null => {
  const requiredFields = [
    'Patologia', 'Titolo', 'Sintomi', 'Esperienza',
    'Difficoltà di Diagnosi', 'Quanto sono fastidiosi i sintomi?',
    'Efficacia cura farmacologica', 'Possibilità di guarigione',
    'Disagio sociale', 'Data', 'Nome Utente', 'Email'
  ];

  for (const field of requiredFields) {
    if (!row[field]) {
      throw new Error(`Campo mancante: ${field}`);
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row['Email'])) {
    throw new Error("Formato email non valido");
  }

  // Validate ratings
  const ratingFields = [
    'Difficoltà di Diagnosi',
    'Quanto sono fastidiosi i sintomi?',
    'Efficacia cura farmacologica',
    'Possibilità di guarigione',
    'Disagio sociale'
  ];

  for (const field of ratingFields) {
    const rating = Number(row[field]);
    if (isNaN(rating) || rating < 1 || rating > 5) {
      throw new Error(`Il campo "${field}" deve essere un numero da 1 a 5`);
    }
  }

  // Validate date format (DD-MM-YYYY)
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  if (!dateRegex.test(row['Data'])) {
    throw new Error("Il campo 'Data' deve essere nel formato DD-MM-YYYY");
  }

  return {
    condition: row['Patologia'],
    title: row['Titolo'],
    symptoms: row['Sintomi'],
    experience: row['Esperienza'],
    diagnosisDifficulty: Number(row['Difficoltà di Diagnosi']),
    symptomsDiscomfort: Number(row['Quanto sono fastidiosi i sintomi?']),
    medicationEffectiveness: Number(row['Efficacia cura farmacologica']),
    healingPossibility: Number(row['Possibilità di guarigione']),
    socialDiscomfort: Number(row['Disagio sociale']),
    date: row['Data'],
    username: row['Nome Utente'],
    email: row['Email']
  };
};