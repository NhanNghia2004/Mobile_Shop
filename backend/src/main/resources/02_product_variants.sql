SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM product_variants;
ALTER TABLE product_variants AUTO_INCREMENT = 1;

INSERT INTO product_variants (product_id, storage, color, color_hex, price, discount_price, stock_quantity, status) VALUES

-- 1. iPhone 17 Pro Max (ID: 1)
-- Mùa Bạc (Silver) đầy đủ 3 dung lượng
(1, 256,  'Bạc',               '#F5F5F7', 34990000, 33990000, 50,  'ACTIVE'),
(1, 512,  'Bạc',               '#F5F5F7', 39990000, 38990000, 30,  'ACTIVE'),
(1, 1024, 'Bạc',               '#F5F5F7', 46990000, 45990000, 15,  'ACTIVE'),

-- Màu Xanh Đậm (Dark Blue) đầy đủ 3 dung lượng
(1, 256,  'Xanh Đậm',          '#1E293B', 34990000, 33990000, 50,  'ACTIVE'),
(1, 512,  'Xanh Đậm',          '#1E293B', 39990000, 38990000, 30,  'ACTIVE'),
(1, 1024, 'Xanh Đậm',         '#1E293B', 46990000, 45990000, 15,  'ACTIVE'),

    -- Màu Cam Vũ Trụ (Cosmic Orange) đầy đủ 3 dung lượng
(1, 256,  'Cam Vũ Trụ',        '#D97706', 34990000, 33990000, 50,  'ACTIVE'),
(1, 512,  'Cam Vũ Trụ',        '#D97706', 39990000, 38990000, 30,  'ACTIVE'),
(1, 1024, 'Cam Vũ Trụ',        '#D97706', 46990000, 45990000, 15,  'ACTIVE'),

    -- 2. iPhone 17 Pro (ID: 2)
-- iPhone 17 Pro - Màu Bạc
(2, 256,  'Bạc',               '#F5F5F7', 30990000, 29990000, 60,  'ACTIVE'),
(2, 512,  'Bạc',               '#F5F5F7', 35990000, 34990000, 40,  'ACTIVE'),

    -- iPhone 17 Pro - Màu Xanh Đậm
(2, 256,  'Xanh Đậm',          '#1E293B', 30990000, 29990000, 60,  'ACTIVE'),
(2, 512,  'Xanh Đậm',          '#1E293B', 35990000, 34990000, 40,  'ACTIVE'),

    -- iPhone 17 Pro - Màu Cam Vũ Trụ
(2, 256,  'Cam Vũ Trụ',        '#D97706', 30990000, 29990000, 60,  'ACTIVE'),
(2, 512,  'Cam Vũ Trụ',        '#D97706', 35990000, 34990000, 40,  'ACTIVE'),

-- 3. iPhone 17 (ID: 3)
-- iPhone 17 (ID: 3) - Màu Đen
(3, 256,  'Đen',               '#1C1C1E', 25990000, 24990000, 80,  'ACTIVE'),
(3, 512,  'Đen',               '#1C1C1E', 31990000, 30490000, 15,  'ACTIVE'),

-- iPhone 17 (ID: 3) - Màu Trắng
(3, 256,  'Trắng',             '#FFFFFF', 25990000, 24990000, 80,  'ACTIVE'),
(3, 512,  'Trắng',             '#FFFFFF', 31990000, 30490000, 15,  'ACTIVE'),

-- iPhone 17 (ID: 3) - Màu Tím Oải Hương
(3, 256,  'Tím Oải Hương',     '#E6E6FA', 25990000, 24990000, 80,  'ACTIVE'),
(3, 512,  'Tím Oải Hương',     '#E6E6FA', 31990000, 30490000, 15,  'ACTIVE'),

-- iPhone 17 (ID: 3) - Màu Xanh Lam Khói
(3, 256,  'Xanh Lam Khói',     '#A2B5CD', 25990000, 24990000, 80,  'ACTIVE'),
(3, 512,  'Xanh Lam Khói',     '#A2B5CD', 31990000, 30490000, 15,  'ACTIVE'),



