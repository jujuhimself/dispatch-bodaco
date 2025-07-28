const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase URL or Anon Key in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmergencyTypes() {
  try {
    // Check emergency_categories
    const { data: categories, error: categoriesError } = await supabase
      .from('emergency_categories')
      .select('*');

    if (categoriesError) throw categoriesError;
    
    console.log('Emergency Categories:');
    console.table(categories);

    // Check emergency_types
    const { data: types, error: typesError } = await supabase
      .from('emergency_types')
      .select('*')
      .limit(5);

    if (typesError) throw typesError;
    
    console.log('\nSample Emergency Types (first 5):');
    console.table(types);

    // Check if the view was created
    const { data: viewData, error: viewError } = await supabase
      .from('emergency_details')
      .select('*')
      .limit(1);

    if (viewError) throw viewError;
    
    console.log('\nEmergency Details View Schema:');
    console.log(Object.keys(viewData[0] || {}));

  } catch (error) {
    console.error('Error checking emergency types:', error);
    process.exit(1);
  }
}

checkEmergencyTypes();
