import { supabase } from "@/integrations/supabase/client";

interface ImportedReview {
  condition_id: number;
  title: string;
  symptoms: string;
  experience: string;
  diagnosis_difficulty?: number;
  symptoms_severity?: number;
  has_medication?: boolean;
  medication_effectiveness?: number;
  healing_possibility?: number;
  social_discomfort?: number;
  created_at?: string;
  status?: string;
  user_id?: string;
}

const formatDate = (dateInput: any): string => {
  if (!dateInput) {
    return new Date().toISOString();
  }

  try {
    if (typeof dateInput === 'number') {
      // Convert Excel date number to JavaScript date
      const excelEpoch = new Date(1899, 11, 30);
      const date = new Date(excelEpoch.getTime() + dateInput * 24 * 60 * 60 * 1000);
      return date.toISOString();
    }

    const date = new Date(dateInput);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date.toISOString();
  } catch {
    return new Date().toISOString();
  }
};

const validateNumericField = (value: any, fieldName: string, required: boolean = false): number | null => {
  if (value === undefined || value === null || value === '') {
    if (required) {
      throw new Error(`Il campo "${fieldName}" è obbligatorio e deve essere un numero da 1 a 5`);
    }
    return null;
  }
  
  const numValue = Number(value);
  if (isNaN(numValue) || numValue < 1 || numValue > 5) {
    throw new Error(`Il campo "${fieldName}" deve essere un numero da 1 a 5`);
  }
  return numValue;
};

export const validateRow = async (row: any): Promise<ImportedReview | null> => {
  console.log('Validating row:', row);

  // Check if either patologia or Patologia is present
  const condition = row['patologia'] || row['Patologia'];
  const experience = row['experience'] || row['Esperienza'];
  
  if (!condition || !experience) {
    console.error('Missing required fields:', { condition, experience });
    throw new Error('Campi obbligatori mancanti: Patologia e Esperienza sono richiesti');
  }

  const normalizedCondition = condition
    .toUpperCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  console.log('Normalized condition:', normalizedCondition);

  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const { data: existingConditions, error: searchError } = await supabase
      .from('PATOLOGIE')
      .select('id')
      .eq('Patologia', normalizedCondition);

    if (searchError) {
      console.error('Error searching for condition:', searchError);
      throw searchError;
    }

    console.log('Existing conditions:', existingConditions);

    let patologiaId: number;

    if (!existingConditions || existingConditions.length === 0) {
      console.log('Condition not found, creating new one:', normalizedCondition);
      
      const { data: newCondition, error: insertError } = await supabase
        .from('PATOLOGIE')
        .insert([{ 
          Patologia: normalizedCondition,
          Descrizione: '' 
        }])
        .select()
        .single();

      if (insertError || !newCondition) {
        console.error('Error inserting condition:', insertError);
        throw new Error(`Errore durante l'inserimento della patologia: ${insertError?.message || 'Unknown error'}`);
      }
      
      patologiaId = newCondition.id;
      console.log('Created new condition with ID:', patologiaId);
    } else {
      patologiaId = existingConditions[0].id;
      console.log('Found existing condition with ID:', patologiaId);
    }

    // Handle both Italian and English column names
    const title = row['title'] || row['Titolo'] || '';
    const symptoms = row['symptoms'] || row['Sintomi'] || '';
    const hasMedication = row['has_medication'] || row['Cura Farmacologica']?.toUpperCase() === 'Y';
    
    const validatedRow: ImportedReview = {
      condition_id: patologiaId,
      title: title,
      symptoms: symptoms,
      experience: experience,
      diagnosis_difficulty: validateNumericField(
        row['diagnosis_difficulty'] || row['Difficoltà diagnosi'], 
        'Difficoltà diagnosi'
      ),
      symptoms_severity: validateNumericField(
        row['symptoms_severity'] || row['Fastidio sintomi'], 
        'Fastidio sintomi'
      ),
      has_medication: hasMedication,
      medication_effectiveness: validateNumericField(
        row['medication_effectiveness'] || row['Efficacia farmaci'], 
        'Efficacia farmaci'
      ),
      healing_possibility: validateNumericField(
        row['healing_possibility'] || row['Possibilità guarigione'], 
        'Possibilità guarigione'
      ),
      social_discomfort: validateNumericField(
        row['social_discomfort'] || row['Disagio sociale'], 
        'Disagio sociale'
      ),
      created_at: formatDate(row['created_at'] || row['Data']),
      status: 'approved',
      user_id: user.id
    };

    console.log('Validated row:', validatedRow);
    return validatedRow;
  } catch (error) {
    console.error('Error in validateRow:', error);
    throw error;
  }
};