-- 5. iPhone 16 Pro Max (ID: 4)
-- Sản phẩm ID 4 - Màu Titan Sa Mạc
(4, 256,  'Titan Sa Mạc',      '#C2B4A6', 31990000, 30990000, 120, 'ACTIVE'),
(4, 512,  'Titan Sa Mạc',      '#C2B4A6', 36990000, 35490000, 85,  'ACTIVE'),
(4, 1024, 'Titan Sa Mạc',      '#C2B4A6', 43990000, 42490000, 40,  'ACTIVE'),

-- Sản phẩm ID 4 - Màu Titan Tự Nhiên
(4, 256,  'Titan Tự Nhiên',    '#8E8C87', 31990000, 30990000, 120, 'ACTIVE'),
(4, 512,  'Titan Tự Nhiên',    '#8E8C87', 36990000, 35490000, 85,  'ACTIVE'),
(4, 1024, 'Titan Tự Nhiên',    '#8E8C87', 43990000, 42490000, 40,  'ACTIVE'),

-- Sản phẩm ID 4 - Màu Titan Đen
(4, 256,  'Titan Đen',         '#232526', 31990000, 30990000, 120, 'ACTIVE'),
(4, 512,  'Titan Đen',         '#232526', 36990000, 35490000, 85,  'ACTIVE'),
(4, 1024, 'Titan Đen',         '#232526', 43990000, 42490000, 40,  'ACTIVE'),


-- 6. iPhone 16 Pro (ID: 5)
-- iPhone 16 Pro (ID: 5) - Màu Titan Trắng
(5, 128,  'Titan Trắng',       '#F2F1ED', 25990000, 24790000, 90,  'ACTIVE'),
(5, 256,  'Titan Trắng',       '#F2F1ED', 28990000, 27690000, 110, 'ACTIVE'),
(5, 512,  'Titan Trắng',       '#F2F1ED', 34990000, 33490000, 30,  'ACTIVE'),

-- iPhone 16 Pro (ID: 5) - Màu Titan Sa Mạc
(5, 128,  'Titan Sa Mạc',      '#C2B4A6', 25990000, 24790000, 90,  'ACTIVE'),
(5, 256,  'Titan Sa Mạc',      '#C2B4A6', 28990000, 27690000, 110, 'ACTIVE'),
(5, 512,  'Titan Sa Mạc',      '#C2B4A6', 34990000, 33490000, 30,  'ACTIVE'),

-- iPhone 16 Pro (ID: 5) - Màu Titan Đen
(5, 128,  'Titan Đen',         '#232526', 25990000, 24790000, 90,  'ACTIVE'),
(5, 256,  'Titan Đen',         '#232526', 28990000, 27690000, 110, 'ACTIVE'),
(5, 512,  'Titan Đen',         '#232526', 34990000, 33490000, 30,  'ACTIVE'),


-- 8. iPhone 16 (ID: 6)
-- iPhone 16 (ID: 6) - Màu Đen
(6, 128,  'Đen',               '#1C1C1E', 19990000, 18990000, 200, 'ACTIVE'),
(6, 256,  'Đen',               '#1C1C1E', 22990000, 21990000, 150, 'ACTIVE'),

-- iPhone 16 (ID: 6) - Màu Trắng
(6, 128,  'Trắng',             '#FFFFFF', 19990000, 18990000, 200, 'ACTIVE'),
(6, 256,  'Trắng',             '#FFFFFF', 22990000, 21990000, 150, 'ACTIVE'),



-- 9. iPhone 15 Pro Max (ID: 7)
-- iPhone 15 Pro Max (ID: 7) - Màu Titan Tự Nhiên
(7, 256,  'Titan Tự Nhiên',    '#8E8C87', 28990000, 26990000, 140, 'ACTIVE'),
(7, 512,  'Titan Tự Nhiên',    '#8E8C87', 33990000, 31990000, 90,  'ACTIVE'),
(7, 1024, 'Titan Tự Nhiên',    '#8E8C87', 40990000, 38990000, 35,  'ACTIVE'),

