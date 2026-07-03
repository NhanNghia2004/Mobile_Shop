SET FOREIGN_KEY_CHECKS = 0;

-- Xoá dữ liệu cũ
DELETE FROM product_variant_images;
DELETE FROM product_variants;
DELETE FROM products;

-- Đặt lại bộ đếm ID về 1
ALTER TABLE product_variant_images AUTO_INCREMENT = 1;
ALTER TABLE product_variants AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;

-- =========================================================================
-- I. 35 SẢN PHẨM (7 THƯƠNG HIỆU x 5 SẢN PHẨM) - ID TỪ 1 -> 35
-- =========================================================================
INSERT INTO products (name, brand, description, image_url, category, os, screen_size, battery_capacity, ram, status, sold_count, rating, review_count, created_at, updated_at) VALUES

-- === 1. APPLE (ID: 1 -> 5) ===
('iPhone 15 Pro Max', 'Apple', 'Chip A17 Pro mạnh nhất từ trước đến nay, titan siêu bền, camera 48MP zoom quang 5x.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg', 'SMARTPHONE', 'IOS', 6.7, 4422, 8, 'ACTIVE', 2800, 4.9, 320, DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
('iPhone 15 Pro', 'Apple', 'Thiết kế titan nhỏ gọn, chip A17 Pro, màn hình ProMotion 120Hz.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3274, 8, 'ACTIVE', 2100, 4.8, 280, DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
('iPhone 15', 'Apple', 'Trang bị Dynamic Island đột phá, cổng sạc USB-C mới, camera 48MP sắc nét.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3349, 6, 'ACTIVE', 3000, 4.8, 400, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
('iPhone 14 Plus', 'Apple', 'Màn hình lớn trải nghiệm cực đã, pin trâu ấn tượng, chip A15 cải tiến.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-plus-1.jpg', 'SMARTPHONE', 'IOS', 6.7, 4325, 6, 'ACTIVE', 1500, 4.6, 190, DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
('iPhone 13', 'Apple', 'Chip A15 Bionic mạnh mẽ ổn định, cụm camera chéo độc đáo, pin tối ưu tốt.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3227, 4, 'ACTIVE', 6000, 4.6, 700, DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),

-- === 2. SAMSUNG (ID: 6 -> 10) ===
('Samsung Galaxy S24 Ultra', 'Samsung', 'Tích hợp bút S Pen, chip Snapdragon 8 Gen 3, camera 200MP đột phá công nghệ AI.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.8, 5000, 12, 'ACTIVE', 1900, 4.8, 240, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
('Samsung Galaxy S24+', 'Samsung', 'Chip hiệu năng cao, màn hình 6.7 inch QHD+, công nghệ sạc siêu tốc 45W.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-plus-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 4900, 12, 'ACTIVE', 1400, 4.7, 185, DATE_SUB(NOW(), INTERVAL 35 MINUTE), DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
('Samsung Galaxy Z Fold 5', 'Samsung', 'Màn hình gập 7.6 inch cao cấp, bản lề Flex mới giúp gập không kẽ hở.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold5-1.jpg', 'SMARTPHONE', 'ANDROID', 7.6, 4400, 12, 'ACTIVE', 650, 4.7, 88, DATE_SUB(NOW(), INTERVAL 40 MINUTE), DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
('Samsung Galaxy Z Flip 5', 'Samsung', 'Màn hình ngoài Flex Window cực lớn, thiết kế gập vỏ sò thời thượng.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-flip5-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 3700, 8, 'ACTIVE', 1200, 4.6, 145, DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
('Samsung Galaxy A55', 'Samsung', 'Thiết kế khung kim loại cao cấp, camera 50MP, màn hình mượt mà Super AMOLED 120Hz.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.6, 5000, 8, 'ACTIVE', 3500, 4.5, 450, DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),

-- === 3. XIAOMI (ID: 11 -> 15) ===
('Xiaomi 14 Ultra', 'Xiaomi', 'Hệ thống camera Leica thế hệ mới, màn hình cong LTPO, chip Snapdragon 8 Gen 3.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.73, 5300, 16, 'ACTIVE', 800, 4.7, 120, DATE_SUB(NOW(), INTERVAL 55 MINUTE), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
('Xiaomi 14', 'Xiaomi', 'Kích thước nhỏ gọn cầm nắm cực tốt, camera Leica sắc nét, sạc nhanh 90W.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.36, 4610, 12, 'ACTIVE', 1200, 4.7, 180, DATE_SUB(NOW(), INTERVAL 60 MINUTE), DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
('Xiaomi Redmi Note 13 Pro+', 'Xiaomi', 'Camera độ phân giải siêu cao 200MP, kháng nước IP68, sạc siêu tốc 120W.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 12, 'ACTIVE', 2800, 4.6, 380, DATE_SUB(NOW(), INTERVAL 65 MINUTE), DATE_SUB(NOW(), INTERVAL 65 MINUTE)),
('Xiaomi Poco X6 Pro', 'Xiaomi', 'Quái vật cấu hình tầm trung, chip Dimensity 8300-Ultra, màn hình AMOLED 1.5K.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 12, 'ACTIVE', 1800, 4.5, 260, DATE_SUB(NOW(), INTERVAL 70 MINUTE), DATE_SUB(NOW(), INTERVAL 70 MINUTE)),
('Xiaomi Redmi Note 13', 'Xiaomi', 'Màn hình AMOLED 120Hz viền siêu mỏng, camera 108MP, giá thành cực tốt.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 6, 'ACTIVE', 5000, 4.5, 620, DATE_SUB(NOW(), INTERVAL 75 MINUTE), DATE_SUB(NOW(), INTERVAL 75 MINUTE)),

-- === 4. OPPO (ID: 16 -> 20) ===
('Oppo Find X7 Ultra', 'Oppo', 'Hệ thống camera Periscope kép độc bản, chip Snapdragon 8 Gen 3, sạc siêu nhanh 100W.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.82, 5000, 16, 'ACTIVE', 450, 4.6, 70, DATE_SUB(NOW(), INTERVAL 80 MINUTE), DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
('Oppo Reno 11 Pro', 'Oppo', 'Chuyên gia chân dung AI cao cấp, thiết kế mỏng nhẹ lấp lánh thời trang.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 4600, 12, 'ACTIVE', 950, 4.4, 110, DATE_SUB(NOW(), INTERVAL 85 MINUTE), DATE_SUB(NOW(), INTERVAL 85 MINUTE)),
('Oppo Reno 11', 'Oppo', 'Camera chân dung chuyên nghiệp, màn hình cong 3D mượt mà, sạc nhanh SuperVOOC.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 5000, 8, 'ACTIVE', 1500, 4.4, 180, DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
('Oppo Find N3 Flip', 'Oppo', 'Màn hình phụ dạng dọc tiện lợi, cụm 3 camera Hasselblad chất lượng đỉnh cao.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-n3-flip-1.jpg', 'SMARTPHONE', 'ANDROID', 6.8, 4300, 12, 'ACTIVE', 400, 4.5, 52, DATE_SUB(NOW(), INTERVAL 95 MINUTE), DATE_SUB(NOW(), INTERVAL 95 MINUTE)),
('Oppo A79', 'Oppo', 'Thiết kế lông vũ độc đáo, loa kép âm thanh nổi sống động, pin lớn bền bỉ.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-a79-1.jpg', 'SMARTPHONE', 'ANDROID', 6.72, 5000, 8, 'ACTIVE', 2300, 4.3, 140, DATE_SUB(NOW(), INTERVAL 100 MINUTE), DATE_SUB(NOW(), INTERVAL 100 MINUTE)),

-- === 5. VIVO (ID: 21 -> 25) ===
('Vivo X100 Pro', 'Vivo', 'Ống kính ZEISS cao cấp APO, chip Dimensity 9300 xử lý đồ họa mượt mà.', 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5400, 16, 'ACTIVE', 380, 4.6, 55, DATE_SUB(NOW(), INTERVAL 105 MINUTE), DATE_SUB(NOW(), INTERVAL 105 MINUTE)),
('Vivo V30 Pro', 'Vivo', 'Hệ thống Aura Light chụp chân dung độc quyền, 3 camera đồng độ 50MP từ ZEISS.', 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5000, 12, 'ACTIVE', 750, 4.5, 88, DATE_SUB(NOW(), INTERVAL 110 MINUTE), DATE_SUB(NOW(), INTERVAL 110 MINUTE)),
('Vivo V30', 'Vivo', 'Thiết kế siêu mỏng nhẹ, màn hình cong tràn cạnh, camera selfie góc rộng 50MP.', 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5000, 8, 'ACTIVE', 1100, 4.4, 115, DATE_SUB(NOW(), INTERVAL 115 MINUTE), DATE_SUB(NOW(), INTERVAL 115 MINUTE)),
('Vivo Y100', 'Vivo', 'Mặt lưng đổi màu độc đáo dưới ánh nắng, sạc siêu tốc 80W, loa kép siêu âm lượng.', 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-y100-4g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 8, 'ACTIVE', 2600, 4.4, 210, DATE_SUB(NOW(), INTERVAL 120 MINUTE), DATE_SUB(NOW(), INTERVAL 120 MINUTE)),
('Vivo iQOO Neo 9', 'Vivo', 'Cấu hình gaming cực khủng, chip Snapdragon 8 Gen 2, màn hình tần số quét 144Hz.', 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-neo9-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5160, 12, 'ACTIVE', 850, 4.7, 95, DATE_SUB(NOW(), INTERVAL 125 MINUTE), DATE_SUB(NOW(), INTERVAL 125 MINUTE)),

-- === 6. REALME (ID: 26 -> 30) ===
('Realme GT 6', 'Realme', 'Độ sáng màn hình tối đa lên tới 6000 nits, vi xử lý cận cao cấp Snapdragon 8s Gen 3.', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5500, 12, 'ACTIVE', 550, 4.4, 75, DATE_SUB(NOW(), INTERVAL 130 MINUTE), DATE_SUB(NOW(), INTERVAL 130 MINUTE)),
('Realme GT Neo 6 SE', 'Realme', 'Hiệu năng gaming vượt trội tầm giá, màn hình bảo vệ mắt tối ưu, pin cực lớn.', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-neo6-se-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5500, 12, 'ACTIVE', 900, 4.5, 110, DATE_SUB(NOW(), INTERVAL 135 MINUTE), DATE_SUB(NOW(), INTERVAL 135 MINUTE)),
-- ĐÃ FIX LỖI Ở ĐÂY: Thay '6.7' thành số 6.7 bỏ dấu nháy đơn
('Realme 12 Pro+', 'Realme', 'Thiết kế lấy cảm hứng từ đồng hồ luxury, trang bị camera tiềm vọng cao cấp.', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 5000, 8, 'ACTIVE', 1200, 4.5, 130, DATE_SUB(NOW(), INTERVAL 140 MINUTE), DATE_SUB(NOW(), INTERVAL 140 MINUTE)),
('Realme 12', 'Realme', 'Camera 108MP chi tiết cao, thiết kế vuông vắn trendy thời thượng, sạc nhanh 45W.', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-1.jpg', 'SMARTPHONE', 'ANDROID', 6.72, 5000, 8, 'ACTIVE', 2400, 4.3, 195, DATE_SUB(NOW(), INTERVAL 145 MINUTE), DATE_SUB(NOW(), INTERVAL 145 MINUTE)),
('Realme C65', 'Realme', 'Thiết kế mặt lưng ánh sao lấp lánh, sạc SuperVOOC 45W an toàn, mượt mà chuẩn 4 năm.', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c65-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 6, 'ACTIVE', 4100, 4.4, 340, DATE_SUB(NOW(), INTERVAL 150 MINUTE), DATE_SUB(NOW(), INTERVAL 150 MINUTE)),

-- === 7. HONOR (ID: 31 -> 35) ===
('Honor Magic 6 Pro', 'Honor', 'Camera Falcon siêu chụp khoảnh khắc, màn hình gốm thủy tinh siêu bền chống vỡ.', 'https://fdn2.gsmarena.com/vv/pics/honor/honor-magic6-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.8, 5600, 12, 'ACTIVE', 420, 4.8, 65, DATE_SUB(NOW(), INTERVAL 155 MINUTE), DATE_SUB(NOW(), INTERVAL 155 MINUTE)),
('Honor 200 Pro', 'Honor', 'Chế độ chụp chân dung chuẩn Studio Harcourt Paris, màn hình cong mượt mà 120Hz.', 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5200, 12, 'ACTIVE', 680, 4.6, 78, DATE_SUB(NOW(), INTERVAL 160 MINUTE), DATE_SUB(NOW(), INTERVAL 160 MINUTE)),
('Honor 200', 'Honor', 'Thiết kế thanh lịch siêu mỏng, camera selfie 50MP sắc nét, sạc nhanh siêu tốc 100W.', 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 5200, 8, 'ACTIVE', 950, 4.5, 102, DATE_SUB(NOW(), INTERVAL 165 MINUTE), DATE_SUB(NOW(), INTERVAL 165 MINUTE)),
('Honor X9b', 'Honor', 'Màn hình chống va đập toàn diện 360 độ độc quyền, pin dùng thoải mái 3 ngày.', 'https://fdn2.gsmarena.com/vv/pics/honor/honor-x9b-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5800, 12, 'ACTIVE', 1800, 4.5, 145, DATE_SUB(NOW(), INTERVAL 170 MINUTE), DATE_SUB(NOW(), INTERVAL 170 MINUTE)),
('Honor 90 Lite', 'Honor', 'Thiết kế vuông vắn mỏng nhẹ, camera 100MP siêu nét, bộ nhớ lớn lưu trữ thả ga.', 'https://fdn2.gsmarena.com/vv/pics/honor/honor-90-lite-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 4500, 8, 'ACTIVE', 2100, 4.3, 160, DATE_SUB(NOW(), INTERVAL 175 MINUTE), DATE_SUB(NOW(), INTERVAL 175 MINUTE));

-- =========================================================================
-- II. BIẾN THỂ SẢN PHẨM (PRODUCT VARIANTS) - ID TỪ 1 -> 93
-- =========================================================================
INSERT INTO product_variants (product_id, storage, color, color_hex, price, discount_price, stock_quantity, status) VALUES

-- Apple iPhone 15 Pro Max (Product 1) -> Variant 1 -> 3
(1, 256, 'Titan Tự Nhiên', '#B5B0A8', 29990000, 28490000, 50, 'ACTIVE'),
(1, 256, 'Titan Đen',      '#4B4B4D', 29990000, 28490000, 40, 'ACTIVE'),
(1, 512, 'Titan Tự Nhiên', '#B5B0A8', 35990000, 34200000, 20, 'ACTIVE'),

-- Apple iPhone 15 Pro (Product 2) -> Variant 4 -> 6
(2, 128, 'Titan Tự Nhiên', '#B5B0A8', 24990000, 23500000, 60, 'ACTIVE'),
(2, 128, 'Titan Xanh',     '#4A6568', 24990000, 23500000, 45, 'ACTIVE'),
(2, 256, 'Titan Đen',      '#4B4B4D', 27990000, 26500000, 30, 'ACTIVE'),

-- Apple iPhone 15 (Product 3) -> Variant 7 -> 9
(3, 128, 'Đen',            '#1A1B1C', 22990000, 21500000, 80, 'ACTIVE'),
(3, 128, 'Hồng',           '#F3D5D8', 22990000, 21500000, 70, 'ACTIVE'),
(3, 256, 'Đen',            '#1A1B1C', 25990000, 24500000, 40, 'ACTIVE'),

-- Apple iPhone 14 Plus (Product 4) -> Variant 10 -> 12
(4, 128, 'Đen Đêm',        '#18191B', 19990000, 18490000, 50, 'ACTIVE'),
(4, 128, 'Tím',            '#D3C4DE', 19990000, 18490000, 40, 'ACTIVE'),
(4, 256, 'Trắng Ánh Sao',  '#F9F6EF', 22990000, 21490000, 25, 'ACTIVE'),

-- Apple iPhone 13 (Product 5) -> Variant 13 -> 15
(5, 128, 'Đen Đêm',        '#18191B', 13990000, 12490000, 120, 'ACTIVE'),
(5, 128, 'Trắng Ánh Sao',  '#F9F6EF', 13990000, 12490000, 100, 'ACTIVE'),
(5, 256, 'Hồng',           '#F9D4D4', 16990000, 15490000, 45, 'ACTIVE'),

-- Samsung Galaxy S24 Ultra (Product 6) -> Variant 16 -> 18
(6, 256, 'Titan Đen',      '#1A1B1C', 28990000, 27490000, 80, 'ACTIVE'),
(6, 256, 'Titan Xám',      '#6B6B6E', 28990000, 27490000, 70, 'ACTIVE'),
(6, 512, 'Titan Tím',      '#6A5E7A', 33990000, 32000000, 30, 'ACTIVE'),

-- Samsung Galaxy S24+ (Product 7) -> Variant 19 -> 21
(7, 256, 'Đen Onyx',       '#1A1B1C', 21990000, 20490000, 90, 'ACTIVE'),
(7, 256, 'Xám Marble',     '#9A9A9C', 21990000, 20490000, 75, 'ACTIVE'),
(7, 512, 'Đen Onyx',       '#1A1B1C', 25990000, 24500000, 35, 'ACTIVE'),

-- Samsung Galaxy Z Fold 5 (Product 8) -> Variant 22 -> 24
(8, 256, 'Đen Phantom',    '#1A1B1C', 30990000, 29490000, 25, 'ACTIVE'),
(8, 256, 'Xanh Sương Lam', '#A9C4D0', 30990000, 29490000, 20, 'ACTIVE'),
(8, 512, 'Đen Phantom',    '#1A1B1C', 35990000, 34000000, 12, 'ACTIVE'),

-- Samsung Galaxy Z Flip 5 (Product 9) -> Variant 25, 26
(9, 256, 'Xanh Mint',      '#CFF1E3', 19990000, 18490000, 40, 'ACTIVE'),
(9, 256, 'Xám Tím',        '#D0C4DF', 19990000, 18490000, 35, 'ACTIVE'),

-- Samsung Galaxy A55 (Product 10) -> Variant 27 -> 29
(10, 128, 'Xanh Đen',      '#2A3F5F', 10990000, 9990000, 200, 'ACTIVE'),
(10, 128, 'Xanh Băng',     '#A8D0D8', 10990000, 9990000, 180, 'ACTIVE'),
(10, 256, 'Xanh Đen',      '#2A3F5F', 12990000, 11990000, 90, 'ACTIVE'),

-- Xiaomi 14 Ultra (Product 11) -> Variant 30, 31
(11, 512, 'Đen Titan',     '#1A1B1C', 23990000, 22990000, 40, 'ACTIVE'),
(11, 512, 'Trắng Gốm',     '#F2F2F2', 23990000, 22990000, 30, 'ACTIVE'),

-- Xiaomi 14 (Product 12) -> Variant 32 -> 34
(12, 256, 'Đen',           '#1A1B1C', 17990000, 16990000, 70, 'ACTIVE'),
(12, 256, 'Xanh Lá',       '#2D5A7B', 17990000, 16990000, 55, 'ACTIVE'),
(12, 512, 'Đen',           '#1A1B1C', 20990000, 19990000, 30, 'ACTIVE'),

-- Xiaomi Redmi Note 13 Pro+ (Product 13) -> Variant 35 -> 37
(13, 256, 'Đen Bán Dạ',    '#212224', 10990000, 9990000, 150, 'ACTIVE'),
(13, 256, 'Tím Opal',      '#7A6B8E', 10990000, 9990000, 120, 'ACTIVE'),
(13, 512, 'Đen Bán Dạ',    '#212224', 12990000, 11990000, 70, 'ACTIVE'),

-- Xiaomi Poco X6 Pro (Product 14) -> Variant 38 -> 40
(14, 256, 'Đen Quạ',       '#1A1B1C', 10490000, 9490000, 100, 'ACTIVE'),
(14, 256, 'Xám Xi Măng',   '#8B8B8D', 10490000, 9490000, 80, 'ACTIVE'),
(14, 512, 'Vàng Kim',      '#F4D068', 12490000, 11490000, 50, 'ACTIVE'),

-- Xiaomi Redmi Note 13 (Product 15) -> Variant 41 -> 43
(15, 128, 'Đen',           '#1A1B1C', 4890000, 4490000, 350, 'ACTIVE'),
(15, 128, 'Xanh Lá Mint',  '#B2E3D0', 4890000, 4490000, 280, 'ACTIVE'),
(15, 256, 'Đen',           '#1A1B1C', 5490000, 5090000, 150, 'ACTIVE'),

-- Oppo Find X7 Ultra (Product 16) -> Variant 44, 45
(16, 256, 'Đen Phiến Thạch','#1A1B1C', 23990000, NULL, 30, 'ACTIVE'),
(16, 512, 'Xanh Biển Đông','#2D445D', 27990000, 26500000, 20, 'ACTIVE'),

-- Oppo Reno 11 Pro (Product 17) -> Variant 46, 47
(17, 256, 'Xanh Ngọc',     '#2D7A6A', 12990000, 11990000, 80, 'ACTIVE'),
(17, 256, 'Đen Xám',       '#1A1B1C', 12990000, 11990000, 65, 'ACTIVE'),

-- Oppo Reno 11 (Product 18) -> Variant 48, 49
(18, 256, 'Xám Phượng Hoàng','#5A5A5C', 9990000, 9190000, 110, 'ACTIVE'),
(18, 256, 'Xanh Sóng Biển', '#A2D2E2', 9990000, 9190000, 95, 'ACTIVE'),

-- Oppo Find N3 Flip (Product 19) -> Variant 50, 51
(19, 256, 'Đen Thạch Anh', '#222222', 21990000, 20490000, 20, 'ACTIVE'),
(19, 256, 'Hồng Ngọc',     '#F5C1C8', 21990000, 20490000, 15, 'ACTIVE'),

-- Oppo A79 (Product 20) -> Variant 52, 53
(20, 128, 'Đen Huyền Bí',  '#1C1C1E', 5990000, 5490000, 150, 'ACTIVE'),
(20, 128, 'Tím Lông Vũ',   '#E2D5E7', 5990000, 5490000, 120, 'ACTIVE'),

-- Vivo X100 Pro (Product 21) -> Variant 54, 55
(21, 256, 'Đen Vũ Trụ',    '#1A1B1C', 21990000, 20990000, 35, 'ACTIVE'),
(21, 512, 'Xanh Đại Dương','#2A4A6B', 25990000, 24500000, 20, 'ACTIVE'),

-- Vivo V30 Pro (Product 22) -> Variant 56, 57
(22, 512, 'Xanh Khói',     '#BACDDB', 14990000, 13990000, 60, 'ACTIVE'),
(22, 512, 'Đen Lịch Lãm',  '#252627', 14990000, 13990000, 40, 'ACTIVE'),

-- Vivo V30 (Product 23) -> Variant 58, 59
(23, 256, 'Xanh Sương Mai','#D1E4E6', 12490000, 11490000, 85, 'ACTIVE'),
(23, 256, 'Đen Nhung',     '#1C1D1E', 12490000, 11490000, 70, 'ACTIVE'),

-- Vivo Y100 (Product 24) -> Variant 60, 61
(24, 128, 'Đen Kim Cương', '#232426', 6490000, 5990000, 180, 'ACTIVE'),
(24, 256, 'Xanh Sáng Sân', '#9CE5D7', 6990000, 6490000, 110, 'ACTIVE'),

-- Vivo iQOO Neo 9 (Product 25) -> Variant 62, 63
(25, 256, 'Đỏ Trắng Sport','#D03138', 9490000, 8990000, 45, 'ACTIVE'),
(25, 256, 'Đen Trơn',      '#191A1C', 9490000, 8990000, 40, 'ACTIVE'),

-- Realme GT 6 (Product 26) -> Variant 64, 65
(26, 256, 'Bạc Ánh Kim',   '#C0C0C4', 13990000, 12990000, 60, 'ACTIVE'),
(26, 512, 'Xanh Phong Phong','#2D6B4F', 15990000, 14990000, 35, 'ACTIVE'),

-- Realme GT Neo 6 SE (Product 27) -> Variant 66, 67
(27, 256, 'Bạc Chiến Binh','#B0B3B8', 7990000, 7490000, 90, 'ACTIVE'),
(27, 256, 'Xanh Thảo Nguyên','#7A9A82', 7990000, 7490000, 65, 'ACTIVE'),

-- Realme 12 Pro+ (Product 28) -> Variant 68, 69
(28, 256, 'Xanh Thủy Thủ', '#1E2D4A', 11990000, 10990000, 55, 'ACTIVE'),
(28, 256, 'Be Cát Sa Mạc', '#E6D7C3', 11990000, 10990000, 40, 'ACTIVE'),

-- Realme 12 (Product 29) -> Variant 70, 71
(29, 128, 'Xanh Rừng Sâu', '#2E4A3F', 6490000, 5990000, 130, 'ACTIVE'),
(29, 128, 'Vàng Ánh Dương','#EED6A1', 6490000, 5990000, 90, 'ACTIVE'),

-- Realme C65 (Product 30) -> Variant 72 -> 74
(30, 128, 'Đen Tinh Vân',  '#1F2124', 3990000, 3690000, 250, 'ACTIVE'),
(30, 128, 'Tím Tinh Tú',   '#D4C2DC', 3990000, 3690000, 220, 'ACTIVE'),
(30, 256, 'Đen Tinh Vân',  '#1F2124', 4790000, 4390000, 130, 'ACTIVE'),

-- Honor Magic 6 Pro (Product 31) -> Variant 75 -> 77
(31, 256, 'Đen Nhung',     '#1A1B1D', 24990000, 23490000, 35, 'ACTIVE'),
(31, 512, 'Xanh Phi Thạch','#577B6D', 27990000, 26490000, 25, 'ACTIVE'),
(31, 512, 'Tím Sương Mai', '#C9B0D3', 27990000, 26490000, 15, 'ACTIVE'),

-- Honor 200 Pro (Product 32) -> Variant 78 -> 81
(32, 256, 'Trắng Tuyết',   '#FFFFFF', 15990000, 14990000, 50, 'ACTIVE'),
(32, 256, 'Xanh Ngọc Trai','#A6D8D5', 15990000, 14990000, 45, 'ACTIVE'),
(32, 512, 'Trắng Tuyết',   '#FFFFFF', 17990000, 16490000, 30, 'ACTIVE'),
(32, 512, 'Đen Huyền Bí',  '#1C1C1E', 17990000, 16490000, 25, 'ACTIVE'),

-- Honor 200 (Product 33) -> Variant 82 -> 85
(33, 256, 'Đen',           '#151617', 11990000, 10990000, 75, 'ACTIVE'),
(33, 256, 'Hồng San Hô',   '#F6CBD1', 11990000, 10990000, 60, 'ACTIVE'),
(33, 256, 'Xanh Lục Bảo',  '#2C5D4B', 11990000, 10990000, 50, 'ACTIVE'),
(33, 512, 'Đen',           '#151617', 13500000, 12500000, 30, 'ACTIVE'),

-- Honor X9b (Product 34) -> Variant 86 -> 90
(34, 256, 'Cam Bình Minh', '#E36E39', 8990000, 8190000, 120, 'ACTIVE'),
(34, 256, 'Xanh Lục Bảo',  '#1A4335', 8990000, 8190000, 95, 'ACTIVE'),
(34, 256, 'Đen Ma Trận',   '#1A1A1A', 8990000, 8190000, 110, 'ACTIVE'),
(34, 512, 'Cam Bình Minh', '#E36E39', 9990000, 9190000, 45, 'ACTIVE'),
(34, 512, 'Đen Ma Trận',   '#1A1A1A', 9990000, 9190000, 40, 'ACTIVE'),

-- Honor 90 Lite (Product 35) -> Variant 91 -> 93
(35, 256, 'Xanh Biển Hồ',  '#4E879C', 5990000, 5290000, 140, 'ACTIVE'),
(35, 256, 'Bạc Ánh Sao',   '#DCE3E6', 5990000, 5290000, 110, 'ACTIVE'),
(35, 256, 'Đen Bóng Đêm',  '#1C1D1F', 5990000, 5290000, 130, 'ACTIVE'),

-- Bổ sung cho iPhone 15 Pro Max (Product_id = 1) vào cuối bảng variant
(1, 256, 'Titan Trắng',     '#F2F1ED', 29990000, 28490000, 30, 'ACTIVE'), -- ID tự tăng: 94
(1, 1024, 'Titan Tự Nhiên', '#B5B0A8', 41990000, 39990000, 10, 'ACTIVE'), -- ID tự tăng: 95
(1, 1024, 'Titan Đen',      '#4B4B4D', 41990000, 39990000, 10, 'ACTIVE'), -- ID tự tăng: 96
(1, 1024, 'Titan Trắng',     '#F2F1ED', 41990000, 39990000, 15, 'ACTIVE');  -- ID tự tăng: 97
-- =========================================================================
-- III. HÌNH ẢNH BIẾN THỂ (VARIANT IMAGES) - ĐỒNG BỘ 1 -> 93
-- =========================================================================
INSERT INTO product_variant_images (variant_id, image_url, display_order) VALUES
-- Apple iPhone 15 Pro Max (1 -> 3)
(1, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-nau.jpg', 0),
(2, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-den.jpg', 0),
(3, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-nau.jpg', 0),

-- Apple iPhone 15 Pro (4 -> 6)
(4, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium', 0),
(5, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium', 0),
(6, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-blacktitanium', 0),

-- Apple iPhone 15 (7 -> 9)
(7, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black', 0),
(8, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink', 0),
(9, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black', 0),

-- Apple iPhone 14 Plus (10 -> 12)
(10, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-7inch-midnight', 0),
(11, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-7inch-purple', 0),
(12, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-7inch-starlight', 0),

-- Apple iPhone 13 (13 -> 15)
(13, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-2021-6-1inch-midnight', 0),
(14, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-2021-6-1inch-starlight', 0),
(15, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/h/_/h_ng_4.jpg', 0),

-- Samsung Galaxy S24 Ultra (16 -> 18)
(16, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/gallery/titanium-black/01_Galaxy-S24-Ultra_Titanium-Black_Front.jpg', 0),
(17, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/gallery/titanium-gray/01_Galaxy-S24-Ultra_Titanium-Gray_Front.jpg', 0),
(18, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/gallery/titanium-violet/01_Galaxy-S24-Ultra_Titanium-Violet_Front.jpg', 0),

-- Samsung Galaxy S24+ (19 -> 21)
(19, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/gallery/onyx-black/01_Galaxy-S24-Plus_OnYx-Black_Front.jpg', 0),
(20, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/gallery/marble-gray/01_Galaxy-S24-Plus_Marble-Gray_Front.jpg', 0),
(21, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/gallery/onyx-black/01_Galaxy-S24-Plus_OnYx-Black_Front.jpg', 0),

-- Samsung Galaxy Z Fold 5 (22 -> 24)
(22, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-z-fold/buy-now/galleries/fold5_black_front.jpg', 0),
(23, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-z-fold/buy-now/galleries/fold5_blue_front.jpg', 0),
(24, 'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-z-fold/buy-now/galleries/fold5_black_front.jpg', 0),

-- Samsung Galaxy Z Flip 5 (25 -> 26)
(25, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-flip5-2.jpg', 0),
(26, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-flip5-3.jpg', 0),

-- Samsung Galaxy A55 (27 -> 29)
(27, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-3.jpg', 0),
(28, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-2.jpg', 0),
(29, 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-3.jpg', 0),

-- Xiaomi 14 Ultra (30 -> 31)
(30, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-ultra-3.jpg', 0),
(31, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-ultra-2.jpg', 0),

-- Xiaomi 14 (32 -> 34)
(32, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-3.jpg', 0),
(33, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-2.jpg', 0),
(34, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-3.jpg', 0),

-- Xiaomi Redmi Note 13 Pro+ (35 -> 37)
(35, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-3.jpg', 0),
(36, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-2.jpg', 0),
(37, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-3.jpg', 0),

-- Xiaomi Poco X6 Pro (38 -> 40)
(38, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-3.jpg', 0),
(39, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-2.jpg', 0),
(40, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-1.jpg', 0),

-- Xiaomi Redmi Note 13 (41 -> 43)
(41, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-2.jpg', 0),
(42, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-3.jpg', 0),
(43, 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-2.jpg', 0),

-- Oppo Find X7 Ultra (44 -> 45)
(44, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-3.jpg', 0),
(45, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-2.jpg', 0),

-- Oppo Reno 11 Pro (46 -> 47)
(46, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-5g-2.jpg', 0),
(47, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-5g-3.jpg', 0),

-- Oppo Reno 11 (48 -> 49)
(48, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-5g-2.jpg', 0),
(49, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-5g-3.jpg', 0),

-- Oppo Find N3 Flip (50 -> 51)
(50, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-n3-flip-2.jpg', 0),
(51, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-n3-flip-3.jpg', 0),

-- Oppo A79 (52 -> 53)
(52, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-a79-2.jpg', 0),
(53, 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-a79-3.jpg', 0),

-- Vivo X100 Pro (54 -> 55)
(54, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-3.jpg', 0),
(55, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-2.jpg', 0),

-- Vivo V30 Pro (56 -> 57)
(56, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-pro-2.jpg', 0),
(57, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-pro-3.jpg', 0),

-- Vivo V30 (58 -> 59)
(58, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-2.jpg', 0),
(59, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-v30-3.jpg', 0),

-- Vivo Y100 (60 -> 61)
(60, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-y100-4g-2.jpg', 0),
(61, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-y100-4g-3.jpg', 0),

-- Vivo iQOO Neo 9 (62 -> 63)
(62, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-neo9-2.jpg', 0),
(63, 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-iqoo-neo9-1.jpg', 0),

-- Realme GT 6 (64 -> 65)
(64, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6-2.jpg', 0),
(65, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6-3.jpg', 0),

-- Realme GT Neo 6 SE (66 -> 67)
(66, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-neo6-se-2.jpg', 0),
(67, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-neo6-se-3.jpg', 0),

-- Realme 12 Pro+ (68 -> 69)
(68, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-2.jpg', 0),
(69, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-pro-plus-3.jpg', 0),

-- Realme 12 (70 -> 71)
(70, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-2.jpg', 0),
(71, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-12-3.jpg', 0),

-- Realme C65 (72 -> 74)
(72, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c65-2.jpg', 0),
(73, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c65-3.jpg', 0),
(74, 'https://fdn2.gsmarena.com/vv/pics/realme/realme-c65-2.jpg', 0),

-- Honor Magic 6 Pro (75 -> 77)
(75, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-magic6-pro-2.jpg', 0),
(76, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-magic6-pro-3.jpg', 0),
(77, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-magic6-pro-4.jpg', 0),

-- Honor 200 Pro (78 -> 81)
(78, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-pro-2.jpg', 0),
(79, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-pro-3.jpg', 0),
(80, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-pro-2.jpg', 0),
(81, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-pro-1.jpg', 0),

-- Honor 200 (82 -> 85)
(82, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-2.jpg', 0),
(83, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-3.jpg', 0),
(84, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-4.jpg', 0),
(85, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-200-2.jpg', 0),

-- Honor X9b (86 -> 90)
(86, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-x9b-2.jpg', 0),
(87, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-x9b-3.jpg', 0),
(88, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-x9b-1.jpg', 0),
(89, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-x9b-2.jpg', 0),
(90, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-x9b-1.jpg', 0),

-- Honor 90 Lite (91 -> 93)
(91, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-90-lite-2.jpg', 0),
(92, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-90-lite-3.jpg', 0),
(93, 'https://fdn2.gsmarena.com/vv/pics/honor/honor-90-lite-1.jpg', 0),

-- Bổ sung hình ảnh cho các biến thể mới của iPhone 15 Pro Max
(94, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-trang.jpg', 0),
(95, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-nau.jpg', 0),
(96, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-den.jpg', 0),
(97, 'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone15-pro-max-1tb-titan-trang.jpg', 0);
SET FOREIGN_KEY_CHECKS = 1;