package com.example.backend.review.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    /**
     * Lưu file vào <uploadDir>/reviews/ và trả về [filePath, publicUrl]
     */
    public String[] storeReviewImage(MultipartFile file) {
        validate(file);

        try {
            Path dir = Paths.get(uploadDir, "reviews").toAbsolutePath();
            Files.createDirectories(dir);

            String ext      = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "." + ext;
            Path   target   = dir.resolve(fileName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String filePath = "reviews/" + fileName;
            String url      = baseUrl + "/uploads/" + filePath;
            return new String[]{filePath, url};

        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file ảnh: " + e.getMessage());
        }
    }

    /**
     * Lưu file vào <uploadDir>/avatars/ và trả về publicUrl
     */
    public String storeAvatarImage(MultipartFile file) {
        validate(file);

        try {
            Path dir = Paths.get(uploadDir, "avatars").toAbsolutePath();
            Files.createDirectories(dir);

            String ext      = getExtension(file.getOriginalFilename());
            String fileName = UUID.randomUUID() + "." + ext;
            Path   target   = dir.resolve(fileName);

            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            String filePath = "avatars/" + fileName;
            return baseUrl + "/uploads/" + filePath;

        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu file ảnh avatar: " + e.getMessage());
        }
    }

    /** Xóa file khỏi disk (khi xóa review hoặc xóa ảnh) */
    public void delete(String filePath) {
        try {
            Path target = Paths.get(uploadDir, filePath).toAbsolutePath();
            Files.deleteIfExists(target);
        } catch (IOException e) {
            // Log nhưng không throw — xóa file thất bại không nên crash request
            System.err.println("Không xóa được file: " + filePath + " — " + e.getMessage());
        }
    }

    /** Xóa avatar cũ khỏi disk nếu là file nội bộ */
    public void deleteOldAvatar(String oldAvatarUrl) {
        if (oldAvatarUrl == null || oldAvatarUrl.isBlank()) return;

        String pattern = "/uploads/avatars/";
        int idx = oldAvatarUrl.indexOf(pattern);
        if (idx != -1) {
            String relativePath = "avatars/" + oldAvatarUrl.substring(idx + pattern.length());
            delete(relativePath);
        }
    }

    // ── helper ───────────────────────────────────────────────────────────────

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new RuntimeException("File ảnh không được để trống!");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new RuntimeException(
                    "Chỉ chấp nhận ảnh JPG, PNG, WEBP, GIF. File hiện tại: " + file.getContentType()
            );
        }
        if (file.getSize() > MAX_SIZE_BYTES) {
            throw new RuntimeException("Ảnh không được vượt quá 5 MB!");
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}