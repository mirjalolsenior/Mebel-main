-- Sherdor Mebel Business Management System Database Schema

-- Tovarlar (Products History) table
CREATE TABLE IF NOT EXISTS tovarlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tovar_nomi TEXT NOT NULL,
  raqami TEXT NOT NULL,
  amal_turi TEXT NOT NULL CHECK (amal_turi IN ('Olib keldi', 'Ishlatildi')),
  miqdor INTEGER NOT NULL CHECK (miqdor > 0),
  sana TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ombor (Inventory Balance) table
CREATE TABLE IF NOT EXISTS ombor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tovar_nomi TEXT NOT NULL,
  raqami TEXT NOT NULL,
  jami_keltirilgan INTEGER DEFAULT 0,
  jami_ishlatilgan INTEGER DEFAULT 0,
  qoldiq INTEGER DEFAULT 0,
  oxirgi_yangilanish TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tovar_nomi, raqami)
);

-- Zakazlar (Orders) table
CREATE TABLE IF NOT EXISTS zakazlar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tovar_turi TEXT NOT NULL,
  raqami TEXT,
  qanchaga_kelishildi DECIMAL(12,2) NOT NULL CHECK (qanchaga_kelishildi >= 0),
  qancha_berdi DECIMAL(12,2) DEFAULT 0 CHECK (qancha_berdi >= 0),
  qancha_qoldi DECIMAL(12,2) GENERATED ALWAYS AS (qanchaga_kelishildi - qancha_berdi) STORED,
  qachon_berish_kerak DATE,
  izoh TEXT,
  sana TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mebel (Furniture) table
CREATE TABLE IF NOT EXISTS mebel (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mijoz_nomi TEXT NOT NULL,
  mijoz_turi TEXT NOT NULL CHECK (mijoz_turi IN ('Oddiy', 'Doimiy')),
  qancha_tovar_keltirdi TEXT,
  qanchaga_kelishildi DECIMAL(12,2) NOT NULL CHECK (qanchaga_kelishildi >= 0),
  qancha_berdi DECIMAL(12,2) DEFAULT 0 CHECK (qancha_berdi >= 0),
  qancha_qoldi DECIMAL(12,2) GENERATED ALWAYS AS (qanchaga_kelishildi - qancha_berdi) STORED,
  izoh TEXT,
  sana TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kronka (Ribbon) table
CREATE TABLE IF NOT EXISTS kronka (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mijoz_nomi TEXT NOT NULL,
  mijoz_turi TEXT NOT NULL CHECK (mijoz_turi IN ('Oddiy', 'Doimiy')),
  qancha_lenta_urildi TEXT,
  qanchaga_kelishildi DECIMAL(12,2) NOT NULL CHECK (qanchaga_kelishildi >= 0),
  qancha_berdi DECIMAL(12,2) DEFAULT 0 CHECK (qancha_berdi >= 0),
  qancha_qoldi DECIMAL(12,2) GENERATED ALWAYS AS (qanchaga_kelishildi - qancha_berdi) STORED,
  izoh TEXT,
  sana TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Arxiv (Archive) table
CREATE TABLE IF NOT EXISTS arxiv (
  id UUID PRIMARY KEY,
  modul_turi TEXT NOT NULL CHECK (modul_turi IN ('Zakaz', 'Mebel', 'Kronka')),
  mijoz_nomi_yoki_tovar_turi TEXT NOT NULL,
  raqami_yoki_miqdori TEXT,
  mijoz_turi TEXT CHECK (mijoz_turi IN ('Oddiy', 'Doimiy')),
  qanchaga_kelishildi DECIMAL(12,2) NOT NULL,
  qancha_berdi DECIMAL(12,2) NOT NULL,
  qancha_qoldi DECIMAL(12,2) NOT NULL CHECK (qancha_qoldi = 0),
  izoh TEXT,
  sana TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tovarlar_sana ON tovarlar(sana DESC);
CREATE INDEX IF NOT EXISTS idx_ombor_tovar_raqam ON ombor(tovar_nomi, raqami);
CREATE INDEX IF NOT EXISTS idx_zakazlar_sana ON zakazlar(sana DESC);
CREATE INDEX IF NOT EXISTS idx_zakazlar_qoldi ON zakazlar(qancha_qoldi);
CREATE INDEX IF NOT EXISTS idx_mebel_sana ON mebel(sana DESC);
CREATE INDEX IF NOT EXISTS idx_mebel_qoldi ON mebel(qancha_qoldi);
CREATE INDEX IF NOT EXISTS idx_kronka_sana ON kronka(sana DESC);
CREATE INDEX IF NOT EXISTS idx_kronka_qoldi ON kronka(qancha_qoldi);
CREATE INDEX IF NOT EXISTS idx_arxiv_modul ON arxiv(modul_turi);
CREATE INDEX IF NOT EXISTS idx_arxiv_sana ON arxiv(sana DESC);
