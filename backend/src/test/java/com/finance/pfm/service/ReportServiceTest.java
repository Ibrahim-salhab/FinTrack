package com.finance.pfm.service;

import com.finance.pfm.dto.report.FinancialSummaryResponse;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.Transaction;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @InjectMocks
    private ReportService reportService;

    private User user;
    private Category category;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user = new User("user@test.com", "pass", "Jane", "Doe");
        user.setId(UUID.randomUUID());

        category = new Category(user, "Salary", TransactionType.INCOME, "briefcase", true);
        category.setId(UUID.randomUUID());

        transaction = new Transaction(user, category, BigDecimal.valueOf(3000.00), TransactionType.INCOME, LocalDate.now(), "Monthly salary");
        transaction.setId(UUID.randomUUID());
    }

    @Test
    void getSummary_CalculatesNetSavingsAndSavingsRate() {
        LocalDate start = LocalDate.now().minusDays(15);
        LocalDate end = LocalDate.now();

        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(eq(user), eq(TransactionType.INCOME), eq(start), eq(end)))
                .thenReturn(BigDecimal.valueOf(5000.00));
        when(transactionRepository.sumAmountByUserAndTypeAndDateRange(eq(user), eq(TransactionType.EXPENSE), eq(start), eq(end)))
                .thenReturn(BigDecimal.valueOf(2000.00));
        when(transactionRepository.sumAmountGroupedByCategory(eq(user), eq(TransactionType.EXPENSE), eq(start), eq(end)))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.sumAmountGroupedByCategory(eq(user), eq(TransactionType.INCOME), eq(start), eq(end)))
                .thenReturn(Collections.emptyList());
        when(transactionRepository.findTop5ByUserOrderByTransactionDateDescCreatedAtDesc(user))
                .thenReturn(List.of(transaction));

        FinancialSummaryResponse summary = reportService.getSummary(user, start, end);

        assertNotNull(summary);
        assertEquals(BigDecimal.valueOf(5000.00), summary.getTotalIncome());
        assertEquals(BigDecimal.valueOf(2000.00), summary.getTotalExpense());
        assertEquals(BigDecimal.valueOf(3000.00), summary.getNetSavings());
        assertEquals(60.0, summary.getSavingsRate());
        assertEquals(1, summary.getRecentTransactions().size());
    }

    @Test
    void exportCsv_GeneratesValidCsvOutput() throws IOException {
        when(transactionRepository.findAllFilteredNoPage(eq(user), any(), any(), any(), any()))
                .thenReturn(List.of(transaction));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        reportService.exportCsv(user, null, null, null, null, out);

        String csvString = out.toString();
        assertTrue(csvString.contains("Date,Type,Category,Amount,Description"));
        assertTrue(csvString.contains("Salary"));
        assertTrue(csvString.contains("3000.00"));
    }

    @Test
    void exportPdf_GeneratesValidPdfBytes() {
        when(transactionRepository.findAllFilteredNoPage(eq(user), any(), any(), any(), any()))
                .thenReturn(List.of(transaction));

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        reportService.exportPdf(user, null, null, null, null, out);

        byte[] pdfBytes = out.toByteArray();
        assertTrue(pdfBytes.length > 0);
        // Standard PDF magic header check '%PDF-'
        assertEquals('%', (char) pdfBytes[0]);
        assertEquals('P', (char) pdfBytes[1]);
        assertEquals('D', (char) pdfBytes[2]);
        assertEquals('F', (char) pdfBytes[3]);
    }
}
