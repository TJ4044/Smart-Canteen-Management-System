package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.FoodItem;
import com.canteen.repository.FoodItemRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class MenuService {
    private final FoodItemRepository foodRepo;
    public MenuService(FoodItemRepository f) { this.foodRepo = f; }

    public List<FoodResponse> getAllAvailable() {
        return foodRepo.findByAvailableTrue().stream().map(FoodResponse::from).toList();
    }
    public List<FoodResponse> getAll() {
        return foodRepo.findAll().stream().map(FoodResponse::from).toList();
    }
    public List<FoodResponse> getByCategory(String cat) {
        return foodRepo.findByCategoryAndAvailableTrue(FoodItem.Category.valueOf(cat.toUpperCase()))
                .stream().map(FoodResponse::from).toList();
    }
    public FoodResponse create(FoodRequest req) {
        FoodItem f = FoodItem.builder()
                .name(req.getName()).description(req.getDescription())
                .price(req.getPrice()).category(req.getCategory())
                .imageUrl(req.getImageUrl())
                .available(req.getAvailable() != null ? req.getAvailable() : true)
                .stockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0)
                .prepTimeMinutes(req.getPrepTimeMinutes() != null ? req.getPrepTimeMinutes() : 5)
                .build();
        return FoodResponse.from(foodRepo.save(f));
    }
    public FoodResponse update(Long id, FoodRequest req) {
        FoodItem f = foodRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (req.getName() != null)          f.setName(req.getName());
        if (req.getDescription() != null)   f.setDescription(req.getDescription());
        if (req.getPrice() != null)         f.setPrice(req.getPrice());
        if (req.getCategory() != null)      f.setCategory(req.getCategory());
        if (req.getImageUrl() != null)      f.setImageUrl(req.getImageUrl());
        if (req.getAvailable() != null)     f.setAvailable(req.getAvailable());
        if (req.getStockQuantity() != null) f.setStockQuantity(req.getStockQuantity());
        if (req.getPrepTimeMinutes() != null) f.setPrepTimeMinutes(req.getPrepTimeMinutes());
        return FoodResponse.from(foodRepo.save(f));
    }
    public void delete(Long id) { foodRepo.deleteById(id); }
    public FoodResponse toggle(Long id) {
        FoodItem f = foodRepo.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        f.setAvailable(!f.getAvailable());
        return FoodResponse.from(foodRepo.save(f));
    }
}
