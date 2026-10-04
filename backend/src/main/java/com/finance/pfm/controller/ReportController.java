package com.finance.pfm.controller;

import com.finance.pfm.dto.report.FinancialSummaryResponse;
import com.finance.pfm.dto.report.MonthlyTrendResponse;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.security.CustomUserDetails;
import com.finance.pfm.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports & Analytics", description = "Endpoints for financial dashboard summaries and report exports")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/summary")
    @Operation(summary = "Get high-level financial summary (income, expense, savings, category breakdown)")
    public ResponseEntity<FinancialSummaryResponse> getSummary(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        FinancialSummaryResponse response = reportService.getSummary(userDetails.getUser(), startDate, endDate);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly-trend")
    @Operation(summary = "Get monthly financial trends over recent months")
    public ResponseEntity<List<MonthlyTrendResponse>> getMonthlyTrend(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(defaultValue = "6") int months
    ) {
        List<MonthlyTrendResponse> responses = reportService.getMonthlyTrend(userDetails.getUser(), months);
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export filtered transactions to CSV file")
    public void exportCsv(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletResponse response
    ) throws IOException {
        response.setContentType("text/csv");
        response.setHeader("Content-Disposition", "attachment; filename=\"transactions.csv\"");
        reportService.exportCsv(userDetails.getUser(), type, categoryId, startDate, endDate, response.getOutputStream());
    }

    @GetMapping("/export/pdf")
    @Operation(summary = "Export filtered transactions and financial summary to PDF document")
    public void exportPdf(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            HttpServletResponse response
    ) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=\"finance-report.pdf\"");
        reportService.exportPdf(userDetails.getUser(), type, categoryId, startDate, endDate, response.getOutputStream());
    }
}
