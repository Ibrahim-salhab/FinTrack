package com.finance.pfm.service;

import com.finance.pfm.dto.common.PageResponse;
import com.finance.pfm.dto.transaction.TransactionRequest;
import com.finance.pfm.dto.transaction.TransactionResponse;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.Transaction;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.exception.ResourceNotFoundException;
import com.finance.pfm.repository.CategoryRepository;
import com.finance.pfm.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransactionServiceTest {

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @InjectMocks
    private TransactionService transactionService;

    private User user;
    private Category category;
    private Transaction transaction;

    @BeforeEach
    void setUp() {
        user = new User("user@test.com", "pass", "Alex", "Smith");
        user.setId(UUID.randomUUID());

        category = new Category(user, "Dining", TransactionType.EXPENSE, "utensils", false);
        category.setId(UUID.randomUUID());

        transaction = new Transaction(user, category, BigDecimal.valueOf(50.00), TransactionType.EXPENSE, LocalDate.now(), "Dinner with team");
        transaction.setId(UUID.randomUUID());
    }

    @Test
    void createTransaction_Success() {
        TransactionRequest request = new TransactionRequest(
                BigDecimal.valueOf(50.00),
                TransactionType.EXPENSE,
                category.getId(),
                LocalDate.now(),
                "Dinner with team"
        );

        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(transactionRepository.save(any(Transaction.class))).thenReturn(transaction);

        TransactionResponse response = transactionService.createTransaction(user, request);

        assertNotNull(response);
        assertEquals(BigDecimal.valueOf(50.00), response.getAmount());
        assertEquals(TransactionType.EXPENSE, response.getType());
        assertEquals("Dinner with team", response.getDescription());
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    void deleteTransaction_Success() {
        when(transactionRepository.findByIdAndUser(transaction.getId(), user)).thenReturn(Optional.of(transaction));

        transactionService.deleteTransaction(user, transaction.getId());

        verify(transactionRepository, times(1)).delete(transaction);
    }

    @Test
    void deleteTransaction_NotFound_ThrowsException() {
        UUID randomId = UUID.randomUUID();
        when(transactionRepository.findByIdAndUser(randomId, user)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> transactionService.deleteTransaction(user, randomId));
        verify(transactionRepository, never()).delete(any());
    }

    @Test
    void getTransactions_ReturnsPageResponse() {
        Page<Transaction> page = new PageImpl<>(List.of(transaction));
        when(transactionRepository.findFiltered(eq(user), isNull(), isNull(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        PageResponse<TransactionResponse> result = transactionService.getTransactions(
                user, null, null, null, null, null, 0, 10, "transactionDate", "desc"
        );

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("Dinner with team", result.getContent().get(0).getDescription());
    }
}
