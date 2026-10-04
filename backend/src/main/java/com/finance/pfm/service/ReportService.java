package com.finance.pfm.service;

import com.finance.pfm.dto.report.CategorySpendResponse;
import com.finance.pfm.dto.report.FinancialSummaryResponse;
import com.finance.pfm.dto.report.MonthlyTrendResponse;
import com.finance.pfm.dto.transaction.TransactionResponse;
import com.finance.pfm.entity.Transaction;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.repository.TransactionRepository;
import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    @Transactional(readOnly = true)
    public FinancialSummaryResponse getSummary(User user, LocalDate startDate, LocalDate endDate) {
        if (startDate == null) {
            startDate = YearMonth.now().atDay(1);
        }
        if (endDate == null) {
            endDate = YearMonth.now().atEndOfMonth();
        }

        BigDecimal totalIncome = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                user, TransactionType.INCOME, startDate, endDate
        );
        if (totalIncome == null) totalIncome = BigDecimal.ZERO;

        BigDecimal totalExpense = transactionRepository.sumAmountByUserAndTypeAndDateRange(
                user, TransactionType.EXPENSE, startDate, endDate
        );
        if (totalExpense == null) totalExpense = BigDecimal.ZERO;

        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        double savingsRate = 0.0;
        if (totalIncome.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = netSavings.multiply(BigDecimal.valueOf(100))
                    .divide(totalIncome, 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        List<CategorySpendResponse> expenseByCategory = getCategoryBreakdown(user, TransactionType.EXPENSE, startDate, endDate, totalExpense);
        List<CategorySpendResponse> incomeByCategory = getCategoryBreakdown(user, TransactionType.INCOME, startDate, endDate, totalIncome);

        List<Transaction> recent = transactionRepository.findTop5ByUserOrderByTransactionDateDescCreatedAtDesc(user);
        List<TransactionResponse> recentResponses = recent.stream()
                .map(TransactionResponse::fromEntity)
                .collect(Collectors.toList());

        return new FinancialSummaryResponse(
                totalIncome,
                totalExpense,
                netSavings,
                savingsRate,
                startDate,
                endDate,
                expenseByCategory,
                incomeByCategory,
                recentResponses
        );
    }

    @Transactional(readOnly = true)
    public List<MonthlyTrendResponse> getMonthlyTrend(User user, int months) {
        if (months <= 0) months = 6;
        List<MonthlyTrendResponse> trends = new ArrayList<>();

        YearMonth current = YearMonth.now();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = current.minusMonths(i);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();

            BigDecimal inc = transactionRepository.sumAmountByUserAndTypeAndDateRange(user, TransactionType.INCOME, start, end);
            if (inc == null) inc = BigDecimal.ZERO;

            BigDecimal exp = transactionRepository.sumAmountByUserAndTypeAndDateRange(user, TransactionType.EXPENSE, start, end);
            if (exp == null) exp = BigDecimal.ZERO;

            BigDecimal sav = inc.subtract(exp);
            trends.add(new MonthlyTrendResponse(ym.toString(), inc, exp, sav));
        }

        return trends;
    }

    private List<CategorySpendResponse> getCategoryBreakdown(User user, TransactionType type, LocalDate start, LocalDate end, BigDecimal total) {
        List<Object[]> rows = transactionRepository.sumAmountGroupedByCategory(user, type, start, end);
        List<CategorySpendResponse> breakdown = new ArrayList<>();

        for (Object[] row : rows) {
            UUID categoryId = (UUID) row[0];
            String categoryName = (String) row[1];
            String icon = (String) row[2];
            BigDecimal amount = (BigDecimal) row[3];

            double pct = 0.0;
            if (total != null && total.compareTo(BigDecimal.ZERO) > 0) {
                pct = amount.multiply(BigDecimal.valueOf(100))
                        .divide(total, 2, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            breakdown.add(new CategorySpendResponse(categoryId, categoryName, icon, amount, pct));
        }

        return breakdown;
    }

    @Transactional(readOnly = true)
    public void exportCsv(User user, TransactionType type, UUID categoryId, LocalDate startDate, LocalDate endDate, OutputStream out) throws IOException {
        List<Transaction> transactions = transactionRepository.findAllFilteredNoPage(user, type, categoryId, startDate, endDate);

        CSVFormat csvFormat = CSVFormat.DEFAULT.builder()
                .setHeader("Date", "Type", "Category", "Amount", "Description")
                .build();

        try (OutputStreamWriter writer = new OutputStreamWriter(out, StandardCharsets.UTF_8);
             CSVPrinter printer = new CSVPrinter(writer, csvFormat)) {

            printer.printRecord("Date", "Type", "Category", "Amount", "Description");

            for (Transaction t : transactions) {
                printer.printRecord(
                        t.getTransactionDate().toString(),
                        t.getType().name(),
                        t.getCategory().getName(),
                        t.getAmount().setScale(2, RoundingMode.HALF_UP).toPlainString(),
                        t.getDescription() != null ? t.getDescription() : ""
                );
            }
            printer.flush();
        }
    }

    @Transactional(readOnly = true)
    public void exportPdf(User user, TransactionType type, UUID categoryId, LocalDate startDate, LocalDate endDate, OutputStream out) {
        List<Transaction> transactions = transactionRepository.findAllFilteredNoPage(user, type, categoryId, startDate, endDate);

        Document document = new Document(PageSize.A4, 36, 36, 36, 36);
        PdfWriter.getInstance(document, out);
        document.open();

        // Title and branding
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(255, 0, 0)); // Broadcast Red
        Paragraph title = new Paragraph("Personal Finance Manager - Statement", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        document.add(title);

        Font subFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(96, 96, 96));
        Paragraph subtitle = new Paragraph("Generated on: " + LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE) +
                " | Account: " + user.getEmail(), subFont);
        subtitle.setAlignment(Element.ALIGN_CENTER);
        subtitle.setSpacingAfter(20);
        document.add(subtitle);

        // Summary Calculations
        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal totalExpense = BigDecimal.ZERO;
        for (Transaction t : transactions) {
            if (t.getType() == TransactionType.INCOME) {
                totalIncome = totalIncome.add(t.getAmount());
            } else {
                totalExpense = totalExpense.add(t.getAmount());
            }
        }
        BigDecimal net = totalIncome.subtract(totalExpense);

        // Summary Box Table
        PdfPTable summaryTable = new PdfPTable(3);
        summaryTable.setWidthPercentage(100);
        summaryTable.setSpacingAfter(20);

        Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, Color.WHITE);
        PdfPCell c1 = new PdfPCell(new Phrase("Total Income", headerFont));
        c1.setBackgroundColor(new Color(43, 166, 64)); // Success Green
        c1.setPadding(8);
        summaryTable.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase("Total Expense", headerFont));
        c2.setBackgroundColor(new Color(255, 0, 0)); // Broadcast Red
        c2.setPadding(8);
        summaryTable.addCell(c2);

        PdfPCell c3 = new PdfPCell(new Phrase("Net Savings", headerFont));
        c3.setBackgroundColor(new Color(15, 15, 15)); // Dark Neutral
        c3.setPadding(8);
        summaryTable.addCell(c3);

        Font valueFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new Color(15, 15, 15));
        PdfPCell v1 = new PdfPCell(new Phrase("$" + totalIncome.setScale(2, RoundingMode.HALF_UP), valueFont));
        v1.setPadding(8);
        summaryTable.addCell(v1);

        PdfPCell v2 = new PdfPCell(new Phrase("$" + totalExpense.setScale(2, RoundingMode.HALF_UP), valueFont));
        v2.setPadding(8);
        summaryTable.addCell(v2);

        PdfPCell v3 = new PdfPCell(new Phrase("$" + net.setScale(2, RoundingMode.HALF_UP), valueFont));
        v3.setPadding(8);
        summaryTable.addCell(v3);

        document.add(summaryTable);

        // Transactions Table
        PdfPTable table = new PdfPTable(5);
        table.setWidthPercentage(100);
        try {
            table.setWidths(new float[]{2.5f, 2.0f, 3.0f, 2.5f, 4.0f});
        } catch (DocumentException ignored) {}

        String[] headers = {"Date", "Type", "Category", "Amount", "Description"};
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK)));
            cell.setBackgroundColor(new Color(242, 242, 242)); // Surface Gray
            cell.setPadding(6);
            table.addCell(cell);
        }

        Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.BLACK);
        for (Transaction t : transactions) {
            table.addCell(new Phrase(t.getTransactionDate().toString(), rowFont));
            table.addCell(new Phrase(t.getType().name(), rowFont));
            table.addCell(new Phrase(t.getCategory().getName(), rowFont));
            table.addCell(new Phrase("$" + t.getAmount().setScale(2, RoundingMode.HALF_UP), rowFont));
            table.addCell(new Phrase(t.getDescription() != null ? t.getDescription() : "", rowFont));
        }

        document.add(table);
        document.close();
    }
}
