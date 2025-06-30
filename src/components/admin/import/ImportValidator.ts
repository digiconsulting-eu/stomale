
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface ReviewRow {
  Titolo?: string;
  title?: string;
  Sintomi?: string;
  symptoms?: string;
  Esperienza?: string;
  experience?: string;
  'Patologia'?: string;
  'Patologia ID'?: number | string;
  'Difficoltà Diagnosi'?: number | string;
  diagnosis_difficulty?: number | string;
  'Gravità Sintomi'?: number | string;
  symptoms_severity?: number | string;
  'Ha Farmaco'?: boolean | string;
  has_medication?: boolean | string;
  'Efficacia Farmaco'?: number | string;
  medication_effectiveness?: number | string;
  'Possibilità Guarigione'?: number | string;
  healing_possibility?: number | string;
  'Disagio Sociale'?: number | string;
  social_discomfort?: number | string;
}

// Funzione per pulire e convertire valori numerici
const cleanNumericValue = (value: any): number => {
  if (value === null || value === undefined || value === '' || value === ' ' || value === '-') {
    return Math.floor(Math.random() * 5) + 1; // Valore casuale tra 1 e 5
  }
  
  const numValue = parseInt(value.toString().trim());
  if (isNaN(numValue)) {
    return Math.floor(Math.random() * 5) + 1; // Valore casuale se non è un numero valido
  }
  
  return numValue;
};

// Funzione per pulire valori booleani
const cleanBooleanValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '' || value === ' ' || value === '-') {
    return Math.random() > 0.5; // Valore casuale
  }
  
  const strValue = value.toString().toLowerCase().trim();
  return strValue === 'true' || strValue === 'yes' || strValue === 'si' || strValue === '1';
};

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

// Funzione semplificata che non crea utenti reali ma restituisce solo username
const createUser = async (username: string): Promise<string> => {
  console.log('Skipping user creation, using username only:', username);
  
  // Verifichiamo se l'username già esiste nella tabella users
  const { data: existingUser, error: checkError } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();

  if (checkError && checkError.code !== 'PGRST116') {
    console.error('Error checking existing user:', checkError);
    throw new Error(`Errore nella verifica dell'utente ${username}: ${checkError.message}`);
  }

  if (existingUser) {
    console.log('Username already exists, using it:', username);
    return username;
  }

  // Se non esiste, tentiamo di creare l'utente
  try {
    console.log('Attempting to create user with admin_insert_user function...');
    const userId = uuidv4();
    const createdAt = generateRandomDate();
    
    const { data, error } = await supabase.rpc('admin_insert_user', {
      p_id: userId,
      p_username: username,
      p_email: null,
      p_birth_year: null,
      p_gender: null,
      p_created_at: createdAt,
      p_gdpr_consent: true
    });

    if (error) {
      console.error('Error with admin_insert_user function:', error);
      console.log('User creation failed, but proceeding with username anyway:', username);
      // Non blocchiamo l'importazione se non riusciamo a creare l'utente
      // Procediamo comunque con l'username
      return username;
    }
    
    console.log('User created successfully with admin function:', username, data);
    return username;
  } catch (error) {
    console.error('Error in createUser:', error);
    console.log('User creation failed, but proceeding with username anyway:', username);
    // Non blocchiamo l'importazione, procediamo con l'username
    return username;
  }
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
  
  // Estrai i dati dalla riga - supporta sia nomi italiani che inglesi
  const title = row['Titolo'] || row['Title'] || row['title'] || '';
  const symptoms = row['Sintomi'] || row['Symptoms'] || row['symptoms'] || '';
  const experience = row['Esperienza'] || row['Experience'] || row['experience'] || '';
  
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
  if (!title || title.toString().trim() === '') {
    throw new Error('Il titolo è obbligatorio');
  }
  
  if (!symptoms || symptoms.toString().trim() === '') {
    throw new Error('I sintomi sono obbligatori');
  }
  
  if (!experience || experience.toString().trim() === '') {
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
  
  try {
    await createUser(username);
    console.log('User creation completed for:', username);
  } catch (userError) {
    console.error('User creation failed but continuing with:', username, userError);
    // Non blocchiamo l'importazione se la creazione dell'utente fallisce
    // Procediamo comunque con l'username
  }
  
  // Prepara i dati della recensione con data casuale e valori puliti
  const reviewData = {
    title: title.toString().trim(),
    symptoms: symptoms.toString().trim(),
    experience: experience.toString().trim(),
    condition_id: finalConditionId,
    username: username,
    created_at: generateRandomDate(),
    status: 'approved',
    // Campi opzionali con valori puliti
    diagnosis_difficulty: cleanNumericValue(row['Difficoltà Diagnosi'] || row['Diagnosis Difficulty'] || row['diagnosis_difficulty']),
    symptoms_severity: cleanNumericValue(row['Gravità Sintomi'] || row['Symptoms Severity'] || row['symptoms_severity']),
    has_medication: cleanBooleanValue(row['Ha Farmaco'] || row['has_medication']),
    medication_effectiveness: cleanNumericValue(row['Efficacia Farmaco'] || row['Medication Effectiveness'] || row['medication_effectiveness']),
    healing_possibility: cleanNumericValue(row['Possibilità Guarigione'] || row['Healing Possibility'] || row['healing_possibility']),
    social_discomfort: cleanNumericValue(row['Disagio Sociale'] || row['Social Discomfort'] || row['social_discomfort'])
  };
  
  console.log('Final validated review data:', reviewData);
  return reviewData;
};