-- iPhone 15 Pro Max (ID: 7) - Màu Titan Xanh
(7, 256,  'Titan Xanh',        '#2F4452', 28990000, 26990000, 140, 'ACTIVE'),
(7, 512,  'Titan Xanh',        '#2F4452', 33990000, 31990000, 90,  'ACTIVE'),
(7, 1024, 'Titan Xanh',        '#2F4452', 40990000, 38990000, 35,  'ACTIVE'),

-- iPhone 15 Pro Max (ID: 7) - Màu Titan Đen
(7, 256,  'Titan Đen',         '#232526', 28990000, 26990000, 140, 'ACTIVE'),
(7, 512,  'Titan Đen',         '#232526', 33990000, 31990000, 90,  'ACTIVE'),
(7, 1024, 'Titan Đen',         '#232526', 40990000, 38990000, 35,  'ACTIVE'),



-- 10. iPhone 15 Pro (ID: 8)
-- iPhone 15 Pro (ID: 8) - Màu Titan Trắng
(8, 128,  'Titan Trắng',       '#F2F1ED', 22990000, 21490000, 80,  'ACTIVE'),
(8, 256,  'Titan Trắng',       '#F2F1ED', 25990000, 24290000, 95,  'ACTIVE'),

-- iPhone 15 Pro (ID: 8) - Màu Titan Tự Nhiên
(8, 128,  'Titan Tự Nhiên',    '#8E8C87', 22990000, 21490000, 80,  'ACTIVE'),
(8, 256,  'Titan Tự Nhiên',    '#8E8C87', 25990000, 24290000, 95,  'ACTIVE'),



-- 12. iPhone 15 (ID: 9)
-- Sản phẩm ID 9 - Màu Đen
(9, 128,  'Đen',               '#1C1C1E', 17990000, 16690000, 220, 'ACTIVE'),
(9, 256,  'Đen',               '#1C1C1E', 20990000, 19490000, 130, 'ACTIVE'),

-- Sản phẩm ID 9 - Màu Xanh Lá
(9, 128,  'Xanh Lá',           '#E0F0E3', 17990000, 16690000, 220, 'ACTIVE'),
(9, 256,  'Xanh Lá',           '#E0F0E3', 20990000, 19490000, 130, 'ACTIVE'),

-- Sản phẩm ID 9 - Màu Vàng Chanh
(9, 128,  'Vàng Chanh',        '#FEF7DC', 17990000, 16690000, 220, 'ACTIVE'),
(9, 256,  'Vàng Chanh',        '#FEF7DC', 20990000, 19490000, 130, 'ACTIVE'),

-- Sản phẩm ID 9 - Màu Hồng (Thêm mới)
(9, 128,  'Hồng',              '#FFB6C1', 17990000, 16690000, 220, 'ACTIVE'),
(9, 256,  'Hồng',              '#FFB6C1', 20990000, 19490000, 130, 'ACTIVE'),

-- 13. iPhone 14 Pro Max (ID: 10)
-- iPhone 14 Pro Max (ID: 10) - Màu Tím Đậm
(10, 128, 'Tím Đậm',           '#3E3B4F', 24990000, 22990000, 45,  'ACTIVE'),
(10, 256, 'Tím Đậm',           '#3E3B4F', 27490000, 25490000, 60,  'ACTIVE'),
(10, 512, 'Tím Đậm',           '#3E3B4F', 32490000, 30490000, 20,  'ACTIVE'),

-- iPhone 14 Pro Max (ID: 10) - Màu Vàng Gold
(10, 128, 'Vàng Gold',         '#EAE6D8', 24990000, 22990000, 45,  'ACTIVE'),
(10, 256, 'Vàng Gold',         '#EAE6D8', 27490000, 25490000, 60,  'ACTIVE'),
(10, 512, 'Vàng Gold',         '#EAE6D8', 32490000, 30490000, 20,  'ACTIVE'),

