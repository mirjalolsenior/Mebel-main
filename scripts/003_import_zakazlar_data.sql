-- Import existing zakazlar data from CSV

INSERT INTO zakazlar (id, tovar_turi, raqami, qanchaga_kelishildi, qancha_berdi, qachon_berish_kerak, izoh, sana) VALUES
('560c810e-c9c0-454e-bfc2-a170f5199e0d', 'Alisher pochcham ', '+998 88-685-75-00', 160000.00, 0.00, NULL, NULL, '2025-11-04 14:49:37.745878+00'),
('66148681-0248-4687-ae93-5b8349006c2e', 'Akistuvar  alisher pochcha', '+998 88-685-75-00', 650000.00, 0.00, '2025-11-11', '50 dona chaspak  400000
20 dona ushka 40000
20 dona temir ugolnik 30000
3 pachka SND salaska vakum 180000', '2025-11-05 13:38:51.622275+00'),
('947e5d3c-0275-46b1-ae37-69cd8d04e66d', 'Shikaf ', '972286363', 7500000.00, 3500000.00, '2025-11-08', NULL, '2025-11-01 03:53:58.094377+00'),
('b5ecde18-154d-47b1-bc3c-9eb3b2b9032b', 'Xontaxta ', '+998 93-313-03-75', 350000.00, 0.00, '2025-12-17', NULL, '2025-12-15 13:38:49.448105+00'),
('be87fb04-2fe2-47e3-bab8-a8d565908c9b', 'Kuxniya ', '936121880', 14550000.00, 8000000.00, '2025-11-10', 'Karga un 550000 qushilgan ', '2025-11-01 03:57:08.408729+00'),
('ce0a2cfb-e06a-43ad-8bc0-5c17a2e1eb49', 'Farxod aka kansaner usta ', '+998 91-991-00-84', 7000000.00, 2480000.00, '2025-08-15', '200$ bergan ', '2025-10-10 12:00:47.498466+00')
ON CONFLICT (id) DO NOTHING;
