-- Create cashflow transactions table
CREATE TABLE IF NOT EXISTS cashflow_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(10) NOT NULL CHECK (type IN ('income','expense')),
    category VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
    transaction_date DATE NOT NULL,
    client_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_cashflow_date ON cashflow_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_cashflow_type ON cashflow_transactions(type);
CREATE INDEX IF NOT EXISTS idx_cashflow_category ON cashflow_transactions(category);
CREATE INDEX IF NOT EXISTS idx_cashflow_client ON cashflow_transactions(client_id);

-- Enable RLS and policies
ALTER TABLE cashflow_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view cashflow" ON cashflow_transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage cashflow" ON cashflow_transactions
  FOR ALL TO authenticated USING (true);

-- Helper view for monthly summary (optional)
CREATE OR REPLACE VIEW cashflow_monthly_summary AS
SELECT 
  to_char(transaction_date, 'YYYY-MM') AS month,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) AS net
FROM cashflow_transactions
GROUP BY 1
ORDER BY 1 DESC;
