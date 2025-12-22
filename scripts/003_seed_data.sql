-- Sample data for Sherdor Mebel Business Management System

-- Sample Tovarlar (Products History) data
INSERT INTO tovarlar (tovar_nomi, raqami, amal_turi, miqdor) VALUES
('Yog''och taxta', 'YT001', 'Olib keldi', 50),
('Yog''och taxta', 'YT001', 'Ishlatildi', 10),
('Metal profil', 'MP002', 'Olib keldi', 30),
('Vida', 'V003', 'Olib keldi', 200),
('Vida', 'V003', 'Ishlatildi', 50);

-- Sample Zakazlar (Orders) data
INSERT INTO zakazlar (tovar_turi, raqami, qanchaga_kelishildi, qancha_berdi, qachon_berish_kerak, izoh) VALUES
('Stol', 'ST001', 500000, 200000, '2024-02-15', 'Katta stol, qora rang'),
('Shkaf', 'SH002', 800000, 300000, '2024-02-20', '3 eshikli shkaf'),
('Kreslo', 'KR003', 300000, 300000, '2024-02-10', 'Yumshoq kreslo - to''liq to''langan');

-- Sample Mebel (Furniture) data
INSERT INTO mebel (mijoz_nomi, mijoz_turi, qancha_tovar_keltirdi, qanchaga_kelishildi, qancha_berdi, izoh) VALUES
('Ahmadjon Karimov', 'Doimiy', '2 ta stol, 4 ta stul', 1200000, 500000, 'Uy uchun mebel to''plami'),
('Malika Tosheva', 'Oddiy', '1 ta shkaf', 600000, 600000, 'Bolalar xonasi uchun - to''liq to''langan'),
('Bobur Rahimov', 'Doimiy', '1 ta divan', 900000, 400000, 'Yashil rangda divan');

-- Sample Kronka (Ribbon) data
INSERT INTO kronka (mijoz_nomi, mijoz_turi, qancha_lenta_urildi, qanchaga_kelishildi, qancha_berdi, izoh) VALUES
('Dilshoda Nazarova', 'Oddiy', '50 metr', 150000, 100000, 'Oq rangda lenta'),
('Sardor Umarov', 'Doimiy', '30 metr', 90000, 90000, 'Qizil lenta - to''liq to''langan'),
('Nigora Salimova', 'Oddiy', '75 metr', 225000, 150000, 'Turli rangda lentalar');
