SET FOREIGN_KEY_CHECKS = 0;

-- Xoá dữ liệu cũ
DELETE FROM product_variant_images;
DELETE FROM product_variants;
DELETE FROM products;

-- Đặt lại bộ đếm ID về 1
ALTER TABLE product_variant_images AUTO_INCREMENT = 1;
ALTER TABLE product_variants AUTO_INCREMENT = 1;
ALTER TABLE products AUTO_INCREMENT = 1;

-- ================================================
-- 25 SẢN PHẨM ĐIỆN THOẠI (Thời gian được phân tách cố định)
-- ================================================
INSERT INTO products (name, brand, description, image_url, category, os, screen_size, battery_capacity, ram, status, sold_count, rating, review_count, created_at, updated_at) VALUES
-- 1
('iPhone 15 Pro Max', 'Apple', 'Chip A17 Pro mạnh nhất từ trước đến nay, titan siêu bền, camera 48MP với zoom quang học 5x.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-1.jpg', 'SMARTPHONE', 'IOS', 6.7, 4422, 8, 'ACTIVE', 2800, 4.9, 320, DATE_SUB(NOW(), INTERVAL 5 MINUTE), DATE_SUB(NOW(), INTERVAL 5 MINUTE)),
-- 2
('iPhone 15 Pro', 'Apple', 'Thiết kế titan nhỏ gọn, chip A17 Pro, camera 48MP nâng cấp.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3274, 8, 'ACTIVE', 2100, 4.8, 280, DATE_SUB(NOW(), INTERVAL 10 MINUTE), DATE_SUB(NOW(), INTERVAL 10 MINUTE)),
-- 3
('iPhone 15', 'Apple', 'Dynamic Island, cổng USB-C, camera 48MP sắc nét.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3349, 6, 'ACTIVE', 3000, 4.8, 400, DATE_SUB(NOW(), INTERVAL 15 MINUTE), DATE_SUB(NOW(), INTERVAL 15 MINUTE)),
-- 4
('iPhone 14', 'Apple', 'Chip A15 Bionic, hệ thống camera kép 12MP, màn hình OLED.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3279, 6, 'ACTIVE', 4500, 4.7, 520, DATE_SUB(NOW(), INTERVAL 20 MINUTE), DATE_SUB(NOW(), INTERVAL 20 MINUTE)),
-- 5
('iPhone 13', 'Apple', 'Chip A15 Bionic thế hệ trước, camera chụp đêm Photonic Engine.', 'https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-1.jpg', 'SMARTPHONE', 'IOS', 6.1, 3227, 4, 'ACTIVE', 6000, 4.6, 700, DATE_SUB(NOW(), INTERVAL 25 MINUTE), DATE_SUB(NOW(), INTERVAL 25 MINUTE)),
-- 6
('Samsung Galaxy S24 Ultra', 'Samsung', 'Bút S Pen tích hợp, chip Snapdragon 8 Gen 3, camera 200MP, AI Galaxy nâng cao.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.8, 5000, 12, 'ACTIVE', 1900, 4.8, 240, DATE_SUB(NOW(), INTERVAL 30 MINUTE), DATE_SUB(NOW(), INTERVAL 30 MINUTE)),
-- 7
('Samsung Galaxy S24+', 'Samsung', 'Chip Snapdragon 8 Gen 3, màn hình 6.7 inch QHD+, sạc nhanh 45W.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-plus-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 4900, 12, 'ACTIVE', 1400, 4.7, 185, DATE_SUB(NOW(), INTERVAL 35 MINUTE), DATE_SUB(NOW(), INTERVAL 35 MINUTE)),
-- 8
('Samsung Galaxy S24', 'Samsung', 'Nhỏ gọn mà mạnh mẽ, chip Exynos 2400, màn hình 6.2 inch.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s24-1.jpg', 'SMARTPHONE', 'ANDROID', 6.2, 4000, 8, 'ACTIVE', 2000, 4.7, 310, DATE_SUB(NOW(), INTERVAL 40 MINUTE), DATE_SUB(NOW(), INTERVAL 40 MINUTE)),
-- 9
('Samsung Galaxy Z Fold 5', 'Samsung', 'Màn hình gập 7.6 inch, S Pen, đa nhiệm đỉnh cao trên Android.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-z-fold5-1.jpg', 'SMARTPHONE', 'ANDROID', 7.6, 4400, 12, 'ACTIVE', 650, 4.7, 88, DATE_SUB(NOW(), INTERVAL 45 MINUTE), DATE_SUB(NOW(), INTERVAL 45 MINUTE)),
-- 10
('Samsung Galaxy A55', 'Samsung', 'Thiết kế cao cấp tầm trung, camera 50MP, màn hình AMOLED 120Hz.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.6, 5000, 8, 'ACTIVE', 3500, 4.5, 450, DATE_SUB(NOW(), INTERVAL 50 MINUTE), DATE_SUB(NOW(), INTERVAL 50 MINUTE)),
-- 11
('Xiaomi 14 Ultra', 'Xiaomi', 'Camera Leica siêu đỉnh, màn hình LTPO AMOLED cong 6.73 inch, chip Snapdragon 8 Gen 3.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.73, 5300, 16, 'ACTIVE', 800, 4.7, 120, DATE_SUB(NOW(), INTERVAL 55 MINUTE), DATE_SUB(NOW(), INTERVAL 55 MINUTE)),
-- 12
('Xiaomi 14', 'Xiaomi', 'Camera Leica 3 ống kính, chip Snapdragon 8 Gen 3, màn hình phẳng tinh tế.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.36, 4610, 12, 'ACTIVE', 1200, 4.7, 180, DATE_SUB(NOW(), INTERVAL 60 MINUTE), DATE_SUB(NOW(), INTERVAL 60 MINUTE)),
-- 13
('Xiaomi Redmi Note 13 Pro+', 'Xiaomi', 'Camera 200MP, sạc siêu nhanh 120W, màn hình cong cao cấp.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 12, 'ACTIVE', 2800, 4.6, 380, DATE_SUB(NOW(), INTERVAL 65 MINUTE), DATE_SUB(NOW(), INTERVAL 65 MINUTE)),
-- 14
('Xiaomi Poco X6 Pro', 'Xiaomi', 'Màn 144Hz sắc nét, chip Dimensity 8300-Ultra, sạc 67W.', 'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 5000, 12, 'ACTIVE', 1800, 4.5, 260, DATE_SUB(NOW(), INTERVAL 70 MINUTE), DATE_SUB(NOW(), INTERVAL 70 MINUTE)),
-- 15
('Oppo Find X7 Ultra', 'Oppo', 'Camera periscope kép, chip Snapdragon 8 Gen 3, sạc 100W.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.82, 5000, 16, 'ACTIVE', 450, 4.6, 70, DATE_SUB(NOW(), INTERVAL 75 MINUTE), DATE_SUB(NOW(), INTERVAL 75 MINUTE)),
-- 16
('Oppo Reno 11 Pro', 'Oppo', 'Camera chân dung AI, màn hình cong AMOLED 120Hz, thiết kế siêu mỏng.', 'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-5g-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 4600, 12, 'ACTIVE', 950, 4.4, 110, DATE_SUB(NOW(), INTERVAL 80 MINUTE), DATE_SUB(NOW(), INTERVAL 80 MINUTE)),
-- 17
('Vivo X100 Pro', 'Vivo', 'Camera ZEISS hàng đầu, chip Dimensity 9300, sạc nhanh 120W.', 'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5400, 16, 'ACTIVE', 380, 4.6, 55, DATE_SUB(NOW(), INTERVAL 85 MINUTE), DATE_SUB(NOW(), INTERVAL 85 MINUTE)),
-- 18
('OnePlus 12', 'OnePlus', 'Chip Snapdragon 8 Gen 3, camera Hasselblad, sạc 100W siêu tốc.', 'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-1.jpg', 'SMARTPHONE', 'ANDROID', 6.82, 5400, 16, 'ACTIVE', 700, 4.7, 140, DATE_SUB(NOW(), INTERVAL 90 MINUTE), DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
-- 19
('Google Pixel 8 Pro', 'Google', 'AI Google Tensor G3, camera tiên tiến, 7 năm cập nhật Android.', 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 5050, 12, 'ACTIVE', 980, 4.7, 155, DATE_SUB(NOW(), INTERVAL 95 MINUTE), DATE_SUB(NOW(), INTERVAL 95 MINUTE)),
-- 20
('Google Pixel 8a', 'Google', 'Chip Tensor G3 giá tốt, camera AI chất lượng cao, 7 năm cập nhật.', 'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8a-1.jpg', 'SMARTPHONE', 'ANDROID', 6.1, 4492, 8, 'ACTIVE', 1200, 4.6, 200, DATE_SUB(NOW(), INTERVAL 100 MINUTE), DATE_SUB(NOW(), INTERVAL 100 MINUTE)),
-- 21
('Samsung Galaxy S23 FE', 'Samsung', 'Phiên bản Fan Edition, hiệu năng ổn định, giá phải chăng.', 'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-fe-1.jpg', 'SMARTPHONE', 'ANDROID', 6.4, 4500, 8, 'ACTIVE', 2200, 4.5, 290, DATE_SUB(NOW(), INTERVAL 105 MINUTE), DATE_SUB(NOW(), INTERVAL 105 MINUTE)),
-- 22
('Realme GT 6', 'Realme', 'Màn hình 6.78 inch 120Hz sáng nhất phân khúc, chip Snapdragon 8s Gen 3.', 'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5500, 12, 'ACTIVE', 550, 4.4, 75, DATE_SUB(NOW(), INTERVAL 110 MINUTE), DATE_SUB(NOW(), INTERVAL 110 MINUTE)),
-- 23
('Asus ROG Phone 8 Pro', 'Asus', 'Gaming phone đỉnh cao, chip Snapdragon 8 Gen 3, tản nhiệt siêu khủng.', 'https://fdn2.gsmarena.com/vv/pics/asus/asus-rog-phone-8-pro-1.jpg', 'SMARTPHONE', 'ANDROID', 6.78, 5500, 24, 'ACTIVE', 280, 4.8, 48, DATE_SUB(NOW(), INTERVAL 115 MINUTE), DATE_SUB(NOW(), INTERVAL 115 MINUTE)),
-- 24
('Motorola Edge 50 Ultra', 'Motorola', 'Màn hình pOLED 165Hz, camera 50MP Pantone, sạc không dây 50W.', 'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-ultra-1.jpg', 'SMARTPHONE', 'ANDROID', 6.67, 4500, 12, 'ACTIVE', 320, 4.4, 50, DATE_SUB(NOW(), INTERVAL 120 MINUTE), DATE_SUB(NOW(), INTERVAL 120 MINUTE)),
-- 25
('Nothing Phone 2a', 'Nothing', 'Thiết kế Glyph Interface độc đáo, chip Dimensity 7200 Pro, camera 50MP.', 'https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-2a-1.jpg', 'SMARTPHONE', 'ANDROID', 6.7, 5000, 12, 'ACTIVE', 600, 4.5, 95, DATE_SUB(NOW(), INTERVAL 125 MINUTE), DATE_SUB(NOW(), INTERVAL 125 MINUTE));

-- ================================================
-- VARIANTS (product_id 1-25) - TỔNG CỘNG 71 BIẾN THỂ (ID 1 -> 71)
-- ================================================
INSERT INTO product_variants (product_id, storage, color, color_hex, price, discount_price, stock_quantity, status) VALUES
-- iPhone 15 Pro Max (ID 1) -> Variant ID: 1, 2, 3, 4, 5
(1, 256, 'Titan Tự Nhiên', '#B5B0A8', 29990000, 28490000, 50, 'ACTIVE'),
(1, 256, 'Titan Đen',      '#4B4B4D', 29990000, 28490000, 40, 'ACTIVE'),
(1, 256, 'Titan Trắng',    '#F3EFE8', 29990000, 28490000, 35, 'ACTIVE'),
(1, 512, 'Titan Tự Nhiên', '#B5B0A8', 35990000, 34200000, 20, 'ACTIVE'),
(1, 512, 'Titan Đen',      '#4B4B4D', 35990000, 34200000, 15, 'ACTIVE'),

-- iPhone 15 Pro (ID 2) -> Variant ID: 6, 7, 8
(2, 128, 'Titan Tự Nhiên', '#B5B0A8', 24990000, 23500000, 60, 'ACTIVE'),
(2, 128, 'Titan Đen',      '#4B4B4D', 24990000, 23500000, 45, 'ACTIVE'),
(2, 256, 'Titan Xanh',     '#4A6568', 27990000, 26500000, 30, 'ACTIVE'),

-- iPhone 15 (ID 3) -> Variant ID: 9, 10, 11, 12
(3, 128, 'Đen',    '#1A1B1C', 22990000, 21500000, 80, 'ACTIVE'),
(3, 128, 'Hồng',   '#F3D5D8', 22990000, 21500000, 70, 'ACTIVE'),
(3, 128, 'Vàng',   '#F7E2B4', 22990000, 21500000, 55, 'ACTIVE'),
(3, 256, 'Đen',    '#1A1B1C', 25990000, 24500000, 40, 'ACTIVE'),

-- iPhone 14 (ID 4) -> Variant ID: 13, 14, 15, 16
(4, 128, 'Đen Đêm',    '#18191B', 15990000, 14490000, 200, 'ACTIVE'),
(4, 128, 'Trắng Ánh Sao','#F9F6EF', 15990000, 14490000, 170, 'ACTIVE'),
(4, 128, 'Tím',        '#D3C4DE', 15990000, 14490000, 130, 'ACTIVE'),
(4, 256, 'Đen Đêm',    '#18191B', 18990000, 17500000, 90, 'ACTIVE'),

-- iPhone 13 (ID 5) -> Variant ID: 17, 18, 19, 20
(5, 128, 'Đen Đêm',    '#18191B', 11990000, 10990000, 300, 'ACTIVE'),
(5, 128, 'Trắng Ánh Sao','#F9F6EF', 11990000, 10990000, 250, 'ACTIVE'),
(5, 128, 'Hồng',       '#F9D4D4', 11990000, 10990000, 200, 'ACTIVE'),
(5, 256, 'Đen Đêm',    '#18191B', 13990000, 12990000, 120, 'ACTIVE'),

-- Samsung S24 Ultra (ID 6) -> Variant ID: 21, 22, 23
(6, 256, 'Titan Đen',    '#1A1B1C', 28990000, 27490000, 80, 'ACTIVE'),
(6, 256, 'Titan Xám',    '#6B6B6E', 28990000, 27490000, 70, 'ACTIVE'),
(6, 512, 'Titan Tím',    '#6A5E7A', 33990000, 32000000, 30, 'ACTIVE'),

-- Samsung S24+ (ID 7) -> Variant ID: 24, 25, 26
(7, 256, 'Đen Onyx',     '#1A1B1C', 21990000, 20490000, 90, 'ACTIVE'),
(7, 256, 'Xám Marble',   '#9A9A9C', 21990000, 20490000, 75, 'ACTIVE'),
(7, 512, 'Đen Onyx',     '#1A1B1C', 25990000, 24500000, 35, 'ACTIVE'),

-- Samsung S24 (ID 8) -> Variant ID: 27, 28, 29
(8, 128, 'Đen Onyx',     '#1A1B1C', 16990000, 15990000, 120, 'ACTIVE'),
(8, 128, 'Xám Marble',   '#9A9A9C', 16990000, 15990000, 100, 'ACTIVE'),
(8, 256, 'Tím Cobalt',   '#5B4E7A', 19990000, 18990000, 50, 'ACTIVE'),

-- Samsung Z Fold 5 (ID 9) -> Variant ID: 30, 31, 32
(9, 256, 'Đen Phantom',  '#1A1B1C', 30990000, 29490000, 25, 'ACTIVE'),
(9, 256, 'Xanh Sương Lam','#A9C4D0', 30990000, 29490000, 20, 'ACTIVE'),
(9, 512, 'Đen Phantom',  '#1A1B1C', 35990000, 34000000, 12, 'ACTIVE'),

-- Samsung Galaxy A55 (ID 10) -> Variant ID: 33, 34, 35
(10, 128, 'Xanh Đen',    '#2A3F5F', 10990000, 9990000, 200, 'ACTIVE'),
(10, 128, 'Xanh Băng',   '#A8D0D8', 10990000, 9990000, 180, 'ACTIVE'),
(10, 256, 'Xanh Đen',    '#2A3F5F', 12990000, 11990000, 90, 'ACTIVE'),

-- Xiaomi 14 Ultra (ID 11) -> Variant ID: 36, 37
(11, 512, 'Đen Titan',   '#1A1B1C', 23990000, 22990000, 40, 'ACTIVE'),
(11, 512, 'Trắng',       '#F2F2F2', 23990000, 22990000, 30, 'ACTIVE'),

-- Xiaomi 14 (ID 12) -> Variant ID: 38, 39, 40
(12, 256, 'Đen',         '#1A1B1C', 17990000, 16990000, 70, 'ACTIVE'),
(12, 256, 'Xanh Lá',     '#2D5A7B', 17990000, 16990000, 55, 'ACTIVE'),
(12, 512, 'Đen',         '#1A1B1C', 20990000, 19990000, 30, 'ACTIVE'),

-- Xiaomi Redmi Note 13 Pro+ (ID 13) -> Variant ID: 41, 42, 43
(13, 256, 'Đen Bán Dạ',  '#212224', 10990000, 9990000, 150, 'ACTIVE'),
(13, 256, 'Tím Opal',    '#7A6B8E', 10990000, 9990000, 120, 'ACTIVE'),
(13, 512, 'Đen Bán Dạ',  '#212224', 12990000, 11990000, 70, 'ACTIVE'),

-- Xiaomi Poco X6 Pro (ID 14) -> Variant ID: 44, 45, 46
(14, 256, 'Đen',         '#1A1B1C', 10490000, 9490000, 100, 'ACTIVE'),
(14, 256, 'Xám',         '#8B8B8D', 10490000, 9490000, 80, 'ACTIVE'),
(14, 512, 'Đen',         '#1A1B1C', 12490000, 11490000, 50, 'ACTIVE'),

-- Oppo Find X7 Ultra (ID 15) -> Variant ID: 47, 48
(15, 256, 'Đen Phiến Thạch','#1A1B1C', 23990000, NULL, 30, 'ACTIVE'),
(15, 512, 'Xanh Biển Đông','#2D445D', 27990000, 26500000, 20, 'ACTIVE'),

-- Oppo Reno 11 Pro (ID 16) -> Variant ID: 49, 50
(16, 256, 'Xanh Ngọc',   '#2D7A6A', 12990000, 11990000, 80, 'ACTIVE'),
(16, 256, 'Đen Xám',     '#1A1B1C', 12990000, 11990000, 65, 'ACTIVE'),

-- Vivo X100 Pro (ID 17) -> Variant ID: 51, 52
(17, 256, 'Đen Vũ Trụ',  '#1A1B1C', 21990000, 20990000, 35, 'ACTIVE'),
(17, 512, 'Xanh Dương',  '#2A4A6B', 25990000, 24500000, 20, 'ACTIVE'),

-- OnePlus 12 (ID 18) -> Variant ID: 53, 54
(18, 256, 'Đen Tuyển',   '#1A1B1C', 19990000, 18990000, 60, 'ACTIVE'),
(18, 256, 'Xanh Ngọc Bích','#2C6648', 19990000, 18990000, 45, 'ACTIVE'),

-- Google Pixel 8 Pro (ID 19) -> Variant ID: 55, 56, 57
(19, 128, 'Đen Đá Obsidian','#1F2020', 20990000, 19990000, 50, 'ACTIVE'),
(19, 256, 'Trắng Gốm',   '#F2F1E8', 23990000, NULL,      30, 'ACTIVE'),
(19, 256, 'Xanh Vịnh Biển','#7BA8B8', 23990000, NULL,      25, 'ACTIVE'),

-- Google Pixel 8a (ID 20) -> Variant ID: 58, 59, 60
(20, 128, 'Đen Đá Obsidian','#1F2020', 13990000, 12990000, 80, 'ACTIVE'),
(20, 128, 'Trắng Gốm',   '#F2F1E8', 13990000, 12990000, 65, 'ACTIVE'),
(20, 256, 'Xanh Vịnh Biển','#7BA8B8', 15990000, 14990000, 40, 'ACTIVE'),

-- Samsung Galaxy S23 FE (ID 21) -> Variant ID: 61, 62, 63
(21, 128, 'Xám Than',    '#4A4A4C', 11990000, 10990000, 130, 'ACTIVE'),
(21, 128, 'Xanh Bạc Hà', '#7DC4A8', 11990000, 10990000, 110, 'ACTIVE'),
(21, 256, 'Xám Than',    '#4A4A4C', 13990000, 12990000, 60, 'ACTIVE'),

-- Realme GT 6 (ID 22) -> Variant ID: 64, 65
(22, 256, 'Bạc Ánh Kim', '#C0C0C4', 13990000, 12990000, 60, 'ACTIVE'),
(22, 512, 'Xanh Phong Phong','#2D6B4F', 15990000, 14990000, 35, 'ACTIVE'),

-- Asus ROG Phone 8 Pro (ID 23) -> Variant ID: 66, 67
(23, 512,  'Đen Phantom', '#1A1B1C', 32990000, 31990000, 20, 'ACTIVE'),
(23, 1024, 'Trắng Bão Tuyết','#F0F0F0', 38990000, 37990000, 10, 'ACTIVE'),

-- Motorola Edge 50 Ultra (ID 24) -> Variant ID: 68, 69
(24, 512, 'Cam Đào',     '#E8B090', 16990000, 15990000, 40, 'ACTIVE'),
(24, 512, 'Vân Gỗ Bắc Âu','#8A6A4A', 16990000, 15990000, 30, 'ACTIVE'),

-- Nothing Phone 2a (ID 25) -> Variant ID: 70, 71
(25, 256, 'Đen',         '#1A1B1C', 8990000, 7990000, 90, 'ACTIVE'),
(25, 256, 'Trắng',       '#F2F2F2', 8990000, 7990000, 70, 'ACTIVE');

-- ================================================
-- VARIANT IMAGES (Đã sửa đồng bộ chuẩn xác ID từ 1 -> 71)
-- ================================================
INSERT INTO product_variant_images (variant_id, image_url, display_order) VALUES
-- iPhone 15 Pro Max (ID 1 -> 5)
(1, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(2, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(3, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-whitetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(4, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(5, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),

-- iPhone 15 Pro (ID 6 -> 8)
(6, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(7, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-blacktitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(8, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-bluetitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),

-- iPhone 15 (ID 9 -> 12)
(9, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(10,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-pink?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(11,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-yellow?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),
(12,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-finish-select-202309-6-1inch-black?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1693009278', 0),

-- iPhone 14 (ID 13 -> 16)
(13,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-midnight?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660803972', 0),
(14,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-starlight?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660803972', 0),
(15,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-purple?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660803972', 0),
(16,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-14-finish-select-202209-6-1inch-midnight?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1660803972', 0),

-- iPhone 13 (ID 17 -> 20)
(17,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-2021-6-1inch-midnight?wid=5120&hei=2880&fmt=p-jpg&qlt=80', 0),
(18,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-2021-6-1inch-starlight?wid=5120&hei=2880&fmt=p-jpg&qlt=80', 0),
(19,'https://cdn2.cellphones.com.vn/358x/media/catalog/product/h/_/h_ng_4.jpg', 0),
(20,'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-13-finish-select-2021-6-1inch-midnight?wid=5120&hei=2880&fmt=p-jpg&qlt=80', 0),

-- Samsung S24 Ultra (ID 21 -> 23)
(21,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/titanium-black/01_Galaxy-S24-Ultra_Titanium-Black_Front.jpg', 0),
(22,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/titanium-gray/01_Galaxy-S24-Ultra_Titanium-Gray_Front.jpg', 0),
(23,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/titanium-violet/01_Galaxy-S24-Ultra_Titanium-Violet_Front.jpg', 0),

-- Samsung S24+ (ID 24 -> 26)
(24,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/onyx-black/01_Galaxy-S24-Plus_OnYx-Black_Front.jpg', 0),
(25,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/marble-gray/01_Galaxy-S24-Plus_Marble-Gray_Front.jpg', 0),
(26,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/onyx-black/01_Galaxy-S24-Plus_OnYx-Black_Front.jpg', 0),

-- Samsung S24 (ID 27 -> 29)
(27,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/onyx-black/01_Galaxy-S24_Onyx-Black_Front.jpg', 0),
(28,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/marble-gray/01_Galaxy-S24_Marble-Gray_Front.jpg', 0),
(29,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-s/buy-now/03262024/gallery/cobalt-violet/01_Galaxy-S24_Cobalt-Violet_Front.jpg', 0),

-- Samsung Z Fold 5 (ID 30 -> 32)
(30,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-z-fold/buy-now/galleries/fold5_black_front.jpg', 0),
(31,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-z-fold/buy-now/galleries/fold5_blue_front.jpg', 0),
(32,'https://image-us.samsung.com/SamsungUS/home/mobile/galaxy-z-fold/buy-now/galleries/fold5_black_front.jpg', 0),

-- Samsung Galaxy A55 (ID 33 -> 35)
(33,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-3.jpg', 0),
(34,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-2.jpg', 0),
(35,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-a55-5g-3.jpg', 0),

-- Xiaomi 14 Ultra (ID 36 -> 37)
(36,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-ultra-3.jpg', 0),
(37,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-ultra-2.jpg', 0),

-- Xiaomi 14 (ID 38 -> 40)
(38,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-3.jpg', 0),
(39,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-2.jpg', 0),
(40,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-14-5g-3.jpg', 0),

-- Xiaomi Redmi Note 13 Pro+ (ID 41 -> 43)
(41,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-3.jpg', 0),
(42,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-2.jpg', 0),
(43,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-redmi-note-13-pro-plus-3.jpg', 0),

-- Xiaomi Poco X6 Pro (ID 44 -> 46)
(44,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-3.jpg', 0),
(45,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-2.jpg', 0),
(46,'https://fdn2.gsmarena.com/vv/pics/xiaomi/xiaomi-poco-x6-pro-3.jpg', 0),

-- Oppo Find X7 Ultra (ID 47 -> 48)
(47,'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-3.jpg', 0),
(48,'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-find-x7-ultra-2.jpg', 0),

-- Oppo Reno 11 Pro (ID 49 -> 50)
(49,'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-5g-2.jpg', 0),
(50,'https://fdn2.gsmarena.com/vv/pics/oppo/oppo-reno11-pro-5g-3.jpg', 0),

-- Vivo X100 Pro (ID 51 -> 52)
(51,'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-3.jpg', 0),
(52,'https://fdn2.gsmarena.com/vv/pics/vivo/vivo-x100-pro-2.jpg', 0),

-- OnePlus 12 (ID 53 -> 54)
(53,'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-3.jpg', 0),
(54,'https://fdn2.gsmarena.com/vv/pics/oneplus/oneplus-12-2.jpg', 0),

-- Google Pixel 8 Pro (ID 55 -> 57)
(55,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-3.jpg', 0),
(56,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-2.jpg', 0),
(57,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8-pro-4.jpg', 0),

-- Google Pixel 8a (ID 58 -> 60)
(58,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8a-3.jpg', 0),
(59,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8a-2.jpg', 0),
(60,'https://fdn2.gsmarena.com/vv/pics/google/google-pixel-8a-4.jpg', 0),

-- Samsung Galaxy S23 FE (ID 61 -> 63)
(61,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-fe-3.jpg', 0),
(62,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-fe-2.jpg', 0),
(63,'https://fdn2.gsmarena.com/vv/pics/samsung/samsung-galaxy-s23-fe-3.jpg', 0),

-- Realme GT 6 (ID 64 -> 65)
(64,'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6-2.jpg', 0),
(65,'https://fdn2.gsmarena.com/vv/pics/realme/realme-gt-6-3.jpg', 0),

-- Asus ROG Phone 8 Pro (ID 66 -> 67)
(66,'https://fdn2.gsmarena.com/vv/pics/asus/asus-rog-phone-8-pro-3.jpg', 0),
(67,'https://fdn2.gsmarena.com/vv/pics/asus/asus-rog-phone-8-pro-2.jpg', 0),

-- Motorola Edge 50 Ultra (ID 68 -> 69)
(68,'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-ultra-2.jpg', 0),
(69,'https://fdn2.gsmarena.com/vv/pics/motorola/motorola-edge-50-ultra-3.jpg', 0),

-- Nothing Phone 2a (ID 70 -> 71)
(70,'https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-2a-3.jpg', 0),
(71,'https://fdn2.gsmarena.com/vv/pics/nothing/nothing-phone-2a-2.jpg', 0);

SET FOREIGN_KEY_CHECKS = 1;