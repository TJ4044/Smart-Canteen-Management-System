package com.canteen.service;

import com.canteen.dto.DTO.*;
import com.canteen.model.SlotSetting;
import com.canteen.repository.OrderRepository;
import com.canteen.repository.SlotSettingRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class SlotService {

    private final SlotSettingRepository slotRepo;
    private final OrderRepository orderRepo;

    public SlotService(SlotSettingRepository slotRepo, OrderRepository orderRepo) {
        this.slotRepo = slotRepo; this.orderRepo = orderRepo;
    }

    // ── Get or create today's slot setting ────────────────────
    public SlotSetting getTodaySetting() {
        return slotRepo.findByDate(LocalDate.now()).orElseGet(() -> {
            SlotSetting s = new SlotSetting();
            s.setDate(LocalDate.now());
            s.setMaxOrdersPerSlot(20);
            s.setSlotDurationMinutes(10);
            s.setPeakStartTime("13:00");
            s.setPeakEndTime("14:00");
            s.setOrderingEnabled(true);
            return slotRepo.save(s);
        });
    }

    // ── Get all available slots for today ─────────────────────
    public List<SlotAvailabilityResponse> getTodaySlots() {
        SlotSetting setting = getTodaySetting();
        List<SlotAvailabilityResponse> slots = new ArrayList<>();

        LocalTime start = LocalTime.parse(setting.getPeakStartTime());
        LocalTime end   = LocalTime.parse(setting.getPeakEndTime());
        int duration    = setting.getSlotDurationMinutes();

        // Get current order counts per slot
        List<Object[]> counts = orderRepo.getSlotCounts(LocalDateTime.now());
        Map<String, Long> slotCounts = new HashMap<>();
        for (Object[] row : counts) {
            slotCounts.put((String) row[0], (Long) row[1]);
        }

        LocalTime cursor = start;
        while (!cursor.isAfter(end.minusMinutes(duration))) {
            String slotKey = cursor.format(DateTimeFormatter.ofPattern("HH:mm"));
            long count = slotCounts.getOrDefault(slotKey, 0L);
            slots.add(new SlotAvailabilityResponse(slotKey, (int) count, setting.getMaxOrdersPerSlot()));
            cursor = cursor.plusMinutes(duration);
        }
        return slots;
    }

    // ── Assign best slot for a new order ─────────────────────
    public String assignSlot(String requestedSlot) {
        SlotSetting setting = getTodaySetting();
        LocalDateTime now   = LocalDateTime.now();

        if (requestedSlot != null && !requestedSlot.isBlank()) {
            // Check if requested slot has capacity
            long count = orderRepo.countOrdersInSlot(requestedSlot, now);
            if (count < setting.getMaxOrdersPerSlot()) return requestedSlot;
            // Requested slot full — find next available
        }

        // Auto-assign: find first slot with capacity starting from now or peak start
        LocalTime start = LocalTime.parse(setting.getPeakStartTime());
        LocalTime end   = LocalTime.parse(setting.getPeakEndTime());
        int duration    = setting.getSlotDurationMinutes();

        // If current time is past peak start, start from next upcoming slot
        LocalTime earliest = LocalTime.now().isAfter(start) ?
            roundUpToNextSlot(LocalTime.now(), duration) : start;

        LocalTime cursor = earliest;
        while (!cursor.isAfter(end.minusMinutes(duration))) {
            String slotKey = cursor.format(DateTimeFormatter.ofPattern("HH:mm"));
            long count = orderRepo.countOrdersInSlot(slotKey, now);
            if (count < setting.getMaxOrdersPerSlot()) return slotKey;
            cursor = cursor.plusMinutes(duration);
        }

        // All slots full — append to last slot anyway (overflow)
        return end.minusMinutes(duration).format(DateTimeFormatter.ofPattern("HH:mm"));
    }

    // ── Compute estimated ready time from slot + max prep ─────
    public LocalTime computeEstimatedReadyTime(String slot, int maxPrepMinutes) {
        if (slot == null) return LocalTime.now().plusMinutes(maxPrepMinutes);
        LocalTime slotTime = LocalTime.parse(slot);
        return slotTime.plusMinutes(maxPrepMinutes);
    }

    // ── Round time up to next slot boundary ───────────────────
    private LocalTime roundUpToNextSlot(LocalTime time, int slotMinutes) {
        int totalMinutes = time.getHour() * 60 + time.getMinute();
        int rounded = ((totalMinutes / slotMinutes) + 1) * slotMinutes;
        return LocalTime.of(rounded / 60, rounded % 60);
    }

    // ── Update slot settings (admin) ──────────────────────────
    public SlotSetting updateSettings(SlotSettingRequest req) {
        SlotSetting s = getTodaySetting();
        if (req.getMaxOrdersPerSlot() != null)   s.setMaxOrdersPerSlot(req.getMaxOrdersPerSlot());
        if (req.getSlotDurationMinutes() != null) s.setSlotDurationMinutes(req.getSlotDurationMinutes());
        if (req.getPeakStartTime() != null)       s.setPeakStartTime(req.getPeakStartTime());
        if (req.getPeakEndTime() != null)         s.setPeakEndTime(req.getPeakEndTime());
        if (req.getOrderingEnabled() != null)     s.setOrderingEnabled(req.getOrderingEnabled());
        return slotRepo.save(s);
    }

    public boolean isOrderingEnabled() {
        return getTodaySetting().getOrderingEnabled();
    }
}
