// Database seed script for Casa Limpa CRM
// Run with: node scripts/seed.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ensureAdminUser() {
  console.log('🔐 Ensuring admin user...');
  const email = 'admin@local.test';
  const password = 'admin';
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role: 'admin' },
  });
  if (error) {
    if ((error.message || '').toLowerCase().includes('already')) {
      console.log('ℹ️ Admin user already exists.');
    } else {
      console.error('Error creating admin user:', error.message);
    }
  } else {
    console.log('✅ Admin user ready:', email);
  }
}

// Sample data for seeding
const customers = [
  {
    name: 'Maria Silva',
    email: 'maria.silva@email.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - Jardim das Acácias, São Paulo - SP',
    notes: 'Cliente VIP, prefere atendimento pela manhã'
  },
  {
    name: 'João Santos',
    email: 'joao.santos@email.com',
    phone: '(11) 99876-5432',
    address: 'Av. Paulista, 1000 - Bela Vista, São Paulo - SP',
    notes: 'Tem cachorro, precisa avisar com antecedência'
  },
  {
    name: 'Ana Oliveira',
    email: 'ana.oliveira@email.com',
    phone: '(11) 91234-5678',
    address: 'Rua Augusta, 500 - Consolação, São Paulo - SP',
    notes: 'Prefere produtos hipoalergênicos'
  }
];

const services = [
  {
    name: 'Limpeza Residencial Básica',
    description: 'Limpeza completa de apartamentos e casas incluindo cozinha, banheiros, quartos e sala',
    price: 150.00,
    duration: 120,
    category: 'Residencial'
  },
  {
    name: 'Limpeza Pós-Obra',
    description: 'Limpeza especializada após reformas e construções',
    price: 250.00,
    duration: 180,
    category: 'Pós-Obra'
  },
  {
    name: 'Limpeza de Vidros e Janelas',
    description: 'Limpeza profissional de vidros, janelas e fachadas',
    price: 80.00,
    duration: 60,
    category: 'Especializada'
  }
];

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    await ensureAdminUser();
    // Insert customers
    console.log('👥 Inserting customers...');
    for (const customer of customers) {
      const { error } = await supabase
        .from('customers')
        .insert([customer]);
      
      if (error) {
        console.error('Error inserting customer:', customer.name, error.message);
      } else {
        console.log(`✅ Customer inserted: ${customer.name}`);
      }
    }

    // Insert services
    console.log('🧽 Inserting services...');
    for (const service of services) {
      const { error } = await supabase
        .from('services')
        .insert([service]);
      
      if (error) {
        console.error('Error inserting service:', service.name, error.message);
      } else {
        console.log(`✅ Service inserted: ${service.name}`);
      }
    }

    console.log('🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${customers.length} customers created`);
    console.log(`   - ${services.length} services created`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
  }
}

// Run the seed script
seedDatabase();
