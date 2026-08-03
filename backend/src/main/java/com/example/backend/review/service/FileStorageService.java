package com.example.backend.review.service;

import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class FileStorageService {

    private final Cloudinary cloudinary;

    private static final List<String> ALLOWED_TYPES = List.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    /**
     * Upload ảnh lên Cloudinary folder reviews và trả về [publicId, secureUrl]
     */
    public String[] storeReviewImage(MultipartFile file) {
        validate(file);
        try {
            Map<?, ?> params = Map.of(
                    "folder", "mobile_shop/reviews",
                    "resource_type", "image"
            );
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            String publicId = (String) uploadResult.get("public_id");
            String url = (String) uploadResult.get("secure_url");
            return new String[]{publicId, url};
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh lên Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Upload avatar lên Cloudinary folder avatars và trả về secureUrl
     */
    public String storeAvatarImage(MultipartFile file) {
        validate(file);
        try {
            Map<?, ?> params = Map.of(
                    "folder", "mobile_shop/avatars",
                    "resource_type", "image"
            );
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload avatar lên Cloudinary: " + e.getMessage());
        }
    }

    /**
     * Upload ảnh sản phẩm lên Cloudinary folder products và trả về secureUrl
     */
    public String storeProductImage(MultipartFile file) {
        validate(file);
        try {
            Map<?, ?> params = Map.of(
                    "folder", "mobile_shop/products",
                    "resource_type", "image"
            );
            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Không thể upload ảnh sản phẩm lên Cloudinary: " + e.getMessage());
        }
    }

    /** Xóa file trên Cloudinary */
    public void delete(String publicId) {
        if (publicId == null || publicId.isBlank()) return;
        try {
            cloudinary.uploader().destroy(publicId, Map.of());
        } catch (IOException e) {
            System.err.println("Không xóa được file trên Cloudinary: " + publicId + " — " + e.getMessage());
        }
    }

    /** Xóa file trên Cloudinary bằng URL */
    public void deleteByUrl(String url) {
        if (url == null || url.isBlank()) return;
        String publicId = extractPublicIdFromUrl(url);
        if (publicId != null) {
            delete(publicId);
        }
    }

    /** Xóa avatar cũ khỏi Cloudinary */
    public void deleteOldAvatar(String oldAvatarUrl) {
        deleteByUrl(oldAvatarUrl);
    }

    /** Helper để extract public_id từ Cloudinary URL */
    private String extractPublicIdFromUrl(String url) {
        if (url == null || !url.contains("res.cloudinary.com")) return null;
        try {
            int uploadIndex = url.indexOf("/image/upload/");
            if (uploadIndex == -1) return null;

            String path = url.substring(uploadIndex + "/image/upload/".length());

            if (path.contains("/")) {
                String firstPart = path.substring(0, path.indexOf('/'));
                if (firstPart.matches("v\\d+")) {
                    path = path.substring(path.indexOf('/') + 1);
                }
            }

            int dotIndex = path.lastIndexOf('.');
            if (dotIndex != -1) {
                path = path.substring(0, dotIndex);
            }

            return path;
        } catch (Exception e) {
            return null;
        }
    }

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
}