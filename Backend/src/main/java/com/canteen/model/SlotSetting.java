package com.canteen.model;
import jakarta.persistence.*;
import java.time.LocalDate;

/**
 * NEW MODEL — Admin can configure slot capacity for any date.
 * Controls how many orders are allowed per time slot.
 */
@Entity
@Table(name = "slot_settings")
public class SlotSetting {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private LocalDate date;
    @Column(nullable = false) private Integer maxOrdersPerSlot = 20;
    @Column(nullable = false) private Integer slotDurationMinutes = 10;
    private String peakStartTime = "13:00";
    private String peakEndTime   = "14:00";
    private Boolean orderingEnabled = true;

    public SlotSetting() {}

    public Long getId() { return id; } public void setId(Long id) { this.id = id; }
    public LocalDate getDate() { return date; } public void setDate(LocalDate d) { this.date = d; }
    public Integer getMaxOrdersPerSlot() { return maxOrdersPerSlot; } public void setMaxOrdersPerSlot(Integer m) { this.maxOrdersPerSlot = m; }
    public Integer getSlotDurationMinutes() { return slotDurationMinutes; } public void setSlotDurationMinutes(Integer s) { this.slotDurationMinutes = s; }
    public String getPeakStartTime() { return peakStartTime; } public void setPeakStartTime(String t) { this.peakStartTime = t; }
    public String getPeakEndTime() { return peakEndTime; } public void setPeakEndTime(String t) { this.peakEndTime = t; }
    public Boolean getOrderingEnabled() { return orderingEnabled; } public void setOrderingEnabled(Boolean e) { this.orderingEnabled = e; }
}
