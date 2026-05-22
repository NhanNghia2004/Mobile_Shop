package com.example.backend.favorite.repository;

import com.example.backend.favorite.entity.Favorite;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FavoriteRepository extends JpaRepository<Favorite, Long> {

    @EntityGraph(attributePaths = {"product"})
    Page<Favorite> findByUserId(Long userId, Pageable pageable);

    Optional<Favorite> findByUserIdAndProductId(Long userId, Long productId);

    boolean existsByUserIdAndProductId(Long userId, Long productId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteByUserIdAndProductId(Long userId, Long productId);
}
