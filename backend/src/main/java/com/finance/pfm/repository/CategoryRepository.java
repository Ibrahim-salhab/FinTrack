package com.finance.pfm.repository;

import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    @Query("SELECT c FROM Category c WHERE c.user IS NULL OR c.user = :user ORDER BY c.name ASC")
    List<Category> findAllAvailableForUser(@Param("user") User user);

    @Query("SELECT c FROM Category c WHERE (c.user IS NULL OR c.user = :user) AND c.type = :type ORDER BY c.name ASC")
    List<Category> findAllAvailableForUserAndType(@Param("user") User user, @Param("type") TransactionType type);

    Optional<Category> findByIdAndUser(UUID id, User user);

    boolean existsByNameIgnoreCaseAndUser(String name, User user);
}