-- iPhone 14 Pro Max (ID: 10) - Màu Bạc Silver
(10, 128, 'Bạc Silver',        '#F5F5F7', 24990000, 22990000, 45,  'ACTIVE'),
(10, 256, 'Bạc Silver',        '#F5F5F7', 27490000, 25490000, 60,  'ACTIVE'),
(10, 512, 'Bạc Silver',        '#F5F5F7', 32490000, 30490000, 20,  'ACTIVE'),


-- 14. iPhone 14 Pro (ID: 11)
-- iPhone 14 Pro (ID: 11) - Màu Tím Đậm
(11, 128, 'Tím Đậm',           '#3E3B4F', 21990000, 19990000, 40,  'ACTIVE'),
(11, 256, 'Tím Đậm',           '#3E3B4F', 24490000, 22490000, 50,  'ACTIVE'),

-- iPhone 14 Pro (ID: 11) - Màu Đen
(11, 128, 'Đen',               '#2C2C2C', 21990000, 19990000, 40,  'ACTIVE'),
(11, 256, 'Đen',               '#2C2C2C', 24490000, 22490000, 50,  'ACTIVE'),

-- iPhone 14 Pro (ID: 11) - Màu Vàng (Thêm mới)
(11, 128, 'Vàng',              '#EAE6D8', 21990000, 19990000, 40,  'ACTIVE'),
(11, 256, 'Vàng',              '#EAE6D8', 24490000, 22490000, 50,  'ACTIVE'),


-- 16. iPhone 14 (ID: 12)
-- iPhone 14 (ID: 12) - Màu Đỏ (Product RED)
(12, 128, 'Đỏ',  '#E11D48', 15990000, 14490000, 85,  'ACTIVE'),
(12, 256, 'Đỏ',  '#E11D48', 18990000, 17490000, 70,  'ACTIVE'),

-- iPhone 14 (ID: 12) - Màu Trắng Starlight
(12, 128, 'Trắng',   '#F9F6EE', 15990000, 14490000, 85,  'ACTIVE'),
(12, 256, 'Trắng',   '#F9F6EE', 18990000, 17490000, 70,  'ACTIVE'),

-- iPhone 14 (ID: 12) - Màu Xanh (Thêm mới)
(12, 128, 'Xanh',              '#A2B5CD', 15990000, 14490000, 85,  'ACTIVE'),
(12, 256, 'Xanh',              '#A2B5CD', 18990000, 17490000, 70,  'ACTIVE'),


-- 17. iPhone 13 Pro Max (ID: 13)
-- iPhone 13 Pro Max (ID: 13) - Màu Xanh dương
(13, 128, 'Xanh dương',        '#9BB5CE', 20990000, 18990000, 75,  'ACTIVE'),
(13, 256, 'Xanh dương',        '#9BB5CE', 22990000, 20990000, 65,  'ACTIVE'),
(13, 512, 'Xanh dương',        '#9BB5CE', 26990000, 24990000, 10,  'ACTIVE'),

-- iPhone 13 Pro Max (ID: 13) - Màu Xanh lá
(13, 128, 'Xanh lá',           '#4E5B4E', 20990000, 18990000, 75,  'ACTIVE'),
(13, 256, 'Xanh lá',           '#4E5B4E', 22990000, 20990000, 65,  'ACTIVE'),
(13, 512, 'Xanh lá',           '#4E5B4E', 26990000, 24990000, 10,  'ACTIVE'),

-- iPhone 13 Pro Max (ID: 13) - Màu Vàng
(13, 128, 'Vàng',              '#EAE6D8', 20990000, 18990000, 75,  'ACTIVE'),
(13, 256, 'Vàng',              '#EAE6D8', 22990000, 20990000, 65,  'ACTIVE'),
(13, 512, 'Vàng',              '#EAE6D8', 26990000, 24990000, 10,  'ACTIVE'),

-- 18. iPhone 13 Pro (ID: 14)
-- iPhone 13 Pro (ID: 14) - Màu Xanh Dương
(14, 128, 'Xanh Dương',        '#9BB5CE', 18490000, 16990000, 35,  'ACTIVE'),
(14, 256, 'Xanh Dương',        '#9BB5CE', 20990000, 19490000, 40,  'ACTIVE'),

