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

  // Get or create Patologia
  const { data: existingPatologia, error: searchError } = await supabase
    .from('PATOLOGIE')
    .select('id')
    .eq('Patologia', row['Patologia'].toUpperCase())
    .maybeSingle();

  let patologiaId: number;

  if (!existingPatologia) {
    // Create new patologia
    const { data: newPatologia, error: insertError } = await supabase
      .from('PATOLOGIE')
      .insert({ Patologia: row['Patologia'].toUpperCase() })
      .select('id')
      .single();

    if (insertError) {
      throw new Error(`Errore durante l'inserimento della patologia: ${insertError.message}`);
    }
    patologiaId = newPatologia.id;
  } else {
    patologiaId = existingPatologia.id;
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
    medicationEffectiveness: row['Efficacia cura farmacologica'] ? Number(row['Efficacia cura farmacologica']) : undefined,
    healingPossibility: row['Possibilità di guarigione'] ? Number(row['Possibilità di guarigione']) : undefined,
    socialDiscomfort: row['Disagio sociale'] ? Number(row['Disagio sociale']) : undefined,
    date: formatDate(row['Data']),
  };
};