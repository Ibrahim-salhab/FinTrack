package com.finance.pfm.controller;

import com.finance.pfm.dto.category.CategoryRequest;
import com.finance.pfm.dto.category.CategoryResponse;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.security.CustomUserDetails;
import com.finance.pfm.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "Categories", description = "Endpoints for managing transaction categories")
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    @Operation(summary = "Get all available categories for the user (default + custom)")
    public ResponseEntity<List<CategoryResponse>> getCategories(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam(required = false) TransactionType type
    ) {
        List<CategoryResponse> categories = categoryService.getCategories(userDetails.getUser(), type);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    @Operation(summary = "Create a custom category")
    public ResponseEntity<CategoryResponse> createCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CategoryRequest request
    ) {
        CategoryResponse response = categoryService.createCategory(userDetails.getUser(), request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a custom category")
    public ResponseEntity<Void> deleteCategory(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable UUID id
    ) {
        categoryService.deleteCategory(userDetails.getUser(), id);
        return ResponseEntity.noContent().build();
    }
}
