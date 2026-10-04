package com.finance.pfm.service;

import com.finance.pfm.dto.auth.AuthResponse;
import com.finance.pfm.dto.auth.LoginRequest;
import com.finance.pfm.dto.auth.RegisterRequest;
import com.finance.pfm.dto.auth.UserProfileResponse;
import com.finance.pfm.entity.Category;
import com.finance.pfm.entity.TransactionType;
import com.finance.pfm.entity.User;
import com.finance.pfm.exception.BadRequestException;
import com.finance.pfm.repository.CategoryRepository;
import com.finance.pfm.repository.UserRepository;
import com.finance.pfm.security.CustomUserDetails;
import com.finance.pfm.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        User user = new User(
                request.getEmail().toLowerCase().trim(),
                passwordEncoder.encode(request.getPassword()),
                request.getFirstName().trim(),
                request.getLastName() != null ? request.getLastName().trim() : null
        );

        User savedUser = userRepository.save(user);

        // Seed default categories for this user
        seedDefaultCategories(savedUser);

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails, savedUser.getId());

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().toLowerCase().trim(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails, user.getId());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    public UserProfileResponse getProfile(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt()
        );
    }

    private void seedDefaultCategories(User user) {
        List<Category> defaultCategories = List.of(
                // Expenses
                new Category(user, "Food & Dining", TransactionType.EXPENSE, "utensils", true),
                new Category(user, "Groceries", TransactionType.EXPENSE, "shopping-cart", true),
                new Category(user, "Housing & Rent", TransactionType.EXPENSE, "home", true),
                new Category(user, "Transportation", TransactionType.EXPENSE, "car", true),
                new Category(user, "Entertainment", TransactionType.EXPENSE, "film", true),
                new Category(user, "Utilities & Bills", TransactionType.EXPENSE, "zap", true),
                new Category(user, "Healthcare", TransactionType.EXPENSE, "activity", true),
                new Category(user, "Shopping", TransactionType.EXPENSE, "shopping-bag", true),
                new Category(user, "Education", TransactionType.EXPENSE, "book", true),

                // Income
                new Category(user, "Salary", TransactionType.INCOME, "briefcase", true),
                new Category(user, "Freelance & Consulting", TransactionType.INCOME, "laptop", true),
                new Category(user, "Investments", TransactionType.INCOME, "trending-up", true),
                new Category(user, "Gifts & Grants", TransactionType.INCOME, "gift", true),
                new Category(user, "Other Income", TransactionType.INCOME, "dollar-sign", true)
        );

        categoryRepository.saveAll(defaultCategories);
    }
}
