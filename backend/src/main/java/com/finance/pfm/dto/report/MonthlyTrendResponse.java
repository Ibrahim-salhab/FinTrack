package com.finance.pfm.dto.report;

import java.math.BigDecimal;

public class MonthlyTrendResponse {

    private String month; // 'YYYY-MM'
    private BigDecimal income;
    private BigDecimal expense;
    private BigDecimal savings;

    public MonthlyTrendResponse() {
    }

    public MonthlyTrendResponse(String month, BigDecimal income, BigDecimal expense, BigDecimal savings) {
        this.month = month;
        this.income = income;
        this.expense = expense;
        this.savings = savings;
    }

    public String getMonth() {
        return month;
    }

    public void setMonth(String month) {
        this.month = month;
    }

    public BigDecimal getIncome() {
        return income;
    }

    public void setIncome(BigDecimal income) {
        this.income = income;
    }

    public BigDecimal getExpense() {
        return expense;
    }

    public void setExpense(BigDecimal expense) {
        this.expense = expense;
    }

    public BigDecimal getSavings() {
        return savings;
    }

    public void setSavings(BigDecimal savings) {
        this.savings = savings;
    }
}
