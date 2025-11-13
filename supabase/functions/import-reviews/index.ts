import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.2';
import { v4 as uuidv4 } from 'https://esm.sh/uuid@11.1.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ReviewRow {
  Patologia?: string;
  title?: string;
  symptoms?: string;
  experience?: string;
  diagnosis_difficulty?: number | string;
  symptoms_severity?: number | string;
  has_medication?: boolean | string;
  medication_effectiveness?: number | string;
  healing_possibility?: number | string;
  social_discomfort?: number | string;
}

const cleanNumericValue = (value: any): number => {
  if (value === null || value === undefined || value === '' || value === ' ' || value === '-') {
    return Math.floor(Math.random() * 5) + 1;
  }
  const numValue = parseInt(value.toString().trim());
  if (isNaN(numValue)) {
    return Math.floor(Math.random() * 5) + 1;
  }
  return numValue;
};

const cleanBooleanValue = (value: any): boolean => {
  if (value === null || value === undefined || value === '' || value === ' ' || value === '-') {
    return Math.random() > 0.5;
  }
  const strValue = value.toString().toLowerCase().trim();
  return strValue === 'true' || strValue === 'yes' || strValue === 'si' || strValue === '1';
};

const generateRandomDate = (): string => {
  const start = new Date('2023-01-01').getTime();
  const end = new Date('2025-11-10').getTime();
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime).toISOString();
};

const createUniqueUsername = async (supabase: any): Promise<string> => {
  try {
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('username')
      .like('username', 'Anonimo%')
      .order('username', { ascending: false });

    if (error) throw error;

    let nextNumber = 1;
    if (existingUsers && existingUsers.length > 0) {
      const numbers = existingUsers
        .map((user: any) => {
          const match = user.username.match(/^Anonimo(\d+)$/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((num: number) => num > 0)
        .sort((a: number, b: number) => b - a);

      if (numbers.length > 0) {
        nextNumber = numbers[0] + 1;
      }
    }

    return `Anonimo${nextNumber}`;
  } catch (error) {
    console.error('Error creating unique username:', error);
    return `Anonimo${Date.now()}`;
  }
};

const createUser = async (supabase: any, username: string): Promise<void> => {
  const { data: existingUser } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();

  if (existingUser) return;

  try {
    const userId = uuidv4();
    const createdAt = generateRandomDate();
    
    const { error } = await supabase.rpc('admin_insert_user', {
      p_id: userId,
      p_username: username,
      p_email: null,
      p_birth_year: null,
      p_gender: null,
      p_created_at: createdAt,
      p_gdpr_consent: true
    });

    if (error) {
      console.error('Error creating user:', error);
    }
  } catch (error) {
    console.error('Error in createUser:', error);
  }
};

const findOrCreateCondition = async (supabase: any, conditionName: string): Promise<number> => {
  const { data: existingCondition, error: searchError } = await supabase
    .from('PATOLOGIE')
    .select('id, Patologia')
    .ilike('Patologia', conditionName.trim())
    .single();
  
  if (searchError && searchError.code !== 'PGRST116') {
    throw new Error(`Errore nella ricerca della patologia: ${searchError.message}`);
  }
  
  if (existingCondition) {
    return existingCondition.id;
  }
  
  const { data: newCondition, error: createError } = await supabase
    .from('PATOLOGIE')
    .insert({
      Patologia: conditionName.trim(),
      Descrizione: ''
    })
    .select('id')
    .single();
  
  if (createError) {
    throw new Error(`Errore nella creazione della patologia: ${createError.message}`);
  }
  
  return newCondition.id;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { reviews } = await req.json();
    
    if (!reviews || !Array.isArray(reviews)) {
      throw new Error('Invalid request: reviews array is required');
    }

    console.log(`Starting import of ${reviews.length} reviews`);

    const validReviews = [];
    const errors = [];
    const timestamp = new Date().toISOString();

    for (const [index, row] of reviews.entries()) {
      try {
        const title = row['title'] || '';
        const symptoms = row['symptoms'] || '';
        const experience = row['experience'] || '';
        const conditionName = row['Patologia'];

        if (!title || !symptoms || !experience || !conditionName) {
          errors.push(`Riga ${index + 2}: Campi obbligatori mancanti`);
          continue;
        }

        const conditionId = await findOrCreateCondition(supabase, conditionName);
        const username = await createUniqueUsername(supabase);
        await createUser(supabase, username);

        const reviewData = {
          title: title.toString().trim(),
          symptoms: symptoms.toString().trim(),
          experience: experience.toString().trim(),
          condition_id: conditionId,
          username: username,
          created_at: generateRandomDate(),
          status: 'approved',
          diagnosis_difficulty: cleanNumericValue(row['diagnosis_difficulty']),
          symptoms_severity: cleanNumericValue(row['symptoms_severity']),
          has_medication: cleanBooleanValue(row['has_medication']),
          medication_effectiveness: cleanNumericValue(row['medication_effectiveness']),
          healing_possibility: cleanNumericValue(row['healing_possibility']),
          social_discomfort: cleanNumericValue(row['social_discomfort']),
          import_timestamp: timestamp
        };

        const { error: insertError } = await supabase
          .from('reviews')
          .insert(reviewData);

        if (insertError) {
          console.error('Insert error:', insertError);
          errors.push(`Riga ${index + 2}: ${insertError.message}`);
        } else {
          validReviews.push(reviewData);
          console.log(`Imported review ${index + 1}/${reviews.length}`);
        }
      } catch (error) {
        console.error(`Error processing row ${index + 1}:`, error);
        errors.push(`Riga ${index + 2}: ${(error as Error).message}`);
      }
    }

    console.log(`Import completed: ${validReviews.length} success, ${errors.length} errors`);

    return new Response(
      JSON.stringify({
        success: true,
        imported: validReviews.length,
        errors: errors.length,
        errorDetails: errors
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Import function error:', error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
