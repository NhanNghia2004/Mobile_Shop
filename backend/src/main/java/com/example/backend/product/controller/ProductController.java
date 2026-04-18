package com.example.backend.product.controller;

import com.example.backend.product.entity.Product;
import com.example.backend.product.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin("*") // Để React có thể gọi được API này
public class ProductController {


    @Autowired
    private ProductRepository productRepository;

    @GetMapping
    public List<Product> getAllProducts() {
        // Lấy toàn bộ danh sách điện thoại từ MySQL
        return productRepository.findAll();
    }
}