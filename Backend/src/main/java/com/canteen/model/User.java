package com.canteen.model;
import jakarta.persistence.*;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false) private String name;
    @Column(nullable = false, unique = true) private String email;
    @Column(nullable = false) private String password;
    private String phone;
    @Enumerated(EnumType.STRING) @Column(nullable = false) private Role role;
    @Column(nullable = false) private Double walletBalance = 0.0;
    @Column(nullable = false) private Boolean active = true;

    public enum Role { ADMIN, EMPLOYEE, CUSTOMER }
    public User() {}

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public String getEmail() { return email; } public void setEmail(String e) { this.email = e; }
    public String getPassword() { return password; } public void setPassword(String p) { this.password = p; }
    public String getPhone() { return phone; } public void setPhone(String p) { this.phone = p; }
    public Role getRole() { return role; } public void setRole(Role r) { this.role = r; }
    public Double getWalletBalance() { return walletBalance; } public void setWalletBalance(Double w) { this.walletBalance = w; }
    public Boolean getActive() { return active; } public void setActive(Boolean a) { this.active = a; }

    public static Builder builder() { return new Builder(); }
    public static class Builder {
        private Long id; private String name, email, password, phone;
        private Role role; private Double walletBalance = 0.0; private Boolean active = true;
        public Builder id(Long id) { this.id = id; return this; }
        public Builder name(String n) { this.name = n; return this; }
        public Builder email(String e) { this.email = e; return this; }
        public Builder password(String p) { this.password = p; return this; }
        public Builder phone(String p) { this.phone = p; return this; }
        public Builder role(Role r) { this.role = r; return this; }
        public Builder walletBalance(Double w) { this.walletBalance = w; return this; }
        public Builder active(Boolean a) { this.active = a; return this; }
        public User build() {
            User u = new User(); u.id=id; u.name=name; u.email=email;
            u.password=password; u.phone=phone; u.role=role;
            u.walletBalance=walletBalance; u.active=active; return u;
        }
    }
}
