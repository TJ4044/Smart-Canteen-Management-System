package com.canteen.service;
import com.canteen.dto.DTO.*;
import com.canteen.model.*;
import com.canteen.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {
    private final OrderRepository orderRepo;
    private final FoodItemRepository foodRepo;
    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;

    public OrderService(OrderRepository orderRepo, FoodItemRepository foodRepo,
                        UserRepository userRepo, TransactionRepository txnRepo) {
        this.orderRepo = orderRepo;
        this.foodRepo = foodRepo;
        this.userRepo = userRepo;
        this.txnRepo = txnRepo;
    }

    @Transactional
    public OrderResponse placeOrder(String email, PlaceOrderRequest req) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        List<OrderItem> items = new ArrayList<>();
        double total = 0.0;
        for (OrderItemRequest ir : req.getItems()) {
            FoodItem food = foodRepo.findById(ir.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found"));
            if (!food.getAvailable()) throw new RuntimeException(food.getName() + " is not available");
            if (food.getStockQuantity() < ir.getQuantity()) throw new RuntimeException("Insufficient stock for " + food.getName());
            double subtotal = food.getPrice() * ir.getQuantity();
            OrderItem oi = OrderItem.builder().foodItem(food).quantity(ir.getQuantity())
                    .unitPrice(food.getPrice()).subtotal(subtotal).build();
            items.add(oi);
            total += subtotal;
            food.setStockQuantity(food.getStockQuantity() - ir.getQuantity());
            foodRepo.save(food);
        }
        Order.PaymentMethod pm = Order.PaymentMethod.valueOf(
                req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "CASH");
        if (pm == Order.PaymentMethod.WALLET) {
            if (user.getWalletBalance() < total) throw new RuntimeException("Insufficient wallet balance");
            user.setWalletBalance(user.getWalletBalance() - total);
            userRepo.save(user);
            txnRepo.save(Transaction.builder().user(user).type(Transaction.TransactionType.PAYMENT)
                    .amount(-total).description("Order payment").createdAt(LocalDateTime.now()).build());
        }
        Order order = Order.builder().user(user).totalAmount(total)
                .status(Order.OrderStatus.PENDING).paymentMethod(pm)
                .notes(req.getNotes()).createdAt(LocalDateTime.now()).build();
        order = orderRepo.save(order);
        for (OrderItem item : items) { item.setOrder(order); }
        order.setItems(items);
        return OrderResponse.from(orderRepo.save(order));
    }

    public List<OrderResponse> getMyOrders(String email) {
        User user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepo.findByUserOrderByCreatedAtDesc(user).stream().map(OrderResponse::from).toList();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAllByOrderByCreatedAtDesc().stream().map(OrderResponse::from).toList();
    }

    public List<OrderResponse> getActiveOrders() {
        List<Order> all = new ArrayList<>();
        all.addAll(orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.PENDING));
        all.addAll(orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.CONFIRMED));
        all.addAll(orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.PREPARING));
        all.addAll(orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.READY));
        return all.stream().map(OrderResponse::from).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        order.setUpdatedAt(LocalDateTime.now());
        if (order.getStatus() == Order.OrderStatus.CANCELLED
                && order.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            User user = order.getUser();
            user.setWalletBalance(user.getWalletBalance() + order.getTotalAmount());
            userRepo.save(user);
            txnRepo.save(Transaction.builder().user(user).type(Transaction.TransactionType.REFUND)
                    .amount(order.getTotalAmount()).description("Order #" + id + " refund")
                    .createdAt(LocalDateTime.now()).build());
        }
        return OrderResponse.from(orderRepo.save(order));
    }

    public OrderResponse getById(Long id) {
        return OrderResponse.from(orderRepo.findById(id).orElseThrow(() -> new RuntimeException("Order not found")));
    }
}
