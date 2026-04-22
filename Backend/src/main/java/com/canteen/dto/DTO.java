package com.canteen.dto;

import com.canteen.model.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

public class DTO {

    // ── Auth ─────────────────────────────────────────────────
    public static class RegisterRequest {
        private String name, email, password, phone;
        private User.Role role;
        public String getName(){return name;} public void setName(String n){this.name=n;}
        public String getEmail(){return email;} public void setEmail(String e){this.email=e;}
        public String getPassword(){return password;} public void setPassword(String p){this.password=p;}
        public String getPhone(){return phone;} public void setPhone(String p){this.phone=p;}
        public User.Role getRole(){return role;} public void setRole(User.Role r){this.role=r;}
    }

    public static class LoginRequest {
        private String email, password;
        public String getEmail(){return email;} public void setEmail(String e){this.email=e;}
        public String getPassword(){return password;} public void setPassword(String p){this.password=p;}
    }

    public static class AuthResponse {
        private Long id; private String name, email, role, token; private Double walletBalance;
        public Long getId(){return id;} public void setId(Long id){this.id=id;}
        public String getName(){return name;} public void setName(String n){this.name=n;}
        public String getEmail(){return email;} public void setEmail(String e){this.email=e;}
        public String getRole(){return role;} public void setRole(String r){this.role=r;}
        public String getToken(){return token;} public void setToken(String t){this.token=t;}
        public Double getWalletBalance(){return walletBalance;} public void setWalletBalance(Double w){this.walletBalance=w;}
        public static AuthResponse from(User u, String token) {
            AuthResponse r = new AuthResponse();
            r.id=u.getId(); r.name=u.getName(); r.email=u.getEmail();
            r.role=u.getRole().name(); r.walletBalance=u.getWalletBalance(); r.token=token;
            return r;
        }
    }

    // ── Food ─────────────────────────────────────────────────
    public static class FoodRequest {
        private String name, description, imageUrl;
        private Double price; private FoodItem.Category category;
        private Boolean available; private Integer stockQuantity;
        private Integer prepTimeMinutes;
        public String getName(){return name;} public void setName(String n){this.name=n;}
        public String getDescription(){return description;} public void setDescription(String d){this.description=d;}
        public String getImageUrl(){return imageUrl;} public void setImageUrl(String i){this.imageUrl=i;}
        public Double getPrice(){return price;} public void setPrice(Double p){this.price=p;}
        public FoodItem.Category getCategory(){return category;} public void setCategory(FoodItem.Category c){this.category=c;}
        public Boolean getAvailable(){return available;} public void setAvailable(Boolean a){this.available=a;}
        public Integer getStockQuantity(){return stockQuantity;} public void setStockQuantity(Integer s){this.stockQuantity=s;}
        public Integer getPrepTimeMinutes(){return prepTimeMinutes;} public void setPrepTimeMinutes(Integer p){this.prepTimeMinutes=p;}
    }

    public static class FoodResponse {
        private Long id; private String name, description, category, imageUrl;
        private Double price; private Boolean available; private Integer stockQuantity, prepTimeMinutes;
        public Long getId(){return id;} public String getName(){return name;}
        public String getDescription(){return description;} public String getCategory(){return category;}
        public String getImageUrl(){return imageUrl;} public Double getPrice(){return price;}
        public Boolean getAvailable(){return available;} public Integer getStockQuantity(){return stockQuantity;}
        public Integer getPrepTimeMinutes(){return prepTimeMinutes;}
        public static FoodResponse from(FoodItem f) {
            FoodResponse r = new FoodResponse();
            r.id=f.getId(); r.name=f.getName(); r.description=f.getDescription();
            r.price=f.getPrice(); r.category=f.getCategory().name();
            r.imageUrl=f.getImageUrl(); r.available=f.getAvailable();
            r.stockQuantity=f.getStockQuantity(); r.prepTimeMinutes=f.getPrepTimeMinutes();
            return r;
        }
    }

    // ── Order ─────────────────────────────────────────────────
    public static class OrderItemRequest {
        private Long foodItemId; private Integer quantity;
        public Long getFoodItemId(){return foodItemId;} public void setFoodItemId(Long f){this.foodItemId=f;}
        public Integer getQuantity(){return quantity;} public void setQuantity(Integer q){this.quantity=q;}
    }

    public static class PlaceOrderRequest {
        private List<OrderItemRequest> items;
        private String paymentMethod, notes;
        private String scheduledPickupTime; // "HH:mm" e.g. "13:30"
        public List<OrderItemRequest> getItems(){return items;} public void setItems(List<OrderItemRequest> i){this.items=i;}
        public String getPaymentMethod(){return paymentMethod;} public void setPaymentMethod(String p){this.paymentMethod=p;}
        public String getNotes(){return notes;} public void setNotes(String n){this.notes=n;}
        public String getScheduledPickupTime(){return scheduledPickupTime;} public void setScheduledPickupTime(String t){this.scheduledPickupTime=t;}
    }

    public static class OrderItemResponse {
        private Long foodItemId; private String foodItemName;
        private Integer quantity, prepTimeMinutes; private Double unitPrice, subtotal;
        public Long getFoodItemId(){return foodItemId;} public String getFoodItemName(){return foodItemName;}
        public Integer getQuantity(){return quantity;} public Integer getPrepTimeMinutes(){return prepTimeMinutes;}
        public Double getUnitPrice(){return unitPrice;} public Double getSubtotal(){return subtotal;}
        public static OrderItemResponse from(OrderItem oi) {
            OrderItemResponse r = new OrderItemResponse();
            r.foodItemId=oi.getFoodItem().getId(); r.foodItemName=oi.getFoodItem().getName();
            r.quantity=oi.getQuantity(); r.unitPrice=oi.getUnitPrice(); r.subtotal=oi.getSubtotal();
            r.prepTimeMinutes=oi.getFoodItem().getPrepTimeMinutes();
            return r;
        }
    }

