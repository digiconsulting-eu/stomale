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

const formatDate = (dateInput: any): string => {
  if (!dateInput) {
    return new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).split('/').join('/');
  }

  // If it's already in the correct format DD/MM/YYYY, return as is
  if (typeof dateInput === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(dateInput)) {
    return dateInput;
  }

  try {
    // Handle Excel date number format
    if (typeof dateInput === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }

    // Try to parse the date string
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return new Date().toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }
};

export const validateRow = (row: any): ImportedReview | null => {
  // Check required fields (only Patologia and Esperienza)
  if (!row['Patologia'] || !row['Esperienza']) {
    throw new Error('Campi obbligatori mancanti: Patologia e Esperienza sono richiesti');
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
  if (row['Email'] && typeof row['Email'] === 'string' && row['Email'].trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row['Email'])) {
      throw new Error("Formato email non valido");
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
    date: formatDate(row['Data']),
    username: row['Nome Utente'] || 'Anonimo',
    email: row['Email'] || ''
  };
};