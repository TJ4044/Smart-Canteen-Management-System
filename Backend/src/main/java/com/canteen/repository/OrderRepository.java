package com.canteen.repository;
import com.canteen.model.Order;
import com.canteen.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByStatusOrderByPriorityScoreDescCreatedAtAsc(Order.OrderStatus status);
    List<Order> findAllByOrderByCreatedAtDesc();

    // Count orders in a specific time slot today
    @Query("SELECT COUNT(o) FROM Order o WHERE o.timeSlot = :slot AND DATE(o.createdAt) = DATE(:now) AND o.status != 'CANCELLED'")
    Long countOrdersInSlot(@Param("slot") String slot, @Param("now") LocalDateTime now);

    // Today's token count
    @Query("SELECT COUNT(o) FROM Order o WHERE DATE(o.createdAt) = DATE(:now) AND o.status != 'CANCELLED'")
    Long countTodaysOrders(@Param("now") LocalDateTime now);

    // Max token today
    @Query("SELECT COALESCE(MAX(o.tokenNumber), 0) FROM Order o WHERE DATE(o.createdAt) = DATE(:now)")
    Integer maxTokenToday(@Param("now") LocalDateTime now);

    @Query("SELECT SUM(o.totalAmount) FROM Order o WHERE o.status != 'CANCELLED'")
    Double getTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o WHERE o.status IN ('PENDING','CONFIRMED','PREPARING','READY')")
    Long countActiveOrders();

    // Slot availability for a given date
    @Query("SELECT o.timeSlot, COUNT(o) FROM Order o WHERE DATE(o.createdAt) = DATE(:now) AND o.status != 'CANCELLED' GROUP BY o.timeSlot")
    List<Object[]> getSlotCounts(@Param("now") LocalDateTime now);

    Optional<Order> findByIdAndUser(Long id, User user);
}
