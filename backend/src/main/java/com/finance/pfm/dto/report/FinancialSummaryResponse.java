package com.finance.pfm.dto.report;

import com.finance.pfm.dto.transaction.TransactionResponse;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class FinancialSummaryResponse {

    private BigDecimal totalIncome;
    private BigDecimal totalExpense;
    private BigDecimal netSavings;
    private double savingsRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<CategorySpendResponse> expenseByCategory;
    private List<CategorySpendResponse> incomeByCategory;
    private List<TransactionResponse> recentTransactions;

    public FinancialSummaryResponse() {
    }

    public FinancialSummaryResponse(BigDecimal totalIncome, BigDecimal totalExpense, BigDecimal netSavings, double savingsRate, LocalDate startDate, LocalDate endDate, List<CategorySpendResponse> expenseByCategory, List<CategorySpendResponse> incomeByCategory, List<TransactionResponse> recentTransactions) {
        this.totalIncome = totalIncome;
        this.totalExpense = totalExpense;
        this.netSavings = netSavings;
        this.savingsRate = savingsRate;
        this.startDate = startDate;
        this.endDate = endDate;
        this.expenseByCategory = expenseByCategory;
        this.incomeByCategory = incomeByCategory;
        this.recentTransactions = recentTransactions;
    }

    public BigDecimal getTotalIncome() {
        return totalIncome;
    }

    public void setTotalIncome(BigDecimal totalIncome) {
        this.totalIncome = totalIncome;
    }

    public BigDecimal getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(BigDecimal totalExpense) {
        this.totalExpense = totalExpense;
    }

    public BigDecimal getNetSavings() {
        return netSavings;
    }

    public void setNetSavings(BigDecimal netSavings) {
        this.netSavings = netSavings;
    }

    public double getSavingsRate() {
        return savingsRate;
    }

    public void setSavingsRate(double savingsRate) {
        this.savingsRate = savingsRate;
    }

    public LocalDate getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDate startDate) {
        this.startDate = startDate;
    }

    public LocalDate getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDate endDate) {
        this.endDate = endDate;
    }

    public List<CategorySpendResponse> getExpenseByCategory() {
        return expenseByCategory;
    }

    public void setExpenseByCategory(List<CategorySpendResponse> expenseByCategory) {
        this.expenseByCategory = expenseByCategory;
    }

    public List<CategorySpendResponse> getIncomeByCategory() {
        return incomeByCategory;
    }

    public void setIncomeByCategory(List<CategorySpendResponse> incomeByCategory) {
        this.incomeByCategory = incomeByCategory;
    }

    public List<TransactionResponse> getRecentTransactions() {
        return recentTransactions;
    }

    public void setRecentTransactions(List<TransactionResponse> recentTransactions) {
        this.recentTransactions = recentTransactions;
    }
}
