package com.finance.pfm.dto.budget;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;
import java.util.UUID;

public class BudgetRequest {

    private UUID categoryId; // Optional; null represents overall monthly budget

    @NotNull(message = "Budget limit amount is required")
    @DecimalMin(value = "0.01", message = "Budget amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Budget month is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Budget month must be in YYYY-MM format")
    private String budgetMonth;

    public BudgetRequest() {
    }

    public BudgetRequest(UUID categoryId, BigDecimal amount, String budgetMonth) {
        this.categoryId = categoryId;
        this.amount = amount;
        this.budgetMonth = budgetMonth;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getBudgetMonth() {
        return budgetMonth;
    }

    public void setBudgetMonth(String budgetMonth) {
        this.budgetMonth = budgetMonth;
    }
}
