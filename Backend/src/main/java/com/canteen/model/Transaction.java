package com.canteen.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "user_id", nullable = false) private User user;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private TransactionType type;
    @Column(nullable = false) private Double amount;
    private String description;
    @Column(nullable = false) private LocalDateTime createdAt;

    public enum TransactionType { RECHARGE, PAYMENT, REFUND }
    public Transaction() {}

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public User getUser() { return user; } public void setUser(User u) { this.user = u; }
    public TransactionType getType() { return type; } public void setType(TransactionType t) { this.type = t; }
    public Double getAmount() { return amount; } public void setAmount(Double a) { this.amount = a; }
    public String getDescription() { return description; } public void setDescription(String d) { this.description = d; }
    public LocalDateTime getCreatedAt() { return createdAt; } public void setCreatedAt(LocalDateTime c) { this.createdAt = c; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private User user; private TransactionType type;
        private Double amount; private String description; private LocalDateTime createdAt;
        public Builder user(User u){this.user=u;return this;}
        public Builder type(TransactionType t){this.type=t;return this;}
        public Builder amount(Double a){this.amount=a;return this;}
        public Builder description(String d){this.description=d;return this;}
        public Builder createdAt(LocalDateTime c){this.createdAt=c;return this;}
        public Transaction build(){Transaction t=new Transaction();t.id=id;t.user=user;
            t.type=type;t.amount=amount;t.description=description;t.createdAt=createdAt;return t;}
    }
}
