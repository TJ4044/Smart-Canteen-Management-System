package com.canteen.config;

import com.canteen.model.*;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepo;
    private final FoodItemRepository foodRepo;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) {
        // Seed Admin
        if (!userRepo.existsByEmail("admin@canteen.com")) {
            userRepo.save(User.builder()
                    .name("Admin").email("admin@canteen.com")
                    .password(encoder.encode("admin123"))
                    .role(User.Role.ADMIN).walletBalance(0.0).active(true).build());
        }
        // Seed Employee
        if (!userRepo.existsByEmail("emp@canteen.com")) {
            userRepo.save(User.builder()
                    .name("Ravi Kumar").email("emp@canteen.com")
                    .password(encoder.encode("emp123"))
                    .role(User.Role.EMPLOYEE).walletBalance(500.0).active(true).build());
        }
        // Seed Customer
        if (!userRepo.existsByEmail("customer@canteen.com")) {
            userRepo.save(User.builder()
                    .name("Priya Sharma").email("customer@canteen.com")
                    .password(encoder.encode("cust123"))
                    .role(User.Role.CUSTOMER).walletBalance(300.0).active(true).build());
        }

        // Seed Food Items
        if (foodRepo.count() == 0) {
            foodRepo.save(food("Idli Sambar",      "Soft idlis with sambar and chutney",    25.0,  FoodItem.Category.BREAKFAST, 50));
            foodRepo.save(food("Masala Dosa",      "Crispy dosa with potato filling",        40.0,  FoodItem.Category.BREAKFAST, 40));
            foodRepo.save(food("Poha",             "Flattened rice with veggies",            20.0,  FoodItem.Category.BREAKFAST, 60));
            foodRepo.save(food("Veg Thali",        "Rice, dal, sabzi, roti, salad",          80.0,  FoodItem.Category.LUNCH,     30));
            foodRepo.save(food("Chicken Biryani",  "Fragrant basmati rice with chicken",     120.0, FoodItem.Category.LUNCH,     25));
            foodRepo.save(food("Paneer Rice",      "Fried rice with paneer and veggies",     90.0,  FoodItem.Category.LUNCH,     35));
            foodRepo.save(food("Samosa",           "Crispy pastry filled with spiced potato",15.0,  FoodItem.Category.SNACKS,    80));
            foodRepo.save(food("Vada Pav",         "Mumbai street food classic",             20.0,  FoodItem.Category.SNACKS,    70));
            foodRepo.save(food("Spring Rolls",     "Crispy vegetable spring rolls",          45.0,  FoodItem.Category.SNACKS,    50));
            foodRepo.save(food("Dal Rice",         "Comfort food dal with steamed rice",     60.0,  FoodItem.Category.DINNER,    40));
            foodRepo.save(food("Butter Naan",      "Soft naan with butter, 2 pieces",        30.0,  FoodItem.Category.DINNER,    60));
            foodRepo.save(food("Masala Chai",      "Spiced milk tea",                        15.0,  FoodItem.Category.BEVERAGES, 100));
            foodRepo.save(food("Fresh Lime Soda",  "Refreshing lime soda",                   25.0,  FoodItem.Category.BEVERAGES, 80));
            foodRepo.save(food("Gulab Jamun",      "Soft khoya balls in sugar syrup",        30.0,  FoodItem.Category.DESSERTS,  50));
        }
    }

    private FoodItem food(String name, String desc, double price, FoodItem.Category cat, int stock) {
        return FoodItem.builder().name(name).description(desc).price(price)
                .category(cat).available(true).stockQuantity(stock).build();
    }
}
