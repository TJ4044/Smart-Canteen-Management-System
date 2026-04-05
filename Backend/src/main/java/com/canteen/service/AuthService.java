package com.canteen.service;
import com.canteen.dto.DTO.*;
import com.canteen.model.User;
import com.canteen.repository.UserRepository;
import com.canteen.security.JwtUtil;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepo;
    private final PasswordEncoder encoder;
    private final AuthenticationManager authManager;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepo, PasswordEncoder encoder,
                       AuthenticationManager authManager, JwtUtil jwtUtil) {
        this.userRepo = userRepo;
        this.encoder = encoder;
        this.authManager = authManager;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest req) {
        if (userRepo.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already registered");
        User user = User.builder()
                .name(req.getName()).email(req.getEmail())
                .password(encoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(req.getRole() != null ? req.getRole() : User.Role.CUSTOMER)
                .walletBalance(0.0).active(true).build();
        userRepo.save(user);
        return AuthResponse.from(user, jwtUtil.generateToken(user.getEmail()));
    }

    public AuthResponse login(LoginRequest req) {
        authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));
        User user = userRepo.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return AuthResponse.from(user, jwtUtil.generateToken(user.getEmail()));
    }
}
