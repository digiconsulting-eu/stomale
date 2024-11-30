interface ImportedReview {
  id?: string;
  condition: string;
  title?: string;
  symptoms?: string;
  experience: string;
  diagnosisDifficulty?: number;
  symptomsDiscomfort?: number;
  medicationEffectiveness?: number;
  healingPossibility?: number;
  socialDiscomfort?: number;
  date?: string;
  username?: string;
  email?: string;
}

export const validateRow = (row: any): ImportedReview | null => {
  // Map Excel column names to our expected field names
  const fieldMappings = {
    'Patologia': 'condition',
    'Titolo': 'title',
    'Sintomi': 'symptoms',
    'Esperienza': 'experience',
    'Difficoltà di Diagnosi': 'diagnosisDifficulty',
    'Quanto sono fastidiosi i sintomi': 'symptomsDiscomfort',
    'Efficacia cura farmacologica': 'medicationEffectiveness',
    'Possibilità di guarigione': 'healingPossibility',
    'Disagio sociale': 'socialDiscomfort',
    'Data': 'date',
    'Nome Utente': 'username',
    'Email': 'email'
  };

  // Check required fields (only Patologia and Esperienza)
  const requiredFields = ['Patologia', 'Esperienza'];
  for (const field of requiredFields) {
    if (row[field] === undefined || row[field] === null || row[field] === '') {
      throw new Error(`Campo obbligatorio mancante: ${field}`);
    }
  }

  // Validate ratings if present (must be between 1 and 5)
  const ratingFields = [
    'Difficoltà di Diagnosi',
    'Quanto sono fastidiosi i sintomi',
    'Efficacia cura farmacologica',
    'Possibilità di guarigione',
    'Disagio sociale'
  ];

  for (const field of ratingFields) {
    if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
      const rating = Number(row[field]);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        throw new Error(`Il campo "${field}" deve essere un numero da 1 a 5`);
      }
    }
  }

  // Validate email format if present
  if (row['Email'] !== undefined && row['Email'] !== null && row['Email'] !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row['Email'])) {
      throw new Error("Formato email non valido");
    }
  }

  // Validate date format if present (DD-MM-YYYY)
  if (row['Data'] !== undefined && row['Data'] !== null && row['Data'] !== '') {
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
    if (!dateRegex.test(row['Data'])) {
      throw new Error("Il campo 'Data' deve essere nel formato DD-MM-YYYY");
    }
  }

  // Create a unique ID for the review
  const id = `${row['Patologia'].toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

  // Return the validated review object with optional fields
  return {
    id,
    condition: row['Patologia'],
    title: row['Titolo'] || '',
    symptoms: row['Sintomi'] || '',
    experience: row['Esperienza'],
    diagnosisDifficulty: row['Difficoltà di Diagnosi'] ? Number(row['Difficoltà di Diagnosi']) : undefined,
    symptomsDiscomfort: row['Quanto sono fastidiosi i sintomi'] ? Number(row['Quanto sono fastidiosi i sintomi']) : undefined,
    medicationEffectiveness: row['Efficacia cura farmacologica'] ? Number(row['Efficacia cura farmacologica']) : undefined,
    healingPossibility: row['Possibilità di guarigione'] ? Number(row['Possibilità di guarigione']) : undefined,
    socialDiscomfort: row['Disagio sociale'] ? Number(row['Disagio sociale']) : undefined,
    date: row['Data'] || new Date().toLocaleDateString('it-IT').split('/').join('-'),
    username: row['Nome Utente'] || 'Anonimo',
    email: row['Email'] || ''
  };
};