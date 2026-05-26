package com.example.backend.user.repository;

import com.example.backend.user.entity.Role;
import com.example.backend.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    // ── Admin: tìm kiếm + lọc + phân trang

    @Query("""
        SELECT u FROM User u
        WHERE (
            :keyword IS NULL
            OR LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.email)    LIKE LOWER(CONCAT('%', :keyword, '%'))
            OR LOWER(u.phone)    LIKE LOWER(CONCAT('%', :keyword, '%'))
        )
        AND (:role   IS NULL OR u.role   = :role)
        AND (:locked IS NULL OR u.locked = :locked)
    """)
    Page<User> searchUsers(
            @Param("keyword") String keyword,
            @Param("role")    Role role,
            @Param("locked")  Boolean locked,
            Pageable pageable
    );

    // ── Thống kê nhanh 

    long countByRole(Role role);

    long countByLocked(boolean locked);
}