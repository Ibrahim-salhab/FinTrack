package com.finance.pfm.service;

import com.finance.pfm.dto.common.PageResponse;
import com.finance.pfm.dto.transaction.TransactionRequest;
import com.finance.pfm.dto.transaction.TransactionResponse;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.Transaction;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.exception.BadRequestException;
import com.finance.pfm.exception.ResourceNotFoundException;
import com.finance.pfm.repository.CategoryRepository;
import com.finance.pfm.repository.TransactionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional
    public TransactionResponse createTransaction(User user, TransactionRequest request) {
        Category category = getAvailableCategory(request.getCategoryId(), user);

        Transaction transaction = new Transaction(
                user,
                category,
                request.getAmount(),
                request.getType(),
                request.getTransactionDate(),
                request.getDescription() != null ? request.getDescription().trim() : null
        );

        Transaction saved = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(saved);
    }

    @Transactional
    public TransactionResponse updateTransaction(User user, UUID id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        Category category = getAvailableCategory(request.getCategoryId(), user);

        transaction.setCategory(category);
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);

        Transaction updated = transactionRepository.save(transaction);
        return TransactionResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTransaction(User user, UUID id) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        transactionRepository.delete(transaction);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(User user, UUID id) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));

        return TransactionResponse.fromEntity(transaction);
    }

    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> getTransactions(
            User user,
            TransactionType type,
            UUID categoryId,
            LocalDate startDate,
            LocalDate endDate,
            String query,
            int page,
            int size,
            String sortBy,
            String sortDirection
    ) {
        Sort sort = Sort.by(
                "asc".equalsIgnoreCase(sortDirection) ? Sort.Direction.ASC : Sort.Direction.DESC,
                sortBy != null ? sortBy : "transactionDate"
        ).and(Sort.by(Sort.Direction.DESC, "createdAt"));

        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Transaction> transactionPage;
        if (query != null && !query.trim().isEmpty()) {
            String queryPattern = "%" + query.trim().toLowerCase() + "%";
            transactionPage = transactionRepository.findFilteredWithQuery(
                    user,
                    type,
                    categoryId,
                    startDate,
                    endDate,
                    queryPattern,
                    pageable
            );
        } else {
            transactionPage = transactionRepository.findFilteredWithoutQuery(
                    user,
                    type,
                    categoryId,
                    startDate,
                    endDate,
                    pageable
            );
        }

        Page<TransactionResponse> responsePage = transactionPage.map(TransactionResponse::fromEntity);
        return PageResponse.fromPage(responsePage);
    }

    @Transactional(readOnly = true)
    public List<Transaction> getAllFilteredNoPage(
            User user,
            TransactionType type,
            UUID categoryId,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return transactionRepository.findAllFilteredNoPage(user, type, categoryId, startDate, endDate);
    }

    private Category getAvailableCategory(UUID categoryId, User user) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));

        if (category.getUser() != null && !category.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Selected category is not accessible by this user");
        }

        return category;
    }
}
