interface ImportedReview {
  id?: string;
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
  // Map Excel column names to our expected field names
  const fieldMappings = {
    'Patologia': 'condition',
    'Titolo': 'title',
    'Sintomi': 'symptoms',
    'Esperienza': 'experience',
    'Difficoltà di Diagnosi': 'diagnosisDifficulty',
    'Quanto sono fastidiosi i sintomi?': 'symptomsDiscomfort',
    'Efficacia cura farmacologica': 'medicationEffectiveness',
    'Possibilità di guarigione': 'healingPossibility',
    'Disagio sociale': 'socialDiscomfort',
    'Data': 'date',
    'Nome Utente': 'username',
    'Email': 'email'
  };

  // Check if all required fields are present
  for (const [excelField, _] of Object.entries(fieldMappings)) {
    if (row[excelField] === undefined || row[excelField] === null || row[excelField] === '') {
      console.error(`Campo mancante o vuoto: ${excelField}`);
      throw new Error(`Campo mancante o vuoto: ${excelField}`);
    }
  }

  // Validate ratings (must be between 1 and 5)
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
      console.error(`Il campo "${field}" deve essere un numero da 1 a 5. Valore attuale: ${row[field]}`);
      throw new Error(`Il campo "${field}" deve essere un numero da 1 a 5`);
    }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(row['Email'])) {
    console.error(`Email non valida: ${row['Email']}`);
    throw new Error("Formato email non valido");
  }

  // Validate date format (DD-MM-YYYY)
  const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
  if (!dateRegex.test(row['Data'])) {
    console.error(`Data non valida: ${row['Data']}`);
    throw new Error("Il campo 'Data' deve essere nel formato DD-MM-YYYY");
  }

  // Create a unique ID for the review
  const id = `${row['Patologia'].toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  // Return the validated review object
  return {
    id,
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