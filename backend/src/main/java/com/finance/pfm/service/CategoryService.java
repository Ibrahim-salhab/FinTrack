package com.finance.pfm.service;

import com.finance.pfm.dto.category.CategoryRequest;
import com.finance.pfm.dto.category.CategoryResponse;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.exception.BadRequestException;
import com.finance.pfm.exception.ResourceNotFoundException;
import com.finance.pfm.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategories(User user, TransactionType type) {
        List<Category> categories;
        if (type != null) {
            categories = categoryRepository.findAllAvailableForUserAndType(user, type);
        } else {
            categories = categoryRepository.findAllAvailableForUser(user);
        }
        return categories.stream().map(CategoryResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public CategoryResponse createCategory(User user, CategoryRequest request) {
        if (categoryRepository.existsByNameIgnoreCaseAndUser(request.getName(), user)) {
            throw new BadRequestException("Category with this name already exists");
        }

        Category category = new Category(
                user,
                request.getName().trim(),
                request.getType(),
                request.getIcon() != null ? request.getIcon().trim() : "tag",
                false
        );

        Category saved = categoryRepository.save(category);
        return CategoryResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteCategory(User user, UUID id) {
        Category category = categoryRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Custom category not found or cannot be deleted"));

        categoryRepository.delete(category);
    }
}
