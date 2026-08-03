-- Script xoá các bảng không sử dụng: provinces, wards, districts
-- Các bảng này không có tham chiếu nào trong code backend/frontend
-- Frontend gọi trực tiếp API GHN để lấy dữ liệu tỉnh/huyện/xã

SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS wards;
DROP TABLE IF EXISTS districts;
DROP TABLE IF EXISTS provinces;

SET FOREIGN_KEY_CHECKS = 1;

-- Xác nhận đã xoá
SELECT 'Done! Đã xoá các bảng provinces, districts, wards khỏi database.' AS result;
