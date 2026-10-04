package com.finance.pfm.config;

import com.finance.pfm.dto.auth.RegisterRequest;
import com.finance.pfm.dto.budget.BudgetRequest;
import com.finance.pfm.dto.transaction.TransactionRequest;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.repository.CategoryRepository;
import com.finance.pfm.repository.UserRepository;
import com.finance.pfm.service.AuthService;
import com.finance.pfm.service.BudgetService;
import com.finance.pfm.service.TransactionService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@Profile("dev")
public class DevDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DevDataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final AuthService authService;
    private final TransactionService transactionService;
    private final BudgetService budgetService;

    public DevDataSeeder(UserRepository userRepository,
                         CategoryRepository categoryRepository,
                         AuthService authService,
                         TransactionService transactionService,
                         BudgetService budgetService) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.authService = authService;
        this.transactionService = transactionService;
        this.budgetService = budgetService;
    }

    @Override
    public void run(String... args) {
        String demoEmail = "demo@fintrack.app";
        if (userRepository.existsByEmail(demoEmail)) {
            log.info("Demo user already exists: {}", demoEmail);
            return;
        }

        log.info("Seeding demo account and realistic financial data for: {}", demoEmail);
        RegisterRequest registerRequest = new RegisterRequest(
                demoEmail,
                "Password123!",
                "Alex",
                "Morgan"
        );
        authService.register(registerRequest);

        User user = userRepository.findByEmail(demoEmail).orElseThrow();
        List<Category> categories = categoryRepository.findAllAvailableForUser(user);
        Map<String, Category> catMap = categories.stream()
                .collect(Collectors.toMap(Category::getName, c -> c, (c1, c2) -> c1));

        // Seed Transactions
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        String budgetMonth = String.format("%04d-%02d", year, month);

        seedTransaction(user, new BigDecimal("5200.00"), TransactionType.INCOME,
                catMap.get("Salary"), LocalDate.of(year, month, 1), "Tech Corp Monthly Payroll");

        seedTransaction(user, new BigDecimal("1450.00"), TransactionType.INCOME,
                catMap.get("Freelance & Consulting"), LocalDate.of(year, month, 3), "Full-stack UI/UX Consulting milestone");

        seedTransaction(user, new BigDecimal("320.00"), TransactionType.INCOME,
                catMap.get("Investments"), LocalDate.of(year, month, 5), "Q3 Index Fund Dividend Payout");

        seedTransaction(user, new BigDecimal("1400.00"), TransactionType.EXPENSE,
                catMap.get("Housing & Rent"), LocalDate.of(year, month, 1), "Apartment Rent");

        seedTransaction(user, new BigDecimal("185.50"), TransactionType.EXPENSE,
                catMap.get("Utilities & Bills"), LocalDate.of(year, month, 2), "Electricity & High-speed Fiber");

        seedTransaction(user, new BigDecimal("265.40"), TransactionType.EXPENSE,
                catMap.get("Groceries"), LocalDate.of(year, month, 2), "Whole Foods Organic Weekly Restock");

        seedTransaction(user, new BigDecimal("74.20"), TransactionType.EXPENSE,
                catMap.get("Food & Dining"), LocalDate.of(year, month, 3), "Artisan Bistro Dinner");

        seedTransaction(user, new BigDecimal("65.00"), TransactionType.EXPENSE,
                catMap.get("Transportation"), LocalDate.of(year, month, 3), "Metro Transit Pass & Uber");

        seedTransaction(user, new BigDecimal("29.99"), TransactionType.EXPENSE,
                catMap.get("Entertainment"), LocalDate.of(year, month, 4), "Streaming Subscriptions & Music");

        // Seed Budgets
        if (catMap.containsKey("Groceries")) {
            budgetService.setBudget(user, new BudgetRequest(catMap.get("Groceries").getId(), new BigDecimal("600.00"), budgetMonth));
        }
        if (catMap.containsKey("Food & Dining")) {
            budgetService.setBudget(user, new BudgetRequest(catMap.get("Food & Dining").getId(), new BigDecimal("250.00"), budgetMonth));
        }
        if (catMap.containsKey("Housing & Rent")) {
            budgetService.setBudget(user, new BudgetRequest(catMap.get("Housing & Rent").getId(), new BigDecimal("1400.00"), budgetMonth));
        }
        if (catMap.containsKey("Utilities & Bills")) {
            budgetService.setBudget(user, new BudgetRequest(catMap.get("Utilities & Bills").getId(), new BigDecimal("300.00"), budgetMonth));
        }
        budgetService.setBudget(user, new BudgetRequest(null, new BigDecimal("3500.00"), budgetMonth));

        log.info("Demo financial data successfully seeded for {}", demoEmail);
    }

    private void seedTransaction(User user, BigDecimal amount, TransactionType type,
                                 Category category, LocalDate date, String desc) {
        TransactionRequest req = new TransactionRequest(
                amount,
                type,
                category != null ? category.getId() : null,
                date,
                desc
        );
        transactionService.createTransaction(user, req);
    }
}