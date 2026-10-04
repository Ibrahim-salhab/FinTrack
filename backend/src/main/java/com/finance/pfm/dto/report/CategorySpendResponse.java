package com.finance.pfm.dto.report;

import java.math.BigDecimal;
import java.util.UUID;

public class CategorySpendResponse {

    private UUID categoryId;
    private String categoryName;
    private String icon;
    private BigDecimal amount;
    private double percentage;

    public CategorySpendResponse() {
    }

    public CategorySpendResponse(UUID categoryId, String categoryName, String icon, BigDecimal amount, double percentage) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.icon = icon;
        this.amount = amount;
        this.percentage = percentage;
    }

    public UUID getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(UUID categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public double getPercentage() {
        return percentage;
    }

    public void setPercentage(double percentage) {
        this.percentage = percentage;
    }
}
