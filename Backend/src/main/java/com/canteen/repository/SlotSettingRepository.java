package com.canteen.repository;
import com.canteen.model.SlotSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.Optional;

public interface SlotSettingRepository extends JpaRepository<SlotSetting, Long> {
    Optional<SlotSetting> findByDate(LocalDate date);
}
