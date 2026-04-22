package com.canteen.controller;
import com.canteen.dto.DTO.*;
import com.canteen.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final AdminService adminService;
    public AdminController(AdminService a) { this.adminService = a; }

    @GetMapping("/stats")
    public ResponseEntity<AdminStats> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }
    @GetMapping("/users")
    public ResponseEntity<List<AuthResponse>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }
    @PostMapping("/users")
    public ResponseEntity<AuthResponse> createUser(@RequestBody RegisterRequest req) {
        return ResponseEntity.ok(adminService.createUser(req));
    }
    @PatchMapping("/users/{id}/toggle")
    public ResponseEntity<Map<String,String>> toggleUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.toggleUser(id));
    }
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String,String>> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.deleteUser(id));
    }
}