    public static class OrderResponse {
        private Long id, userId; private String userName, status, paymentMethod, notes;
        private List<OrderItemResponse> items; private Double totalAmount;
        private LocalDateTime createdAt;
        private Integer tokenNumber; private String timeSlot;
        private String scheduledPickupTime, estimatedReadyTime;
        private Integer priorityScore;
        public Long getId(){return id;} public Long getUserId(){return userId;}
        public String getUserName(){return userName;} public String getStatus(){return status;}
        public String getPaymentMethod(){return paymentMethod;} public String getNotes(){return notes;}
        public List<OrderItemResponse> getItems(){return items;} public Double getTotalAmount(){return totalAmount;}
        public LocalDateTime getCreatedAt(){return createdAt;}
        public Integer getTokenNumber(){return tokenNumber;} public String getTimeSlot(){return timeSlot;}
        public String getScheduledPickupTime(){return scheduledPickupTime;}
        public String getEstimatedReadyTime(){return estimatedReadyTime;}
        public Integer getPriorityScore(){return priorityScore;}
        public static OrderResponse from(Order o) {
            OrderResponse r = new OrderResponse();
            r.id=o.getId(); r.userId=o.getUser().getId(); r.userName=o.getUser().getName();
            r.items=o.getItems().stream().map(OrderItemResponse::from).toList();
            r.totalAmount=o.getTotalAmount(); r.status=o.getStatus().name();
            r.paymentMethod=o.getPaymentMethod()!=null?o.getPaymentMethod().name():null;
            r.createdAt=o.getCreatedAt(); r.notes=o.getNotes();
            r.tokenNumber=o.getTokenNumber(); r.timeSlot=o.getTimeSlot();
            r.scheduledPickupTime=o.getScheduledPickupTime()!=null?o.getScheduledPickupTime().toString():null;
            r.estimatedReadyTime=o.getEstimatedReadyTime()!=null?o.getEstimatedReadyTime().toString():null;
            r.priorityScore=o.getPriorityScore();
            return r;
        }
    }

    // ── Wallet ────────────────────────────────────────────────
    public static class RechargeRequest {
        private Double amount;
        public Double getAmount(){return amount;} public void setAmount(Double a){this.amount=a;}
    }

    public static class TransactionResponse {
        private Long id; private String type, description; private Double amount; private LocalDateTime createdAt;
        public Long getId(){return id;} public String getType(){return type;}
        public String getDescription(){return description;} public Double getAmount(){return amount;}
        public LocalDateTime getCreatedAt(){return createdAt;}
        public static TransactionResponse from(Transaction t) {
            TransactionResponse r = new TransactionResponse();
            r.id=t.getId(); r.type=t.getType().name(); r.amount=t.getAmount();
            r.description=t.getDescription(); r.createdAt=t.getCreatedAt();
            return r;
        }
    }

    // ── Admin Stats ───────────────────────────────────────────
    public static class AdminStats {
        private Long totalUsers, totalOrders, activeOrders, totalFoodItems;
        private Double totalRevenue;
        public Long getTotalUsers(){return totalUsers;} public void setTotalUsers(Long t){this.totalUsers=t;}
        public Long getTotalOrders(){return totalOrders;} public void setTotalOrders(Long t){this.totalOrders=t;}
        public Long getActiveOrders(){return activeOrders;} public void setActiveOrders(Long a){this.activeOrders=a;}
        public Long getTotalFoodItems(){return totalFoodItems;} public void setTotalFoodItems(Long t){this.totalFoodItems=t;}
        public Double getTotalRevenue(){return totalRevenue;} public void setTotalRevenue(Double t){this.totalRevenue=t;}
    }

    // ── Slot ──────────────────────────────────────────────────
    public static class SlotAvailabilityResponse {
        private String slot; private int ordersInSlot; private int maxOrders; private boolean available;
        public SlotAvailabilityResponse(String slot, int ordersInSlot, int maxOrders) {
            this.slot=slot; this.ordersInSlot=ordersInSlot; this.maxOrders=maxOrders;
            this.available=ordersInSlot<maxOrders;
        }
        public String getSlot(){return slot;} public int getOrdersInSlot(){return ordersInSlot;}
        public int getMaxOrders(){return maxOrders;} public boolean isAvailable(){return available;}
        public int getRemainingCapacity(){return Math.max(0, maxOrders-ordersInSlot);}
    }

    public static class SlotSettingRequest {
        private Integer maxOrdersPerSlot, slotDurationMinutes;
        private String peakStartTime, peakEndTime;
        private Boolean orderingEnabled;
        public Integer getMaxOrdersPerSlot(){return maxOrdersPerSlot;} public void setMaxOrdersPerSlot(Integer m){this.maxOrdersPerSlot=m;}
        public Integer getSlotDurationMinutes(){return slotDurationMinutes;} public void setSlotDurationMinutes(Integer s){this.slotDurationMinutes=s;}
        public String getPeakStartTime(){return peakStartTime;} public void setPeakStartTime(String t){this.peakStartTime=t;}
        public String getPeakEndTime(){return peakEndTime;} public void setPeakEndTime(String t){this.peakEndTime=t;}
        public Boolean getOrderingEnabled(){return orderingEnabled;} public void setOrderingEnabled(Boolean e){this.orderingEnabled=e;}
    }

    public static class StatusUpdateRequest {
        private String status;
        public String getStatus(){return status;} public void setStatus(String s){this.status=s;}
    }
}
