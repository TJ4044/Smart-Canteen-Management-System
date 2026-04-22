package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.User;
import com.canteen.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {
    private final UserRepository userRepo;
    private final OrderRepository orderRepo;
    private final FoodItemRepository foodRepo;
    private final PasswordEncoder encoder;

    public AdminService(UserRepository u, OrderRepository o, FoodItemRepository f, PasswordEncoder e) {
        this.userRepo=u; this.orderRepo=o; this.foodRepo=f; this.encoder=e;
    }

    public AdminStats getStats() {
        AdminStats s = new AdminStats();
        s.setTotalUsers(userRepo.count());
        s.setTotalOrders(orderRepo.count());
        s.setActiveOrders(orderRepo.countActiveOrders());
        Double rev = orderRepo.getTotalRevenue();
        s.setTotalRevenue(rev != null ? rev : 0.0);
        s.setTotalFoodItems(foodRepo.count());
        return s;
    }

    public List<AuthResponse> getAllUsers() {
        return userRepo.findAll().stream().map(u -> AuthResponse.from(u, "")).toList();
    }

    public AuthResponse createUser(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail())) throw new RuntimeException("Email already exists");
        User user = User.builder().name(req.getName()).email(req.getEmail())
                .password(encoder.encode(req.getPassword())).phone(req.getPhone())
                .role(req.getRole() != null ? req.getRole() : User.Role.EMPLOYEE)
                .walletBalance(0.0).active(true).build();
        return AuthResponse.from(userRepo.save(user), "");
    }

    public Map<String, String> toggleUser(Long id) {
        User user = userRepo.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(!user.getActive());
        userRepo.save(user);
        return Map.of("message", "User " + (user.getActive() ? "activated" : "deactivated"));
    }

    public Map<String, String> deleteUser(Long id) {
        userRepo.deleteById(id);
        return Map.of("message", "User deleted");
    }
}
