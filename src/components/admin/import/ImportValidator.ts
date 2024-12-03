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

  const normalizedCondition = row['Patologia']
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  try {
    const { data: existingConditions, error: searchError } = await supabase
      .from('PATOLOGIE')
      .select('id')
      .eq('Patologia', normalizedCondition);

    if (searchError) {
      console.error('Errore durante la ricerca della patologia:', searchError);
      throw searchError;
    }

    let patologiaId: number;

    if (!existingConditions || existingConditions.length === 0) {
      const { data: newCondition, error: insertError } = await supabase
        .from('PATOLOGIE')
        .insert([{ 
          Patologia: normalizedCondition,
          Descrizione: '' 
        }])
        .select()
        .single();

      if (insertError || !newCondition) {
        console.error('Errore durante inserimento patologia:', insertError);
        throw new Error(`Errore durante l'inserimento della patologia: ${insertError?.message || 'Unknown error'}`);
      }
      
      patologiaId = newCondition.id;
    } else {
      patologiaId = existingConditions[0].id;
    }

    const hasDrugTreatment = row['Cura Farmacologica']?.toString().toUpperCase();
    if (hasDrugTreatment && !['Y', 'N'].includes(hasDrugTreatment)) {
      throw new Error('Il campo "Cura Farmacologica" deve essere Y o N');
    }

    // Convert numeric fields ensuring they are numbers or undefined
    const diagnosisDifficulty = row['Difficoltà di Diagnosi'] ? Number(row['Difficoltà di Diagnosi']) : undefined;
    const symptomsDiscomfort = row['Quanto sono fastidiosi i sintomi'] ? Number(row['Quanto sono fastidiosi i sintomi']) : undefined;
    const medicationEffectiveness = row['Efficacia cura farmacologica'] ? Number(row['Efficacia cura farmacologica']) : 0;
    const healingPossibility = row['Possibilità di guarigione'] ? Number(row['Possibilità di guarigione']) : undefined;
    const socialDiscomfort = row['Disagio sociale'] ? Number(row['Disagio sociale']) : undefined;

    return {
      condition: patologiaId,
      title: row['Titolo'] || '',
      symptoms: row['Sintomi'] || '',
      experience: row['Esperienza'],
      diagnosisDifficulty,
      symptomsDiscomfort,
      hasDrugTreatment: hasDrugTreatment,
      medicationEffectiveness,
      healingPossibility,
      socialDiscomfort,
      date: formatDate(row['Data']),
    };
  } catch (error) {
    console.error('Error in validateRow:', error);
    throw error;
  }
};