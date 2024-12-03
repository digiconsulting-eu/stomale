import { supabase } from "@/integrations/supabase/client";

interface ImportedReview {
  condition: number;
  title?: string;
  symptoms?: string;
  experience: string;
  diagnosisDifficulty?: number;
  symptomsDiscomfort?: number;
  hasDrugTreatment?: string;
  medicationEffectiveness?: number;
  healingPossibility?: number;
  socialDiscomfort?: number;
  date?: string;
}

const formatDate = (dateInput: any): string => {
  if (!dateInput) {
    return new Date().toLocaleDateString('it-IT').split('/').join('-');
  }

  if (typeof dateInput === 'string' && /^\d{2}-\d{2}-\d{4}$/.test(dateInput)) {
    return dateInput;
  }

  try {
    if (typeof dateInput === 'number') {
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
      return date.toLocaleDateString('it-IT').split('/').join('-');
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toLocaleDateString('it-IT').split('/').join('-');
  } catch {
    return new Date().toLocaleDateString('it-IT').split('/').join('-');
  }
};

export const validateRow = async (row: any): Promise<ImportedReview | null> => {
  if (!row['Patologia'] || !row['Esperienza']) {
    throw new Error('Campi obbligatori mancanti: Patologia e Esperienza sono richiesti');
  }

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

  // Normalize the condition name and handle special characters
  const normalizedCondition = row['Patologia']
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // Remove accents

  console.log('Cercando patologia:', normalizedCondition);

  try {
    // First try to find the existing condition
    const { data: conditions, error: searchError } = await supabase
      .from('PATOLOGIE')
      .select('id')
      .eq('Patologia', normalizedCondition);

    if (searchError) {
      console.error('Errore durante la ricerca della patologia:', searchError);
      throw searchError;
    }

    let patologiaId: number;

    if (!conditions || conditions.length === 0) {
      console.log('Patologia non trovata, creazione nuova:', normalizedCondition);
      
      const { data: newPatologie, error: insertError } = await supabase
        .from('PATOLOGIE')
        .insert([{ 
          Patologia: normalizedCondition,
          Descrizione: '' 
        }])
        .select();

      if (insertError || !newPatologie || newPatologie.length === 0) {
        console.error('Errore durante inserimento patologia:', insertError);
        throw new Error(`Errore durante l'inserimento della patologia: ${insertError?.message || 'Unknown error'}`);
      }
      
      patologiaId = newPatologie[0].id;
      console.log('Nuova patologia creata con ID:', patologiaId);
    } else {
      patologiaId = conditions[0].id;
      console.log('Patologia esistente trovata con ID:', patologiaId);
    }

    const hasDrugTreatment = row['Cura Farmacologica']?.toString().toUpperCase();
    if (hasDrugTreatment && !['Y', 'N'].includes(hasDrugTreatment)) {
      throw new Error('Il campo "Cura Farmacologica" deve essere Y o N');
    }

    return {
      condition: patologiaId,
      title: row['Titolo'] || '',
      symptoms: row['Sintomi'] || '',
      experience: row['Esperienza'],
      diagnosisDifficulty: row['Difficoltà di Diagnosi'] ? Number(row['Difficoltà di Diagnosi']) : undefined,
      symptomsDiscomfort: row['Quanto sono fastidiosi i sintomi'] ? Number(row['Quanto sono fastidiosi i sintomi']) : undefined,
      hasDrugTreatment: hasDrugTreatment,
      medicationEffectiveness: row['Efficacia cura farmacologica'] ? Number(row['Efficacia cura farmacologica']) : 0,
      healingPossibility: row['Possibilità di guarigione'] ? Number(row['Possibilità di guarigione']) : undefined,
      socialDiscomfort: row['Disagio sociale'] ? Number(row['Disagio sociale']) : undefined,
      date: formatDate(row['Data']),
    };
  } catch (error) {
    console.error('Error in validateRow:', error);
    throw error;
  }
};