-- iPhone 13 Pro (ID: 14) - Màu Xám
(14, 256, 'Xám',               '#4B4B4B', 20990000, 19490000, 40,  'ACTIVE'),
(14, 512, 'Xám',               '#4B4B4B', 24990000, 23490000, 15,  'ACTIVE'),

-- iPhone 13 Pro (ID: 14) - Màu Bạc (Thêm mới)
(14, 128, 'Bạc',               '#F5F5F7', 18490000, 16990000, 35,  'ACTIVE'),
(14, 512, 'Bạc',               '#F5F5F7', 24990000, 23490000, 15,  'ACTIVE'),

-- iPhone 13 Pro (ID: 14) - Màu Xanh Lá (Thêm mới)
(14, 128, 'Xanh Lá',           '#4E5B4E', 18490000, 16990000, 35,  'ACTIVE'),
(14, 256, 'Xanh Lá',           '#4E5B4E', 20990000, 19490000, 40,  'ACTIVE'),


-- 19. iPhone 13 (ID: 15)
-- iPhone 13 (ID: 15) - Màu Hồng
(15, 128, 'Hồng',              '#FFC0CB', 13990000, 12690000, 180, 'ACTIVE'),
(15, 256, 'Hồng',              '#FFC0CB', 16490000, 14990000, 120, 'ACTIVE'),

-- iPhone 13 (ID: 15) - Màu Xanh Dương (Đổi từ Xanh Midnight)
(15, 128, 'Xanh Dương',        '#215E79', 13990000, 12690000, 180, 'ACTIVE'),
(15, 256, 'Xanh Dương',        '#215E79', 16490000, 14990000, 120, 'ACTIVE'),

-- iPhone 13 (ID: 15) - Màu Đen (Thêm mới)
(15, 128, 'Đen',               '#1C1C1E', 13990000, 12690000, 180, 'ACTIVE'),
(15, 256, 'Đen',               '#1C1C1E', 16490000, 14990000, 120, 'ACTIVE'),

-- iPhone 13 (ID: 15) - Màu Trắng (Thêm mới)
(15, 128, 'Trắng',             '#F9F6EE', 13990000, 12690000, 180, 'ACTIVE'),
(15, 256, 'Trắng',             '#F9F6EE', 16490000, 14990000, 120, 'ACTIVE'),


-- 20. iPhone 13 mini (ID: 16)
-- iPhone 13 mini (ID: 16) - Màu Đen (Đổi từ Xanh Midnight)
(16, 128, 'Đen',               '#1C1C1E', 11990000, 10490000, 45,  'ACTIVE'),
(16, 256, 'Đen',               '#1C1C1E', 14490000, 12990000, 20,  'ACTIVE'),

-- iPhone 13 mini (ID: 16) - Màu Trắng (Đổi từ Trắng Starlight)
(16, 128, 'Trắng',             '#F9F6EE', 11990000, 10490000, 45,  'ACTIVE'),
(16, 256, 'Trắng',             '#F9F6EE', 14490000, 12990000, 20,  'ACTIVE'),

-- iPhone 13 mini (ID: 16) - Màu Hồng (Thêm mới)
(16, 128, 'Hồng',              '#FFC0CB', 11990000, 10490000, 45,  'ACTIVE'),
(16, 256, 'Hồng',              '#FFC0CB', 14490000, 12990000, 20,  'ACTIVE'),


-- 21. iPhone 12 Pro Max (ID: 17)
-- Sản phẩm ID 17 - Màu Xanh Dương (Xanh Pacific Blue)
(17, 128, 'Xanh Dương',        '#2E4A62', 16990000, 14990000, 50,  'ACTIVE'),
(17, 256, 'Xanh Dương',        '#2E4A62', 18990000, 16990000, 40,  'ACTIVE'),

-- Sản phẩm ID 17 - Màu Vàng (Vàng Gold)
(17, 256, 'Vàng',              '#EAE6D8', 18990000, 16990000, 40,  'ACTIVE'),
(17, 512, 'Vàng',              '#EAE6D8', 22990000, 20990000, 15,  'ACTIVE'),

