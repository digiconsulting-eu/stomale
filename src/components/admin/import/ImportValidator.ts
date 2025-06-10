
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface ReviewRow {
  Titolo?: string;
  Sintomi?: string;
  Esperienza?: string;
  'Patologia'?: string;
  'Patologia ID'?: number | string;
  'Difficoltà Diagnosi'?: number | string;
  'Gravità Sintomi'?: number | string;
  'Ha Farmaco'?: boolean | string;
  'Efficacia Farmaco'?: number | string;
  'Possibilità Guarigione'?: number | string;
  'Disagio Sociale'?: number | string;
}

// Funzione per generare una data casuale tra 1/1/2020 e 10/6/2025
const generateRandomDate = (): string => {
  const start = new Date('2020-01-01').getTime();
  const end = new Date('2025-06-10').getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
};

// Funzione per creare un username progressivo
const createUniqueUsername = async (): Promise<string> => {
  try {
    console.log('Creating unique username...');
    // Trova il numero più alto esistente
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('username')
      .like('username', 'Anonimo%')
      .order('username', { ascending: false });

    if (error) {
      console.error('Error fetching existing users:', error);
      throw error;
    }

    console.log('Existing users with Anonimo prefix:', existingUsers);

    let nextNumber = 1;
    
    if (existingUsers && existingUsers.length > 0) {
      // Estrae tutti i numeri dagli username esistenti
      const numbers = existingUsers
        .map(user => {
          const match = user.username.match(/^Anonimo(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter(num => num > 0)
        .sort((a, b) => b - a); // Ordina in modo decrescente

      // Prende il numero più alto e aggiunge 1
      if (numbers.length > 0) {
        nextNumber = numbers[0] + 1;
      }
    }

    const username = `Anonimo${nextNumber}`;
    console.log('Generated username:', username);
    return username;
  } catch (error) {
    console.error('Error creating unique username:', error);
    // Fallback con timestamp se c'è un errore
    const fallbackUsername = `Anonimo${Date.now()}`;
    console.log('Using fallback username:', fallbackUsername);
    return fallbackUsername;
  }
};

// Funzione per creare un nuovo utente
const createUser = async (username: string): Promise<string> => {
  console.log('Creating user:', username);
  const userId = uuidv4();
  const createdAt = generateRandomDate();
  
  const { error } = await supabase
    .from('users')
    .insert({
      id: userId,
      username: username,
      created_at: createdAt,
      gdpr_consent: true
    });
  
  if (error) {
    console.error('Error creating user:', error);
    throw new Error(`Errore nella creazione dell'utente ${username}: ${error.message}`);
  }
  
  console.log('User created successfully:', username);
  return username;
};

// Funzione per trovare o creare una patologia per nome
const findOrCreateCondition = async (conditionName: string): Promise<number> => {
  console.log('=== FINDING OR CREATING CONDITION ===');
  console.log('Looking for condition:', conditionName);
  
  // Prima cerca la patologia esistente (case-insensitive)
  const { data: existingCondition, error: searchError } = await supabase
    .from('PATOLOGIE')
    .select('id, Patologia')
    .ilike('Patologia', conditionName.trim())
    .single();
  
  console.log('Search result:', existingCondition);
  console.log('Search error:', searchError);
  
  if (searchError && searchError.code !== 'PGRST116') {
    console.error('Error searching for condition:', searchError);
    throw new Error(`Errore nella ricerca della patologia: ${searchError.message}`);
  }
  
  if (existingCondition) {
    console.log(`Found existing condition: ${existingCondition.Patologia} with ID ${existingCondition.id}`);
    return existingCondition.id;
  }
  
  // Se non esiste, la crea
  console.log(`Creating new condition: ${conditionName}`);
  const { data: newCondition, error: createError } = await supabase
    .from('PATOLOGIE')
    .insert({
      Patologia: conditionName.trim(),
      Descrizione: ''
    })
    .select('id')
    .single();
  
  console.log('Create result:', newCondition);
  console.log('Create error:', createError);
  
  if (createError) {
    console.error('Error creating condition:', createError);
    throw new Error(`Errore nella creazione della patologia: ${createError.message}`);
  }
  
  console.log(`Created new condition with ID: ${newCondition.id}`);
  return newCondition.id;
};

export const validateRow = async (row: any): Promise<any> => {
  console.log('=== VALIDATING ROW ===');
  console.log('Raw row data:', row);
  
  // Estrai i dati dalla riga
  const title = row['Titolo'] || row['Title'] || '';
  const symptoms = row['Sintomi'] || row['Symptoms'] || '';
  const experience = row['Esperienza'] || row['Experience'] || '';
  
  // Cerca prima per nome della patologia, poi per ID
  const conditionName = row['Patologia'] || row['Condition'] || row['condition'];
  const conditionId = row['Patologia ID'] || row['Condition ID'] || row['condition_id'];
  
  console.log('Extracted data:');
  console.log('- Title:', title);
  console.log('- Symptoms:', symptoms);
  console.log('- Experience:', experience);
  console.log('- Condition Name:', conditionName);
  console.log('- Condition ID:', conditionId);
  
  // Valida i campi obbligatori
  if (!title || title.trim() === '') {
    throw new Error('Il titolo è obbligatorio');
  }
  
  if (!symptoms || symptoms.trim() === '') {
    throw new Error('I sintomi sono obbligatori');
  }
  
  if (!experience || experience.trim() === '') {
    throw new Error('L\'esperienza è obbligatoria');
  }
  
  if (!conditionName && !conditionId) {
    throw new Error('È necessario specificare il nome della patologia o l\'ID della patologia');
  }
  
  let finalConditionId: number;
  
  // Se è specificato il nome della patologia, lo usa (ha priorità sull'ID)
  if (conditionName) {
    console.log('Using condition name to find/create condition');
    finalConditionId = await findOrCreateCondition(conditionName);
  } else {
    console.log('Using condition ID, verifying it exists');
    // Altrimenti usa l'ID specificato e verifica che esista
    const { data: condition, error: conditionError } = await supabase
      .from('PATOLOGIE')
      .select('id')
      .eq('id', conditionId)
      .single();
    
    console.log('Condition verification result:', condition);
    console.log('Condition verification error:', conditionError);
    
    if (conditionError || !condition) {
      throw new Error(`Patologia con ID ${conditionId} non trovata`);
    }
    
    finalConditionId = parseInt(conditionId.toString());
  }
  
  console.log('Final condition ID:', finalConditionId);
  
  // Crea un nuovo utente con username progressivo
  const username = await createUniqueUsername();
  await createUser(username);
  
  // Prepara i dati della recensione con data casuale
  const reviewData = {
    title: title.trim(),
    symptoms: symptoms.trim(),
    experience: experience.trim(),
    condition_id: finalConditionId,
    username: username,
    created_at: generateRandomDate(),
    status: 'approved',
    // Campi opzionali con valori di default se non specificati
    diagnosis_difficulty: row['Difficoltà Diagnosi'] || row['Diagnosis Difficulty'] || Math.floor(Math.random() * 5) + 1,
    symptoms_severity: row['Gravità Sintomi'] || row['Symptoms Severity'] || Math.floor(Math.random() * 5) + 1,
    has_medication: row['Ha Farmaco'] !== undefined ? Boolean(row['Ha Farmaco']) : Math.random() > 0.5,
    medication_effectiveness: row['Efficacia Farmaco'] || row['Medication Effectiveness'] || Math.floor(Math.random() * 5) + 1,
    healing_possibility: row['Possibilità Guarigione'] || row['Healing Possibility'] || Math.floor(Math.random() * 5) + 1,
    social_discomfort: row['Disagio Sociale'] || row['Social Discomfort'] || Math.floor(Math.random() * 5) + 1
  };
  
  console.log('Final validated review data:', reviewData);
  return reviewData;
};
