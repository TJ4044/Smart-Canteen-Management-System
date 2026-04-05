package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.*;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepo;
    private final FoodItemRepository foodRepo;
    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;

    @Transactional
    public OrderResponse placeOrder(String email, PlaceOrderRequest req) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Build order items and calculate total
        List<OrderItem> items = new ArrayList<>();
        double total = 0.0;

        for (OrderItemRequest ir : req.getItems()) {
            FoodItem food = foodRepo.findById(ir.getFoodItemId())
                    .orElseThrow(() -> new RuntimeException("Food item not found: " + ir.getFoodItemId()));
            if (!food.getAvailable())
                throw new RuntimeException(food.getName() + " is not available");
            if (food.getStockQuantity() < ir.getQuantity())
                throw new RuntimeException("Insufficient stock for " + food.getName());

            double subtotal = food.getPrice() * ir.getQuantity();
            items.add(OrderItem.builder()
                    .foodItem(food).quantity(ir.getQuantity())
                    .unitPrice(food.getPrice()).subtotal(subtotal).build());
            total += subtotal;
            food.setStockQuantity(food.getStockQuantity() - ir.getQuantity());
            foodRepo.save(food);
        }

        // Handle payment
        Order.PaymentMethod pm = Order.PaymentMethod.valueOf(
                req.getPaymentMethod() != null ? req.getPaymentMethod().toUpperCase() : "CASH");
        if (pm == Order.PaymentMethod.WALLET) {
            if (user.getWalletBalance() < total)
                throw new RuntimeException("Insufficient wallet balance");
            user.setWalletBalance(user.getWalletBalance() - total);
            userRepo.save(user);
            txnRepo.save(Transaction.builder()
                    .user(user).type(Transaction.TransactionType.PAYMENT)
                    .amount(-total).description("Order payment")
                    .createdAt(LocalDateTime.now()).build());
        }

        Order order = Order.builder()
                .user(user).totalAmount(total)
                .status(Order.OrderStatus.PENDING)
                .paymentMethod(pm)
                .notes(req.getNotes())
                .createdAt(LocalDateTime.now())
                .build();
        order = orderRepo.save(order);

        // Link items to order
        for (OrderItem item : items) {
            item.setOrder(order);
        }
        order.setItems(items);
        return OrderResponse.from(orderRepo.save(order));
    }

    public List<OrderResponse> getMyOrders(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return orderRepo.findByUserOrderByCreatedAtDesc(user)
                .stream().map(OrderResponse::from).toList();
    }

    public List<OrderResponse> getAllOrders() {
        return orderRepo.findAllByOrderByCreatedAtDesc()
                .stream().map(OrderResponse::from).toList();
    }

    public List<OrderResponse> getActiveOrders() {
        List<Order> pending   = orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.PENDING);
        List<Order> confirmed = orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.CONFIRMED);
        List<Order> preparing = orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.PREPARING);
        List<Order> ready     = orderRepo.findByStatusOrderByCreatedAtDesc(Order.OrderStatus.READY);
        List<Order> combined  = new ArrayList<>();
        combined.addAll(pending); combined.addAll(confirmed);
        combined.addAll(preparing); combined.addAll(ready);
        return combined.stream().map(OrderResponse::from).toList();
    }

    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(Order.OrderStatus.valueOf(status.toUpperCase()));
        order.setUpdatedAt(LocalDateTime.now());

        // Refund wallet if cancelled and paid by wallet
        if (order.getStatus() == Order.OrderStatus.CANCELLED
                && order.getPaymentMethod() == Order.PaymentMethod.WALLET) {
            User user = order.getUser();
            user.setWalletBalance(user.getWalletBalance() + order.getTotalAmount());
            userRepo.save(user);
            txnRepo.save(Transaction.builder()
                    .user(user).type(Transaction.TransactionType.REFUND)
                    .amount(order.getTotalAmount()).description("Order #" + id + " cancellation refund")
                    .createdAt(LocalDateTime.now()).build());
        }
        return OrderResponse.from(orderRepo.save(order));
    }

    public OrderResponse getById(Long id) {
        return OrderResponse.from(orderRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found")));
    }
}
