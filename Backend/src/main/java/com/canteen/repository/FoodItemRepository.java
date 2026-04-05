package com.canteen.repository;

import com.canteen.model.FoodItem;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FoodItemRepository extends JpaRepository<FoodItem, Long> {
    List<FoodItem> findByAvailableTrue();
    List<FoodItem> findByCategory(FoodItem.Category category);
    List<FoodItem> findByCategoryAndAvailableTrue(FoodItem.Category category);
}
