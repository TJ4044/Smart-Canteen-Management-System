package com.canteen.controller;
import com.canteen.dto.DTO.*;
import com.canteen.model.SlotSetting;
import com.canteen.service.SlotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController @RequestMapping("/api/slots")
public class SlotController {
    private final SlotService slotService;
    public SlotController(SlotService s) { this.slotService = s; }

    /** Customer / all — get today's slot availability */
    @GetMapping
    public ResponseEntity<List<SlotAvailabilityResponse>> getSlots() {
        return ResponseEntity.ok(slotService.getTodaySlots());
    }

    /** Admin — get current slot settings */
    @GetMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SlotSetting> getSettings() {
        return ResponseEntity.ok(slotService.getTodaySetting());
    }

    /** Admin — update slot settings */
    @PatchMapping("/settings")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SlotSetting> updateSettings(@RequestBody SlotSettingRequest req) {
        return ResponseEntity.ok(slotService.updateSettings(req));
    }

    /** Admin — toggle ordering on/off instantly */
    @PatchMapping("/toggle-ordering")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String,Object>> toggleOrdering() {
        SlotSetting s = slotService.getTodaySetting();
        SlotSettingRequest req = new SlotSettingRequest();
        req.setOrderingEnabled(!s.getOrderingEnabled());
        slotService.updateSettings(req);
        return ResponseEntity.ok(Map.of(
            "orderingEnabled", !s.getOrderingEnabled(),
            "message", "Ordering " + (!s.getOrderingEnabled() ? "enabled" : "disabled")
        ));
    }
}
