-- Create customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create appointments table
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    service_id UUID REFERENCES services(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' 
        CHECK (status IN ('scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled')),
    price DECIMAL(10,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID UNIQUE REFERENCES appointments(id) ON DELETE CASCADE,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL DEFAULT CURRENT_DATE + INTERVAL '30 days',
    subtotal DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create company table
CREATE TABLE company (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    address JSONB NOT NULL,
    bank_info JSONB,
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_name ON customers(name);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_service_id ON appointments(service_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_invoices_appointment_id ON invoices(appointment_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_issue_date ON invoices(issue_date);

-- Enable RLS
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE company ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all customers" ON customers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage customers" ON customers
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view all services" ON services
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage services" ON services
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view all appointments" ON appointments
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage appointments" ON appointments
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view all invoices" ON invoices
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage invoices" ON invoices
    FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view company settings" ON company
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage company settings" ON company
    FOR ALL TO authenticated USING (true);

-- Insert default services
INSERT INTO services (name, base_price, description, duration_minutes) VALUES
    ('Limpeza Pós-Obra Residencial', 350.00, 'Limpeza completa após obra residencial', 480),
    ('Limpeza Pós-Obra Comercial', 450.00, 'Limpeza completa após obra comercial', 600),
    ('Limpeza de Vidros e Janelas', 120.00, 'Limpeza especializada em vidros', 120),
    ('Limpeza de Piso e Cerâmica', 180.00, 'Limpeza profunda de pisos', 240);

-- Insert default company data
INSERT INTO company (name, phone, email, address) VALUES
    ('Casa Limpa - Serviços de Limpeza', '(11) 99999-9999', 'contato@casalimpa.com.br', 
     '{"street": "Rua Exemplo", "number": "123", "neighborhood": "Centro", "city": "São Paulo", "state": "SP", "zipCode": "01000-000"}');