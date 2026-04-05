package com.canteen.config;
import com.canteen.model.*;
import com.canteen.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserRepository userRepo;
    private final FoodItemRepository foodRepo;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository userRepo, FoodItemRepository foodRepo, PasswordEncoder encoder) {
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (!userRepo.existsByEmail("admin@canteen.com"))
            userRepo.save(User.builder().name("Admin").email("admin@canteen.com")
                    .password(encoder.encode("admin123")).role(User.Role.ADMIN).walletBalance(0.0).active(true).build());
        if (!userRepo.existsByEmail("emp@canteen.com"))
            userRepo.save(User.builder().name("Ravi Kumar").email("emp@canteen.com")
                    .password(encoder.encode("emp123")).role(User.Role.EMPLOYEE).walletBalance(500.0).active(true).build());
        if (!userRepo.existsByEmail("customer@canteen.com"))
            userRepo.save(User.builder().name("Priya Sharma").email("customer@canteen.com")
                    .password(encoder.encode("cust123")).role(User.Role.CUSTOMER).walletBalance(300.0).active(true).build());
        if (foodRepo.count() == 0) {
            foodRepo.save(food("Idli Sambar","Soft idlis with sambar",25.0,FoodItem.Category.BREAKFAST,50));
            foodRepo.save(food("Masala Dosa","Crispy dosa with filling",40.0,FoodItem.Category.BREAKFAST,40));
            foodRepo.save(food("Poha","Flattened rice with veggies",20.0,FoodItem.Category.BREAKFAST,60));
            foodRepo.save(food("Veg Thali","Rice, dal, sabzi, roti",80.0,FoodItem.Category.LUNCH,30));
            foodRepo.save(food("Chicken Biryani","Fragrant rice with chicken",120.0,FoodItem.Category.LUNCH,25));
            foodRepo.save(food("Paneer Rice","Fried rice with paneer",90.0,FoodItem.Category.LUNCH,35));
            foodRepo.save(food("Samosa","Crispy spiced potato pastry",15.0,FoodItem.Category.SNACKS,80));
            foodRepo.save(food("Vada Pav","Mumbai street food",20.0,FoodItem.Category.SNACKS,70));
            foodRepo.save(food("Dal Rice","Dal with steamed rice",60.0,FoodItem.Category.DINNER,40));
            foodRepo.save(food("Butter Naan","Soft naan 2 pieces",30.0,FoodItem.Category.DINNER,60));
            foodRepo.save(food("Masala Chai","Spiced milk tea",15.0,FoodItem.Category.BEVERAGES,100));
            foodRepo.save(food("Lime Soda","Fresh lime soda",25.0,FoodItem.Category.BEVERAGES,80));
            foodRepo.save(food("Gulab Jamun","Khoya balls in syrup",30.0,FoodItem.Category.DESSERTS,50));
        }
    }

    private FoodItem food(String name, String desc, double price, FoodItem.Category cat, int stock) {
        return FoodItem.builder().name(name).description(desc).price(price)
                .category(cat).available(true).stockQuantity(stock).build();
    }
}