-- Sản phẩm ID 17 - Màu Bạc (Thêm mới)
(17, 128, 'Bạc',               '#F5F5F7', 16990000, 14990000, 50,  'ACTIVE'),
(17, 512, 'Bạc',               '#F5F5F7', 22990000, 20990000, 15,  'ACTIVE'),

-- Sản phẩm ID 17 - Màu Xám (Thêm mới)
(17, 128, 'Xám',               '#4B4B4B', 16990000, 14990000, 50,  'ACTIVE'),
(17, 256, 'Xám',               '#4B4B4B', 18990000, 16990000, 40,  'ACTIVE'),
(17, 512, 'Xám',               '#4B4B4B', 22990000, 20990000, 15,  'ACTIVE'),


-- 22. iPhone 12 (ID: 18)
-- Sản phẩm ID 18 - Màu Đen
(18, 128, 'Đen',               '#1C1C1E', 12490000, 10990000, 200, 'ACTIVE'),
(18, 256, 'Đen',               '#1C1C1E', 14990000, 13490000, 30,  'ACTIVE'),

-- Sản phẩm ID 18 - Màu Trắng
(18, 128, 'Trắng',             '#FFFFFF', 12490000, 10990000, 200, 'ACTIVE'),
(18, 256, 'Trắng',             '#FFFFFF', 14990000, 13490000, 30,  'ACTIVE'),
-- Sản phẩm ID 18 - Màu Xanh Ngọc
(18, 128, 'Xanh Ngọc',         '#A3E4D7', 12490000, 10990000, 200, 'ACTIVE'),
(18, 256, 'Xanh Ngọc',         '#A3E4D7', 14990000, 13490000, 30,  'ACTIVE'),

-- 23. iPhone SE 2022 (ID: 19)
-- iPhone SE 2022 (ID: 19) - Màu Đỏ
(19, 64,  'Đỏ',                '#E11D48', 9990000,  8490000,  90,  'ACTIVE'),
(19, 128, 'Đỏ',                '#E11D48', 11490000, 9990000,  110, 'ACTIVE'),

-- iPhone SE 2022 (ID: 19) - Màu Đen
(19, 64,  'Đen',               '#1C1C1E', 9990000,  8490000,  90,  'ACTIVE'),
(19, 128, 'Đen',               '#1C1C1E', 11490000, 9990000,  110, 'ACTIVE'),

-- II Sam sung

-- 1. Samsung Galaxy S26 Ultra (ID: 20)
(20, 256, 'Đen', '#2C2C2C', 33990000, 31990000, 100, 'ACTIVE'),
(20, 512, 'Đen', '#2C2C2C', 38990000, 36990000, 80, 'ACTIVE'),
(20, 256, 'Tím', '#3B2F63', 33990000, 31990000, 100, 'ACTIVE'),
(20, 512, 'Tím', '#3B2F63', 38990000, 36990000, 80, 'ACTIVE'),
(20, 256, 'Trắng', '#FFFFFF', 33990000, 31990000, 100, 'ACTIVE'),
(20, 512, 'Trắng', '#FFFFFF', 38990000, 36990000, 80, 'ACTIVE'),

-- 2. Samsung Galaxy S25 Ultra (ID: 21)
(21, 256,  'Đen Titan',         '#222222', 31990000, 29990000, 120, 'ACTIVE'),
(21, 512,  'Đen Titan',         '#222222', 36990000, 34990000, 90,  'ACTIVE'),
(21, 1024, 'Đen Titan',         '#222222', 44990000, 42990000, 40,  'ACTIVE'),
(21, 256,  'Xám Titan',         '#7D7D7D', 31990000, 29990000, 120, 'ACTIVE'),
(21, 512,  'Xám Titan',         '#7D7D7D', 36990000, 34990000, 90,  'ACTIVE'),
(21, 1024, 'Xám Titan',         '#7D7D7D', 44990000, 42990000, 40,  'ACTIVE'),

