package com.finance.pfm.dto.budget;

import com.finance.pfm.dto.category.CategoryResponse;

import java.math.BigDecimal;
import java.util.UUID;

public class BudgetResponse {

    private UUID id;
    private CategoryResponse category; // null if overall budget
    private BigDecimal amount;
    private BigDecimal spentAmount;
    private BigDecimal remainingAmount;
    private double percentageUsed;
    private boolean isExceeded;
    private String budgetMonth;

    public BudgetResponse() {
    }

    public BudgetResponse(UUID id, CategoryResponse category, BigDecimal amount, BigDecimal spentAmount, BigDecimal remainingAmount, double percentageUsed, boolean isExceeded, String budgetMonth) {
        this.id = id;
        this.category = category;
        this.amount = amount;
        this.spentAmount = spentAmount;
        this.remainingAmount = remainingAmount;
        this.percentageUsed = percentageUsed;
        this.isExceeded = isExceeded;
        this.budgetMonth = budgetMonth;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public CategoryResponse getCategory() {
        return category;
    }

    public void setCategory(CategoryResponse category) {
        this.category = category;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public BigDecimal getSpentAmount() {
        return spentAmount;
    }

    public void setSpentAmount(BigDecimal spentAmount) {
        this.spentAmount = spentAmount;
    }

    public BigDecimal getRemainingAmount() {
        return remainingAmount;
    }

    public void setRemainingAmount(BigDecimal remainingAmount) {
        this.remainingAmount = remainingAmount;
    }

    public double getPercentageUsed() {
        return percentageUsed;
    }

    public void setPercentageUsed(double percentageUsed) {
        this.percentageUsed = percentageUsed;
    }

    public boolean isExceeded() {
        return isExceeded;
    }

    public void setExceeded(boolean exceeded) {
        isExceeded = exceeded;
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }
}
