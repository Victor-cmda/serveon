-- Payment Terms Table
CREATE TABLE IF NOT EXISTS payment_terms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- Payment Term Installments Table
CREATE TABLE IF NOT EXISTS payment_term_installments (
  id SERIAL PRIMARY KEY,
  payment_term_id INTEGER NOT NULL REFERENCES payment_terms(id),
  installment_number INTEGER NOT NULL,
  payment_method_id INTEGER NOT NULL REFERENCES payment_methods(id),
  days_to_payment INTEGER NOT NULL,
  percentage_value DECIMAL(5,2) NOT NULL,
  interest_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT unique_installment_number_per_payment_term UNIQUE (payment_term_id, installment_number)
);

-- Add indexes for better performance
CREATE INDEX idx_payment_term_installments_payment_term_id ON payment_term_installments(payment_term_id);
CREATE INDEX idx_payment_term_installments_payment_method_id ON payment_term_installments(payment_method_id);