-- 3. Samsung Galaxy S25 (ID: 22)
(22, 256,  'Đen Onyx',          '#1C1C1E', 22990000, 20990000, 150, 'ACTIVE'),
(22, 512,  'Đen Onyx',          '#1C1C1E', 26490000, 24490000, 80,  'ACTIVE'),
(22, 256,  'Xám Cẩm Thạch',     '#D1D5DB', 22990000, 20990000, 150, 'ACTIVE'),
(22, 512,  'Xám Cẩm Thạch',     '#D1D5DB', 26490000, 24490000, 80,  'ACTIVE'),

-- 4. Samsung Galaxy S24 Ultra (ID: 23)
(23, 256,  'Đen Titan',         '#222222', 29990000, 26990000, 200, 'ACTIVE'),
(23, 512,  'Đen Titan',         '#222222', 34990000, 31990000, 150, 'ACTIVE'),
(23, 1024, 'Đen Titan',         '#222222', 42990000, 38990000, 50,  'ACTIVE'),
(23, 256,  'Xám Titan',         '#7D7D7D', 29990000, 26990000, 200, 'ACTIVE'),
(23, 512,  'Xám Titan',         '#7D7D7D', 34990000, 31990000, 150, 'ACTIVE'),
(23, 1024, 'Xám Titan',         '#7D7D7D', 42990000, 38990000, 50,  'ACTIVE'),
(23, 256,  'Vàng Titan',        '#F3E5AB', 29990000, 26990000, 180, 'ACTIVE'),
(23, 512,  'Vàng Titan',        '#F3E5AB', 34990000, 31990000, 120, 'ACTIVE'),

-- 5. Samsung Galaxy S24 (ID: 24)
(24, 256,  'Đen Onyx',          '#1C1C1E', 19990000, 16990000, 250, 'ACTIVE'),
(24, 512,  'Đen Onyx',          '#1C1C1E', 23490000, 20490000, 100, 'ACTIVE'),
(24, 256,  'Vàng Amber',        '#F7E7CE', 19990000, 16990000, 200, 'ACTIVE'),
(24, 512,  'Vàng Amber',        '#F7E7CE', 23490000, 20490000, 90,  'ACTIVE'),
(24, 256,  'Tím Cobalt',        '#3B2F63', 19990000, 16990000, 180, 'ACTIVE'),
(24, 512,  'Tím Cobalt',        '#3B2F63', 23490000, 20490000, 80,  'ACTIVE'),

-- 6. Samsung Galaxy Z Fold 6 (ID: 25)
(25, 256,  'Xám Metal',         '#6B7280', 43990000, 40990000, 120, 'ACTIVE'),
(25, 512,  'Xám Metal',         '#6B7280', 47990000, 44990000, 90,  'ACTIVE'),
(25, 1024, 'Xám Metal',         '#6B7280', 54990000, 51990000, 30,  'ACTIVE'),
(25, 256,  'Hồng Navy',         '#F4C2C2', 43990000, 40990000, 100, 'ACTIVE'),
(25, 512,  'Hồng Navy',         '#F4C2C2', 47990000, 44990000, 70,  'ACTIVE'),

-- 7. Samsung Galaxy Z Flip 6 (ID: 26)
(26, 256,  'Xanh Mộc Mạc',      '#A2C4C9', 28990000, 25990000, 180, 'ACTIVE'),
(26, 512,  'Xanh Mộc Mạc',      '#A2C4C9', 32990000, 29990000, 100, 'ACTIVE'),
(26, 256,  'Vàng',     '#FEF08A', 28990000, 25990000, 160, 'ACTIVE'),
(26, 512,  'Vàng',     '#FEF08A', 32990000, 29990000, 80,  'ACTIVE'),

-- 8. Samsung Galaxy S23 Ultra (ID: 27)
(27, 256,  'Đen Phantom',       '#202124', 26990000, 21990000, 300, 'ACTIVE'),
(27, 512,  'Đen Phantom',       '#202124', 30990000, 25990000, 200, 'ACTIVE'),
(27, 256,  'Xanh Botanic',      '#3A4D39', 26990000, 21990000, 250, 'ACTIVE'),
(27, 512,  'Xanh Botanic',      '#3A4D39', 30990000, 25990000, 150, 'ACTIVE'),

