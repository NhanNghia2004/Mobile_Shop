package com.example.backend.review.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "review_images")
@Data
@NoArgsConstructor
public class ReviewImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", nullable = false)
    private Review review;

    // Đường dẫn file lưu trên server, VD: /uploads/reviews/uuid.jpg
    @Column(nullable = false)
    private String filePath;

    // URL trả về cho client, VD: http://localhost:8080/uploads/reviews/uuid.jpg
    @Column(nullable = false)
    private String url;

    // Thứ tự hiển thị
    private Integer sortOrder = 0;

    public ReviewImage(Review review, String filePath, String url, int sortOrder) {
        this.review = review;
        this.filePath = filePath;
        this.url = url;
        this.sortOrder = sortOrder;
    }
}