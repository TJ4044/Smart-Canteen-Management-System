package com.canteen.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "food_items")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Category category;

    private String imageUrl;

    @Column(nullable = false)
    private Boolean available = true;

    @Column(nullable = false)
    private Integer stockQuantity = 0;

    public enum Category {
        BREAKFAST, LUNCH, SNACKS, DINNER, BEVERAGES, DESSERTS
    }
}
