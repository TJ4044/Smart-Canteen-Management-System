package com.canteen.controller;

import com.canteen.dto.DTO.*;
import com.canteen.service.MenuService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    @GetMapping
    public ResponseEntity<List<FoodResponse>> getMenu() {
        return ResponseEntity.ok(menuService.getAllAvailable());
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<List<FoodResponse>> getByCategory(@PathVariable String category) {
        return ResponseEntity.ok(menuService.getByCategory(category));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FoodResponse>> getAll() {
        return ResponseEntity.ok(menuService.getAll());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodResponse> create(@RequestBody FoodRequest req) {
        return ResponseEntity.ok(menuService.create(req));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodResponse> update(@PathVariable Long id, @RequestBody FoodRequest req) {
        return ResponseEntity.ok(menuService.update(id, req));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        menuService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FoodResponse> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.toggleAvailability(id));
    }
}
