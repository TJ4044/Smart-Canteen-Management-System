package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.*;
import com.canteen.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class OrderService {

    private final OrderRepository     orderRepo;
    private final FoodItemRepository  foodRepo;
    private final UserRepository      userRepo;
    private final TransactionRepository txnRepo;
    private final SlotService         slotService;

    public OrderService(OrderRepository orderRepo, FoodItemRepository foodRepo,
                        UserRepository userRepo, TransactionRepository txnRepo,
                        SlotService slotService) {
        this.orderRepo   = orderRepo;   this.foodRepo  = foodRepo;
        this.userRepo    = userRepo;    this.txnRepo   = txnRepo;
        this.slotService = slotService;
    }

    // ═══════════════════════════════════════════════════════
    // PLACE ORDER — with token, slot, priority, pre-order
    // ═══════════════════════════════════════════════════════
    @Transactional
    public OrderResponse placeOrder(String email, PlaceOrderRequest req) {

        // 1. Check ordering is enabled by admin
        if (!slotService.isOrderingEnabled())
            throw new RuntimeException("Ordering is currently disabled by admin. Please try later.");

        // 2. Get user
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 3. Build order items + calculate total + priority score
        List<OrderItem> items      = new ArrayList<>();
        double total               = 0.0;
        int    totalPriorityScore  = 0;
        int    maxPrepTime         = 0;

        for (OrderItemRequest ir : req.getItems()) {
            FoodItem food = foodRepo.findById(ir.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found: " + ir.getFoodItemId()));

            if (!food.getAvailable())
                throw new RuntimeException(food.getName() + " is currently not available.");
            if (food.getStockQuantity() < ir.getQuantity())
                throw new RuntimeException("Insufficient stock for: " + food.getName());

            double subtotal = food.getPrice() * ir.getQuantity();
            total          += subtotal;

            // Priority = prepTime × quantity (longer items get higher priority)
            int itemPriority = food.getPrepTimeMinutes() * ir.getQuantity();
            totalPriorityScore += itemPriority;
            if (food.getPrepTimeMinutes() > maxPrepTime)
                maxPrepTime = food.getPrepTimeMinutes();

            items.add(OrderItem.builder()
                    .foodItem(food).quantity(ir.getQuantity())
                    .unitPrice(food.getPrice()).subtotal(subtotal).build());

            // Deduct stock
            food.setStockQuantity(food.getStockQuantity() - ir.getQuantity());
            foodRepo.save(food);
        }

        // 4. Handle payment
        Order.PaymentMethod pm = Order.PaymentMethod.valueOf(
                req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "CASH");

        if (pm == Order.PaymentMethod.WALLET) {
            if (user.getWalletBalance() < total)
                throw new RuntimeException("Insufficient wallet balance. Please recharge.");
            user.setWalletBalance(user.getWalletBalance() - total);
            userRepo.save(user);
            txnRepo.save(Transaction.builder()
                    .user(user).type(Transaction.TransactionType.PAYMENT)
                    .amount(-total).description("Order payment")
                    .createdAt(LocalDateTime.now()).build());
        }

        // 5. Assign time slot (requested or auto-assigned)
        String assignedSlot = slotService.assignSlot(req.getScheduledPickupTime());

        // 6. Assign token number (sequential per day)
        Integer token = (orderRepo.maxTokenToday(LocalDateTime.now()) + 1);

        // 7. Compute estimated ready time
        LocalTime estimatedReady = slotService.computeEstimatedReadyTime(assignedSlot, maxPrepTime);

        // 8. Scheduled pickup time from request
        LocalTime pickupTime = null;
        if (req.getScheduledPickupTime() != null && !req.getScheduledPickupTime().isBlank()) {
            try { pickupTime = LocalTime.parse(req.getScheduledPickupTime()); }
            catch (Exception ignored) {}
        }

        // 9. Save order
        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .paymentMethod(pm)
                .notes(req.getNotes())
                .createdAt(LocalDateTime.now())
                .tokenNumber(token)
                .timeSlot(assignedSlot)
                .scheduledPickupTime(pickupTime)
                .estimatedReadyTime(estimatedReady)
                .priorityScore(totalPriorityScore)
                .build();

        order = orderRepo.save(order);
        for (OrderItem item : items) item.setOrder(order);
        order.setItems(items);
        return OrderResponse.from(orderRepo.save(order));
    }

    // ═══════════════════════════════════════════════════════
    // GET MY ORDERS
    // ═══════════════════════════════════════════════════════
    public List<OrderResponse> getMyOrders(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepo.findByUserOrderByCreatedAtDesc(user)
                .stream().map(OrderResponse::from).toList();
    }

    // ═══════════════════════════════════════════════════════
    // GET ALL ORDERS (admin)
    // ═══════════════════════════════════════════════════════
    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(OrderResponse::from).toList();
    }

    // ═══════════════════════════════════════════════════════
    // GET ACTIVE ORDERS — sorted by priority (employee view)
    // ═══════════════════════════════════════════════════════
    public List<OrderResponse> getActiveOrders() {
        List<Order> all = new ArrayList<>();
        // Get pending + confirmed + preparing + ready, each sorted by priorityScore DESC
        for (Order.OrderStatus s : List.of(
                Order.OrderStatus.PENDING,
                Order.OrderStatus.CONFIRMED,
                Order.OrderStatus.PREPARING,
                Order.OrderStatus.READY)) {
            all.addAll(orderRepo.findByStatusOrderByPriorityScoreDescCreatedAtAsc(s));
        }
        return all.stream().map(OrderResponse::from).toList();
    }

    // ═══════════════════════════════════════════════════════
    // UPDATE ORDER STATUS
    // ═══════════════════════════════════════════════════════
    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Order.OrderStatus newStatus = Order.OrderStatus.valueOf(status.toUpperCase());
        order.setStatus(newStatus);
        order.setUpdatedAt(LocalDateTime.now());

        // Auto-refund on cancellation for wallet payments
        if (newStatus == Order.OrderStatus.CANCELLED
                && order.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            User user = order.getUser();
            user.setWalletBalance(user.getWalletBalance() + order.getTotalAmount());
            userRepo.save(user);
            txnRepo.save(Transaction.builder()
                    .user(user).type(Transaction.TransactionType.REFUND)
                    .amount(order.getTotalAmount())
                    .description("Refund for cancelled Order #" + id)
                    .createdAt(LocalDateTime.now()).build());
        }
        return OrderResponse.from(orderRepo.save(order));
    }

    public OrderResponse getById(Long id) {
        return OrderResponse.from(orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found")));
    }
}
