
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

export interface ReviewRow {
  Titolo?: string;
  Sintomi?: string;
  Esperienza?: string;
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

// Funzione per creare un username univoco
const createUniqueUsername = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 100;
  
  while (attempts < maxAttempts) {
    // Genera un numero casuale tra 1000 e 9999
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    const username = `User${randomNum}`;
    
    // Verifica se l'username esiste già
    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();
    
    if (!existingUser) {
      return username;
    }
    
    attempts++;
  }
  
  // Fallback con timestamp se non riusciamo a trovare un username univoco
  return `User${Date.now()}`;
};

// Funzione per creare un nuovo utente
const createUser = async (username: string): Promise<string> => {
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
    throw new Error(`Errore nella creazione dell'utente ${username}: ${error.message}`);
  }
  
  return username;
};

export const validateRow = async (row: any): Promise<any> => {
  console.log('Validating row:', row);
  
  // Estrai i dati dalla riga
  const title = row['Titolo'] || row['Title'] || '';
  const symptoms = row['Sintomi'] || row['Symptoms'] || '';
  const experience = row['Esperienza'] || row['Experience'] || '';
  const conditionId = row['Patologia ID'] || row['Condition ID'] || row['condition_id'];
  
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
  
  if (!conditionId) {
    throw new Error('L\'ID della patologia è obbligatorio');
  }
  
  // Verifica che la patologia esista
  const { data: condition, error: conditionError } = await supabase
    .from('PATOLOGIE')
    .select('id')
    .eq('id', conditionId)
    .single();
  
  if (conditionError || !condition) {
    throw new Error(`Patologia con ID ${conditionId} non trovata`);
  }
  
  // Crea un nuovo utente univoco
  const username = await createUniqueUsername();
  await createUser(username);
  
  // Prepara i dati della recensione con data casuale
  const reviewData = {
    title: title.trim(),
    symptoms: symptoms.trim(),
    experience: experience.trim(),
    condition_id: parseInt(conditionId.toString()),
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
  
  console.log('Validated review data:', reviewData);
  return reviewData;
};
