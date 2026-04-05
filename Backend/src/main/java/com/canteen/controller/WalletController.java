package com.canteen.controller;

import com.canteen.dto.DTO.*;
import com.canteen.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getBalance(Authentication auth) {
        return ResponseEntity.ok(walletService.getBalance(auth.getName()));
    }

    @PostMapping("/recharge")
    public ResponseEntity<Map<String, Object>> recharge(Authentication auth,
                                                         @RequestBody RechargeRequest req) {
        return ResponseEntity.ok(walletService.recharge(auth.getName(), req));
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<TransactionResponse>> transactions(Authentication auth) {
        return ResponseEntity.ok(walletService.getTransactions(auth.getName()));
    }
}
