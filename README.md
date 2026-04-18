# Hướng dẫn cài đặt dự án Web Bán Điện Thoại (Mobile Shop)
Dự án này bao gồm hai phần chính: Backend sử dụng Java Spring Boot và Frontend sử dụng React Vite (TypeScript).

## Các yêu cầu hệ thống
Java: 17 trở lên

Node.js: v18 hoặc mới nhất (v20, v22)

MySQL: 8.0 trở lên

Maven: (Đã tích hợp sẵn mvnw)

## Hướng dẫn cài đặt Backend
1. Di chuyển vào thư mục backend:
   Mở terminal và di chuyển vào thư mục backend.
  cd backend
2. Cấu hình cơ sở dữ liệu:
   Tạo một cơ sở dữ liệu trong MySQL với tên phone_store.
 
3. Cấu hình file môi trường:
    Tạo file .env trong thư mục backend với các thông tin sau:
     - DB_URL=jdbc:mysql://localhost:3306/phone_store
     - DB_USERNAME=root
     - DB_PASSWORD=mật_khẩu_mysql_của_bạn
     - AI_API_KEY=mã_key_ai_nếu_có

4. Chạy ứng dụng Backend:

  Trong IntelliJ: Nhấn chuột phải vào BackendApplication.java và chọn Run.
  
  Hoặc sử dụng lệnh terminal:
  ./mvnw spring-boot:run
  
  Backend sẽ mặc định chạy tại địa chỉ: http://localhost:8080.

## Hướng dẫn cài đặt Frontend
  1. Di chuyển vào thư mục frontend:
  Mở một terminal mới và di chuyển vào thư mục frontend: cd frontend
  2. Cài đặt các thư viện phụ thuộc:
  Chạy lệnh:  npm install
  3. Cấu hình file môi trường:
  Tạo file .env trong thư mục frontend với thông tin: 
  - VITE_API_URL=http://localhost:8080
  
  4. Chạy ứng dụng Frontend:
  Chạy lệnh: npm run dev
  Frontend sẽ mặc định chạy tại địa chỉ: http://localhost:5173.

## Các lưu ý quan trọng
-Thứ tự chạy: Hãy chắc chắn rằng MySQL và Backend đã được khởi chạy trước khi sử dụng Frontend.

-Bảo mật: Tuyệt đối không push file .env lên GitHub (đã được cấu hình trong .gitignore).

-Cấu hình IntelliJ: Nếu chạy bằng nút Run của IntelliJ mà gặp lỗi kết nối Database, hãy vào Edit Configurations -> Environment variables để kiểm tra lại các biến môi trường.
