package com.finance.pfm.service;

import com.finance.pfm.dto.budget.BudgetRequest;
import com.finance.pfm.dto.budget.BudgetResponse;
import com.finance.pfm.dto.category.CategoryResponse;
import com.finance.pfm.entity.Budget;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.exception.BadRequestException;
import com.finance.pfm.exception.ResourceNotFoundException;
import com.finance.pfm.repository.BudgetRepository;
import com.finance.pfm.repository.CategoryRepository;
import com.finance.pfm.repository.TransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(
            BudgetRepository budgetRepository,
            CategoryRepository categoryRepository,
            TransactionRepository transactionRepository
    ) {
        this.budgetRepository = budgetRepository;
        this.categoryRepository = categoryRepository;
        this.transactionRepository = transactionRepository;
    }

    @Transactional
    public BudgetResponse setBudget(User user, BudgetRequest request) {
        Category category = null;
        if (request.getCategoryId() != null) {
            category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
                throw new BadRequestException("Selected category is not accessible by this user");
            }
        }

        Optional<Budget> existingBudget;
        if (category != null) {
            existingBudget = budgetRepository.findByUserAndCategoryAndBudgetMonth(user, category, request.getBudgetMonth());
        } else {
            existingBudget = budgetRepository.findOverallBudgetByUserAndMonth(user, request.getBudgetMonth());
        }

        Budget budget;
        if (existingBudget.isPresent()) {
            budget = existingBudget.get();
            budget.setAmount(request.getAmount());
        } else {
            budget = new Budget(user, category, request.getAmount(), request.getBudgetMonth());
        }

        Budget saved = budgetRepository.save(budget);
        return mapToResponse(saved, user);
    }

    @Transactional(readOnly = true)
    public List<BudgetResponse> getBudgets(User user, String budgetMonth) {
        List<Budget> budgets = budgetRepository.findAllByUserAndBudgetMonthOrderByCreatedAtDesc(user, budgetMonth);
        List<BudgetResponse> responses = new ArrayList<>();

        for (Budget budget : budgets) {
            responses.add(mapToResponse(budget, user));
        }

        return responses;
    }

    @Transactional
    public void deleteBudget(User user, UUID id) {
        Budget budget = budgetRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Budget not found"));

        budgetRepository.delete(budget);
    }

    private BudgetResponse mapToResponse(Budget budget, User user) {
        YearMonth ym = YearMonth.parse(budget.getBudgetMonth());
        LocalDate startDate = ym.atDay(1);
        LocalDate endDate = ym.atEndOfMonth();

        BigDecimal spent;
        if (budget.getCategory() != null) {
            spent = transactionRepository.sumAmountByUserAndCategoryAndDateRange(
                    user, budget.getCategory(), startDate, endDate
            );
        } else {
            spent = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                    user, TransactionType.EXPENSE, startDate, endDate
            );
        }

        if (spent == null) {
            spent = BigDecimal.ZERO;
        }

        BigDecimal remaining = budget.getAmount().subtract(spent);
        double percentage = 0.0;
        if (budget.getAmount().compareTo(BigDecimal.ZERO) > 0) {
            percentage = spent.multiply(BigDecimal.valueOf(100))
                    .divide(budget.getAmount(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        boolean isExceeded = spent.compareTo(budget.getAmount()) > 0;

        return new BudgetResponse(
                budget.getId(),
                budget.getCategory() != null ? CategoryResponse.fromEntity(budget.getCategory()) : null,
                budget.getAmount(),
                spent,
                remaining,
                percentage,
                isExceeded,
                budget.getBudgetMonth()
        );
    }
}
