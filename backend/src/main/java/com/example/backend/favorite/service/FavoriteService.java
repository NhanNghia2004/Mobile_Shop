package com.example.backend.favorite.service;

import com.example.backend.exception.ResourceNotFoundException;
import com.example.backend.favorite.dto.FavoriteResponse;
import com.example.backend.favorite.entity.Favorite;
import com.example.backend.favorite.repository.FavoriteRepository;
import com.example.backend.product.dto.PageResponse;
import com.example.backend.product.entity.Product;
import com.example.backend.product.repository.ProductRepository;
import com.example.backend.user.entity.User;
import com.example.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FavoriteService {

    private final FavoriteRepository favoriteRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PageResponse<FavoriteResponse> getFavorites(String username, int page, int size) {
        User user = findUser(username);
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Favorite> favorites = favoriteRepository.findByUserId(user.getId(), pageable);
        
        return PageResponse.from(favorites, FavoriteResponse::from);
    }

    @Transactional
    public void addFavorite(String username, Long productId) {
        User user = findUser(username);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sản phẩm!"));

        if (favoriteRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new RuntimeException("Sản phẩm đã có trong danh sách yêu thích!");
        }

        Favorite favorite = new Favorite();
        favorite.setUser(user);
        favorite.setProduct(product);
        favoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(String username, Long productId) {
        User user = findUser(username);
        favoriteRepository.deleteByUserIdAndProductId(user.getId(), productId);
    }

    @Transactional(readOnly = true)
    public java.util.List<Long> getFavoriteProductIds(String username) {
        User user = findUser(username);
        return favoriteRepository.findProductIdsByUserId(user.getId());
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Người dùng không tồn tại!"));
    }
}
