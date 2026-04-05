package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.FoodItem;
import com.canteen.repository.FoodItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final FoodItemRepository foodRepo;

    public List<FoodResponse> getAllAvailable() {
        return foodRepo.findByAvailableTrue().stream().map(FoodResponse::from).toList();
    }

    public List<FoodResponse> getAll() {
        return foodRepo.findAll().stream().map(FoodResponse::from).toList();
    }

    public List<FoodResponse> getByCategory(String category) {
        FoodItem.Category cat = FoodItem.Category.valueOf(category.toUpperCase());
        return foodRepo.findByCategoryAndAvailableTrue(cat).stream().map(FoodResponse::from).toList();
    }

    public FoodResponse create(FoodRequest req) {
        FoodItem item = FoodItem.builder()
                .name(req.getName()).description(req.getDescription())
                .price(req.getPrice()).category(req.getCategory())
                .imageUrl(req.getImageUrl())
                .available(req.getAvailable() != null ? req.getAvailable() : true)
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .build();
        return FoodResponse.from(foodRepo.save(item));
    }

    public FoodResponse update(Long id, FoodRequest req) {
        FoodItem item = foodRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
        if (req.getName() != null)          item.setName(req.getName());
        if (req.getDescription() != null)   item.setDescription(req.getDescription());
        if (req.getPrice() != null)         item.setPrice(req.getPrice());
        if (req.getCategory() != null)      item.setCategory(req.getCategory());
        if (req.getImageUrl() != null)      item.setImageUrl(req.getImageUrl());
        if (req.getAvailable() != null)     item.setAvailable(req.getAvailable());
        if (req.getStockQuantity() != null) item.setStockQuantity(req.getStockQuantity());
        return FoodResponse.from(foodRepo.save(item));
    }

    public void delete(Long id) {
        foodRepo.deleteById(id);
    }

    public FoodResponse toggleAvailability(Long id) {
        FoodItem item = foodRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Food item not found"));
        item.setAvailable(!item.getAvailable());
        return FoodResponse.from(foodRepo.save(item));
    }
}
