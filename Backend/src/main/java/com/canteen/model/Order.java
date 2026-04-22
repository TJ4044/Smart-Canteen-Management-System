package com.canteen.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> items;

    @Column(nullable = false) private Double totalAmount;

    @Enumerated(EnumType.STRING) @Column(nullable = false)
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING) private PaymentMethod paymentMethod;

    private String notes;

    @Column(nullable = false) private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // ── NEW FIELDS ────────────────────────────────────────────
    /** Auto-assigned queue token number for pickup */
    private Integer tokenNumber;

    /** Time slot the order belongs to e.g. "13:00", "13:10" */
    private String timeSlot;

    /** Customer-requested scheduled pickup time */
    private LocalTime scheduledPickupTime;

    /** Estimated time order will be ready based on prep times */
    private LocalTime estimatedReadyTime;

    /** Priority score — higher means cook first (longer prep items) */
    private Integer priorityScore = 0;

    public enum OrderStatus { PENDING, CONFIRMED, PREPARING, READY, DELIVERED, CANCELLED }
    public enum PaymentMethod { WALLET, CASH }

    public Order() {}

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public List<OrderItem> getItems() { return items; } public void setItems(List<OrderItem> i) { this.items = i; }
    public Double getTotalAmount() { return totalAmount; } public void setTotalAmount(Double t) { this.totalAmount = t; }
    public OrderStatus getStatus() { return status; } public void setStatus(OrderStatus s) { this.status = s; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; } public void setPaymentMethod(PaymentMethod p) { this.paymentMethod = p; }
    public String getNotes() { return notes; } public void setNotes(String n) { this.notes = n; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }
    public LocalDateTime getUpdatedAt() { return updatedAt; } public void setUpdatedAt(LocalDateTime u) { this.updatedAt = u; }
    public Integer getTokenNumber() { return tokenNumber; } public void setTokenNumber(Integer t) { this.tokenNumber = t; }
    public String getTimeSlot() { return timeSlot; } public void setTimeSlot(String t) { this.timeSlot = t; }
    public LocalTime getScheduledPickupTime() { return scheduledPickupTime; } public void setScheduledPickupTime(LocalTime t) { this.scheduledPickupTime = t; }
    public LocalTime getEstimatedReadyTime() { return estimatedReadyTime; } public void setEstimatedReadyTime(LocalTime t) { this.estimatedReadyTime = t; }
    public Integer getPriorityScore() { return priorityScore; } public void setPriorityScore(Integer p) { this.priorityScore = p; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private User user; private List<OrderItem> items;
        private Double totalAmount; private OrderStatus status = OrderStatus.PENDING;
        private PaymentMethod paymentMethod; private String notes;
        private LocalDateTime createdAt, updatedAt;
        private Integer tokenNumber; private String timeSlot;
        private LocalTime scheduledPickupTime, estimatedReadyTime;
        private Integer priorityScore = 0;
        public Builder id(Long id){this.id=id;return this;}
        public Builder user(User u){this.user=u;return this;}
        public Builder items(List<OrderItem> i){this.items=i;return this;}
        public Builder totalAmount(Double t){this.totalAmount=t;return this;}
        public Builder status(OrderStatus s){this.status=s;return this;}
        public Builder paymentMethod(PaymentMethod p){this.paymentMethod=p;return this;}
        public Builder notes(String n){this.notes=n;return this;}
        public Builder createdAt(LocalDateTime c){this.createdAt=c;return this;}
        public Builder updatedAt(LocalDateTime u){this.updatedAt=u;return this;}
        public Builder tokenNumber(Integer t){this.tokenNumber=t;return this;}
        public Builder timeSlot(String t){this.timeSlot=t;return this;}
        public Builder scheduledPickupTime(LocalTime t){this.scheduledPickupTime=t;return this;}
        public Builder estimatedReadyTime(LocalTime t){this.estimatedReadyTime=t;return this;}
        public Builder priorityScore(Integer p){this.priorityScore=p;return this;}
        public Order build() {
            Order o = new Order(); o.id=id; o.user=user; o.items=items;
            o.totalAmount=totalAmount; o.status=status; o.paymentMethod=paymentMethod;
            o.notes=notes; o.createdAt=createdAt; o.updatedAt=updatedAt;
            o.tokenNumber=tokenNumber; o.timeSlot=timeSlot;
            o.scheduledPickupTime=scheduledPickupTime;
            o.estimatedReadyTime=estimatedReadyTime;
            o.priorityScore=priorityScore; return o;
        }
    }
}
