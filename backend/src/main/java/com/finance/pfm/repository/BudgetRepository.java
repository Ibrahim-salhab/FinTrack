package com.finance.pfm.repository;

import com.finance.pfm.entity.Budget;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetRepository extends JpaRepository<Budget, UUID> {

    List<Budget> findAllByUserAndBudgetMonthOrderByCreatedAtDesc(User user, String budgetMonth);

    Optional<Budget> findByIdAndUser(UUID id, User user);

    Optional<Budget> findByUserAndCategoryAndBudgetMonth(User user, Category category, String budgetMonth);

    @Query("SELECT b FROM Budget b WHERE b.user = :user AND b.category IS NULL AND b.budgetMonth = :budgetMonth")
    Optional<Budget> findOverallBudgetByUserAndMonth(@Param("user") User user, @Param("budgetMonth") String budgetMonth);
}
