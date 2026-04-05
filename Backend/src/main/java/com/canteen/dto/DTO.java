package com.canteen.dto;

import com.canteen.model.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

// ─── Auth DTOs ────────────────────────────────────────────────

public class DTO {

    @Data public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
        private User.Role role;
    }

    @Data public static class LoginRequest {
        private String email;
        private String password;
    }

    @Data public static class AuthResponse {
        private Long id;
        private String name;
        private String email;
        private String role;
        private Double walletBalance;
        private String token;

        public static AuthResponse from(User u, String token) {
            AuthResponse r = new AuthResponse();
            r.id = u.getId(); r.name = u.getName(); r.email = u.getEmail();
            r.role = u.getRole().name(); r.walletBalance = u.getWalletBalance(); r.token = token;
            return r;
        }
    }

    // ─── Food DTOs ─────────────────────────────────────────────

    @Data public static class FoodRequest {
        private String name;
        private String description;
        private Double price;
        private FoodItem.Category category;
        private String imageUrl;
        private Boolean available;
        private Integer stockQuantity;
    }

    @Data public static class FoodResponse {
        private Long id;
        private String name;
        private String description;
        private Double price;
        private String category;
        private String imageUrl;
        private Boolean available;
        private Integer stockQuantity;

        public static FoodResponse from(FoodItem f) {
            FoodResponse r = new FoodResponse();
            r.id = f.getId(); r.name = f.getName(); r.description = f.getDescription();
            r.price = f.getPrice(); r.category = f.getCategory().name();
            r.imageUrl = f.getImageUrl(); r.available = f.getAvailable();
            r.stockQuantity = f.getStockQuantity();
            return r;
        }
    }

    // ─── Order DTOs ────────────────────────────────────────────

    @Data public static class OrderItemRequest {
        private Long foodItemId;
        private Integer quantity;
    }

    @Data public static class PlaceOrderRequest {
        private List<OrderItemRequest> items;
        private String paymentMethod;
        private String notes;
    }

    @Data public static class OrderItemResponse {
        private Long foodItemId;
        private String foodItemName;
        private Integer quantity;
        private Double unitPrice;
        private Double subtotal;

        public static OrderItemResponse from(OrderItem oi) {
            OrderItemResponse r = new OrderItemResponse();
            r.foodItemId = oi.getFoodItem().getId();
            r.foodItemName = oi.getFoodItem().getName();
            r.quantity = oi.getQuantity();
            r.unitPrice = oi.getUnitPrice();
            r.subtotal = oi.getSubtotal();
            return r;
        }
    }

    @Data public static class OrderResponse {
        private Long id;
        private Long userId;
        private String userName;
        private List<OrderItemResponse> items;
        private Double totalAmount;
        private String status;
        private String paymentMethod;
        private LocalDateTime createdAt;
        private String notes;

        public static OrderResponse from(Order o) {
            OrderResponse r = new OrderResponse();
            r.id = o.getId(); r.userId = o.getUser().getId();
            r.userName = o.getUser().getName();
            r.items = o.getItems().stream().map(OrderItemResponse::from).toList();
            r.totalAmount = o.getTotalAmount(); r.status = o.getStatus().name();
            r.paymentMethod = o.getPaymentMethod() != null ? o.getPaymentMethod().name() : null;
            r.createdAt = o.getCreatedAt(); r.notes = o.getNotes();
            return r;
        }
    }

    // ─── Wallet DTOs ───────────────────────────────────────────

    @Data public static class RechargeRequest {
        private Double amount;
    }

    @Data public static class TransactionResponse {
        private Long id;
        private String type;
        private Double amount;
        private String description;
        private LocalDateTime createdAt;

        public static TransactionResponse from(Transaction t) {
            TransactionResponse r = new TransactionResponse();
            r.id = t.getId(); r.type = t.getType().name();
            r.amount = t.getAmount(); r.description = t.getDescription();
            r.createdAt = t.getCreatedAt();
            return r;
        }
    }

    // ─── Admin Stats ───────────────────────────────────────────

    @Data public static class AdminStats {
        private Long totalUsers;
        private Long totalOrders;
        private Long activeOrders;
        private Double totalRevenue;
        private Long totalFoodItems;
    }

    // ─── Status Update ─────────────────────────────────────────

    @Data public static class StatusUpdateRequest {
        private String status;
    }
}
