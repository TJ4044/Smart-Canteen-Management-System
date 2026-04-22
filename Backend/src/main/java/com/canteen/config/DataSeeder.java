package com.canteen.config;
import com.canteen.model.*;
import com.canteen.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepo;
    private final FoodItemRepository foodRepo;
    private final SlotSettingRepository slotRepo;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository userRepo, FoodItemRepository foodRepo,
                      SlotSettingRepository slotRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo; this.foodRepo = foodRepo;
        this.slotRepo = slotRepo; this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        // Demo users
        if (!userRepo.existsByEmail("admin@canteen.com"))
            userRepo.save(User.builder().name("Admin").email("admin@canteen.com")
                    .password(encoder.encode("admin123")).role(User.Role.ADMIN).walletBalance(0.0).active(true).build());
        if (!userRepo.existsByEmail("emp@canteen.com"))
            userRepo.save(User.builder().name("Ravi Kumar").email("emp@canteen.com")
                    .password(encoder.encode("emp123")).role(User.Role.EMPLOYEE).walletBalance(500.0).active(true).build());
        if (!userRepo.existsByEmail("customer@canteen.com"))
            userRepo.save(User.builder().name("Priya Sharma").email("customer@canteen.com")
                    .password(encoder.encode("cust123")).role(User.Role.CUSTOMER).walletBalance(300.0).active(true).build());

        // Food items with prep times
        if (foodRepo.count() == 0) {
            // name, desc, price, category, stock, prepTime(mins)
            foodRepo.save(food("Idli Sambar",     "Soft idlis with sambar & chutney",    25.0, FoodItem.Category.BREAKFAST, 50, 5));
            foodRepo.save(food("Masala Dosa",     "Crispy dosa with potato filling",      40.0, FoodItem.Category.BREAKFAST, 40, 8));
            foodRepo.save(food("Poha",            "Flattened rice with veggies",          20.0, FoodItem.Category.BREAKFAST, 60, 4));
            foodRepo.save(food("Veg Thali",       "Rice, dal, sabzi, roti, salad",        80.0, FoodItem.Category.LUNCH,    30, 15));
            foodRepo.save(food("Chicken Biryani", "Fragrant basmati rice with chicken",  120.0, FoodItem.Category.LUNCH,    25, 20));
            foodRepo.save(food("Paneer Rice",     "Fried rice with paneer & veggies",     90.0, FoodItem.Category.LUNCH,    35, 12));
            foodRepo.save(food("Samosa",          "Crispy pastry with spiced potato",     15.0, FoodItem.Category.SNACKS,   80, 3));
            foodRepo.save(food("Vada Pav",        "Mumbai street food classic",           20.0, FoodItem.Category.SNACKS,   70, 3));
            foodRepo.save(food("Spring Rolls",    "Crispy vegetable spring rolls",        45.0, FoodItem.Category.SNACKS,   50, 6));
            foodRepo.save(food("Dal Rice",        "Comfort food dal with steamed rice",   60.0, FoodItem.Category.DINNER,   40, 10));
            foodRepo.save(food("Butter Naan",     "Soft naan with butter, 2 pieces",      30.0, FoodItem.Category.DINNER,   60, 8));
            foodRepo.save(food("Masala Chai",     "Spiced milk tea",                      15.0, FoodItem.Category.BEVERAGES,100, 2));
            foodRepo.save(food("Fresh Lime Soda", "Refreshing lime soda",                 25.0, FoodItem.Category.BEVERAGES, 80, 2));
            foodRepo.save(food("Gulab Jamun",     "Soft khoya balls in sugar syrup",      30.0, FoodItem.Category.DESSERTS,  50, 1));
        }

        // Default slot setting for today
        if (slotRepo.findByDate(LocalDate.now()).isEmpty()) {
            SlotSetting s = new SlotSetting();
            s.setDate(LocalDate.now());
            s.setMaxOrdersPerSlot(20);
            s.setSlotDurationMinutes(10);
            s.setPeakStartTime("13:00");
            s.setPeakEndTime("14:00");
            s.setOrderingEnabled(true);
            slotRepo.save(s);
        }
    }

    private FoodItem food(String name, String desc, double price,
                          FoodItem.Category cat, int stock, int prepTime) {
        return FoodItem.builder().name(name).description(desc).price(price)
                .category(cat).available(true).stockQuantity(stock)
                .prepTimeMinutes(prepTime).build();
    }
}
