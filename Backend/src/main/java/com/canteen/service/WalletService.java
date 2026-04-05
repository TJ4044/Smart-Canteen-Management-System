package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.*;
import com.canteen.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepo;
    private final TransactionRepository txnRepo;

    @Transactional
    public Map<String, Object> recharge(String email, RechargeRequest req) {
        if (req.getAmount() == null || req.getAmount() <= 0)
            throw new RuntimeException("Invalid amount");
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setWalletBalance(user.getWalletBalance() + req.getAmount());
        userRepo.save(user);
        txnRepo.save(Transaction.builder()
                .user(user).type(Transaction.TransactionType.RECHARGE)
                .amount(req.getAmount()).description("Wallet recharge")
                .createdAt(LocalDateTime.now()).build());
        return Map.of("walletBalance", user.getWalletBalance(), "message", "Recharge successful");
    }

    public Map<String, Object> getBalance(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return Map.of("walletBalance", user.getWalletBalance());
    }

    public List<TransactionResponse> getTransactions(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return txnRepo.findByUserOrderByCreatedAtDesc(user)
                .stream().map(TransactionResponse::from).toList();
    }
}
