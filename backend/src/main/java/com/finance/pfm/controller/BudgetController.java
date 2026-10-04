package com.finance.pfm.controller;

import com.finance.pfm.dto.budget.BudgetRequest;
import com.finance.pfm.dto.budget.BudgetResponse;
import com.finance.pfm.security.CustomUserDetails;
import com.finance.pfm.service.BudgetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/budgets")
@Tag(name = "Budgets", description = "Endpoints for managing monthly category and overall budgets")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @Operation(summary = "Set or update a monthly budget")
    public ResponseEntity<BudgetResponse> setBudget(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody BudgetRequest request
    ) {
        BudgetResponse response = budgetService.setBudget(userDetails.getUser(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @Operation(summary = "Get budgets for a given month (defaults to current month)")
    public ResponseEntity<List<BudgetResponse>> getBudgets(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) String month
    ) {
        String targetMonth = (month != null && !month.trim().isEmpty()) ? month : YearMonth.now().toString();
        List<BudgetResponse> responses = budgetService.getBudgets(userDetails.getUser(), targetMonth);
        return ResponseEntity.ok(responses);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a budget")
    public ResponseEntity<Void> deleteBudget(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        budgetService.deleteBudget(userDetails.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}
