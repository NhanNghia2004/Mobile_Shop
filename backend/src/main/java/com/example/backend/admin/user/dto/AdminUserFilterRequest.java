package com.example.backend.admin.user.dto;

import lombok.Data;

@Data
public class AdminUserFilterRequest {

    /** Từ khóa tìm kiếm: username / email / phone */
    private String keyword;

    /** Lọc theo role: USER | ADMIN (null = tất cả) */
    private String role;

    /** Lọc theo trạng thái khóa: true | false (null = tất cả) */
    private Boolean locked;

    /** Sắp xếp: newest (default) | oldest | username_asc | username_desc */
    private String sortBy = "newest";

    private int page = 0;
    private int size = 10;
}