-- 9. Samsung Galaxy S23 FE (ID: 28)
(28, 128,  'Xanh Mint',         '#98FF98', 14890000, 12490000, 220, 'ACTIVE'),
(28, 256,  'Xanh Mint',         '#98FF98', 16890000, 14490000, 180, 'ACTIVE'),
(28, 128,  'Trắng Cream',       '#FDFBF7', 14890000, 12490000, 200, 'ACTIVE'),
(28, 256,  'Trắng Cream',       '#FDFBF7', 16890000, 14490000, 150, 'ACTIVE'),

-- 10. Samsung Galaxy A55 (ID: 29)
(29, 128,  'Xanh Iceblue',      '#D0E8F2', 9990000,  8990000,  350, 'ACTIVE'),
(29, 256,  'Xanh Iceblue',      '#D0E8F2', 11490000, 10190000, 280, 'ACTIVE'),
(29, 128,  'Đen Navy',          '#1B263B', 9990000,  8990000,  320, 'ACTIVE'),
(29, 256,  'Đen Navy',          '#1B263B', 11490000, 10190000, 250, 'ACTIVE'),

-- 11. Samsung Galaxy A35 (ID: 30)
(30, 128,  'Xanh Iceblue',      '#D0E8F2', 8290000,  7290000,  400, 'ACTIVE'),
(30, 256,  'Xanh Iceblue',      '#D0E8F2', 9290000,  8290000,  300, 'ACTIVE'),
(30, 128,  'Vàng Lemon',        '#FFF59D', 8290000,  7290000,  350, 'ACTIVE'),
(30, 256,  'Vàng Lemon',        '#FFF59D', 9290000,  8290000,  250, 'ACTIVE'),

-- 12. Samsung Galaxy A26 (ID: 31)
(31, 128,  'Đen Tối Giản',      '#212121', 6590000,  5690000,  450, 'ACTIVE'),
(31, 256,  'Đen Tối Giản',      '#212121', 7290000,  6390000,  300, 'ACTIVE'),
(31, 128,  'Xanh Thủy Tinh',    '#B2EBF2', 6590000,  5690000,  400, 'ACTIVE'),
(31, 256,  'Xanh Thủy Tinh',    '#B2EBF2', 7290000,  6390000,  280, 'ACTIVE'),

-- 13. Samsung Galaxy A16 (ID: 32)
(32, 128,  'Đen Nhám',          '#2C3E50', 4990000,  4290000,  600, 'ACTIVE'),
(32, 256,  'Đen Nhám',          '#2C3E50', 5590000,  4890000,  400, 'ACTIVE'),
(32, 128,  'Xanh Lơ',           '#E0F7FA', 4990000,  4290000,  550, 'ACTIVE'),
(32, 256,  'Xanh Lơ',           '#E0F7FA', 5590000,  4890000,  380, 'ACTIVE'),

-- 14. Samsung Galaxy A06 (ID: 33)
(33, 128,  'Đen Đá',            '#1A1A1A', 3990000,  3290000,  700, 'ACTIVE'),
(33, 128,  'Xanh Ngọc',           '#C8E6C9', 3990000,  3290000,  500, 'ACTIVE'),

-- 15. Samsung Galaxy A27 (ID: 34)
(34, 128,  'Đen',               '#212121', 7990000,  6990000,  300, 'ACTIVE'),
(34, 256,  'Đen',               '#212121', 8990000,  7990000,  200, 'ACTIVE'),
(34, 128,  'Hồng',              '#FFC0CB', 7990000,  6990000,  250, 'ACTIVE'),
(34, 256,  'Hồng',              '#FFC0CB', 8990000,  7990000,  180, 'ACTIVE');







-- =========================================================================
-- III. HÌNH ẢNH BIẾN THỂ (VARIANT IMAGES) - ĐỒNG BỘ 1 -> 93
-- =========================================================================
SET FOREIGN_KEY_CHECKS = 1;