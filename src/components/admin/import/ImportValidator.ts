import { supabase } from "@/integrations/supabase/client";

interface ImportedReview {
  condition: number;
  title?: string;
  symptoms?: string;
  experience: string;
  diagnosisDifficulty?: number;
  symptomsDiscomfort?: number;
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

const validateNumericField = (value: any, fieldName: string): number | undefined => {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }
  
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < 1 || numValue > 5) {
    throw new Error(`Il campo "${fieldName}" deve essere un numero da 1 a 5`);
  }
  return numValue;
};

export const validateRow = async (row: any): Promise<ImportedReview | null> => {
  if (!row['Patologia'] || !row['Esperienza']) {
    throw new Error('Campi obbligatori mancanti: Patologia e Esperienza sono richiesti');
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

    const diagnosisDifficulty = validateNumericField(row['Difficoltà diagnosi'], 'Difficoltà diagnosi');
    const symptomsDiscomfort = validateNumericField(row['Fastidio sintomi'], 'Fastidio sintomi');
    const medicationEffectiveness = validateNumericField(row['Efficacia farmaci'], 'Efficacia farmaci');
    const healingPossibility = validateNumericField(row['Possibilità guarigione'], 'Possibilità guarigione');
    const socialDiscomfort = validateNumericField(row['Disagio sociale'], 'Disagio sociale');

    console.log('Valori numerici letti dal file Excel:', {
      'Difficoltà diagnosi': row['Difficoltà diagnosi'],
      'Fastidio sintomi': row['Fastidio sintomi'],
      'Efficacia farmaci': row['Efficacia farmaci'],
      'Possibilità guarigione': row['Possibilità guarigione'],
      'Disagio sociale': row['Disagio sociale']
    });

    console.log('Valori numerici dopo la validazione:', {
      diagnosisDifficulty,
      symptomsDiscomfort,
      medicationEffectiveness,
      healingPossibility,
      socialDiscomfort
    });

    return {
      condition: patologiaId,
      title: row['Titolo'] || '',
      symptoms: row['Sintomi'] || '',
      experience: row['Esperienza'],
      diagnosisDifficulty,
      symptomsDiscomfort,
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
