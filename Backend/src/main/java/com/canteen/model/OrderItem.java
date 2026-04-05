package com.canteen.model;
import jakarta.persistence.*;
@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "order_id", nullable = false) private Order order;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "food_item_id", nullable = false) private FoodItem foodItem;
    @Column(nullable = false) private Integer quantity;
    @Column(nullable = false) private Double unitPrice;
    @Column(nullable = false) private Double subtotal;
    public OrderItem() {}
    public Long getId(){return id;} public void setId(Long id){this.id=id;}
    public Order getOrder(){return order;} public void setOrder(Order o){this.order=o;}
    public FoodItem getFoodItem(){return foodItem;} public void setFoodItem(FoodItem f){this.foodItem=f;}
    public Integer getQuantity(){return quantity;} public void setQuantity(Integer q){this.quantity=q;}
    public Double getUnitPrice(){return unitPrice;} public void setUnitPrice(Double u){this.unitPrice=u;}
    public Double getSubtotal(){return subtotal;} public void setSubtotal(Double s){this.subtotal=s;}
    public static Builder builder(){return new Builder();}
    public static class Builder {
        private Long id; private Order order; private FoodItem foodItem;
        private Integer quantity; private Double unitPrice, subtotal;
        public Builder id(Long id){this.id=id;return this;} public Builder order(Order o){this.order=o;return this;}
        public Builder foodItem(FoodItem f){this.foodItem=f;return this;} public Builder quantity(Integer q){this.quantity=q;return this;}
        public Builder unitPrice(Double u){this.unitPrice=u;return this;} public Builder subtotal(Double s){this.subtotal=s;return this;}
        public OrderItem build(){OrderItem oi=new OrderItem();oi.id=id;oi.order=order;oi.foodItem=foodItem;oi.quantity=quantity;oi.unitPrice=unitPrice;oi.subtotal=subtotal;return oi;}
    }
}
