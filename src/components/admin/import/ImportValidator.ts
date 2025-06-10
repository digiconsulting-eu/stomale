
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

// Funzione per creare un username progressivo
const createUniqueUsername = async (): Promise<string> => {
  try {
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

    return `Anonimo${nextNumber}`;
  } catch (error) {
    console.error('Error creating unique username:', error);
    // Fallback con timestamp se c'è un errore
    return `Anonimo${Date.now()}`;
  }
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
  
  // Crea un nuovo utente con username progressivo
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
