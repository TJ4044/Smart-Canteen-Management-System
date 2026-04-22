package com.canteen.model;
import jakarta.persistence.*;

@Entity
@Table(name = "food_items")
public class FoodItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    private String description;
    @Column(nullable = false) private Double price;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Category category;
    private String imageUrl;
    @Column(nullable = false) private Boolean available = true;
    @Column(nullable = false) private Integer stockQuantity = 0;

    // ── NEW: Preparation time in minutes for kitchen priority ──
    @Column(nullable = false) private Integer prepTimeMinutes = 5;

    public enum Category { BREAKFAST, LUNCH, SNACKS, DINNER, BEVERAGES, DESSERTS }
    public FoodItem() {}

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
    public Double getPrice() { return price; } public void setPrice(Double p) { this.price = p; }
    public Category getCategory() { return category; } public void setCategory(Category c) { this.category = c; }
    public String getImageUrl() { return imageUrl; } public void setImageUrl(String i) { this.imageUrl = i; }
    public Boolean getAvailable() { return available; } public void setAvailable(Boolean a) { this.available = a; }
    public Integer getStockQuantity() { return stockQuantity; } public void setStockQuantity(Integer s) { this.stockQuantity = s; }
    public Integer getPrepTimeMinutes() { return prepTimeMinutes; } public void setPrepTimeMinutes(Integer p) { this.prepTimeMinutes = p; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String name, description, imageUrl;
        private Double price; private Category category;
        private Boolean available = true; private Integer stockQuantity = 0;
        private Integer prepTimeMinutes = 5;
        public Builder id(Long id) { this.id=id; return this; }
        public Builder name(String n) { this.name=n; return this; }
        public Builder description(String d) { this.description=d; return this; }
        public Builder price(Double p) { this.price=p; return this; }
        public Builder category(Category c) { this.category=c; return this; }
        public Builder imageUrl(String i) { this.imageUrl=i; return this; }
        public Builder available(Boolean a) { this.available=a; return this; }
        public Builder stockQuantity(Integer s) { this.stockQuantity=s; return this; }
        public Builder prepTimeMinutes(Integer p) { this.prepTimeMinutes=p; return this; }
        public FoodItem build() {
            FoodItem f = new FoodItem(); f.id=id; f.name=name; f.description=description;
            f.price=price; f.category=category; f.imageUrl=imageUrl;
            f.available=available; f.stockQuantity=stockQuantity;
            f.prepTimeMinutes=prepTimeMinutes; return f;
        }
    }
}
