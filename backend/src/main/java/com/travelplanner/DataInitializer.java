package com.travelplanner;

import com.travelplanner.entity.Booking;
import com.travelplanner.entity.Role;
import com.travelplanner.entity.User;
import com.travelplanner.repository.BookingRepository;
import com.travelplanner.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, BookingRepository bookingRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            User admin = new User(
                    "Admin Officer",
                    "admin@journey.com",
                    passwordEncoder.encode("admin123"),
                    Role.ROLE_ADMIN
            );
            userRepository.save(admin);

            User traveler = new User(
                    "Aarav Sharma",
                    "traveler@journey.com",
                    passwordEncoder.encode("traveler123"),
                    Role.ROLE_TRAVELER
            );
            userRepository.save(traveler);

            User student = new User(
                    "Priya Patel",
                    "student@journey.com",
                    passwordEncoder.encode("student123"),
                    Role.ROLE_TRAVELER
            );
            userRepository.save(student);

            // Seed sample booking for demonstration
            Booking sample = new Booking();
            sample.setBookingRef("JNY-DEMO01");
            sample.setUser(traveler);
            sample.setPassengerName("Aarav Sharma");
            sample.setPassengerEmail("traveler@journey.com");
            sample.setOrigin("Pune");
            sample.setDestination("Delhi");
            sample.setTravelDate(LocalDate.now().plusDays(2));
            sample.setDepartureTime(LocalDate.now().plusDays(2) + " 06:15");
            sample.setArrivalTime(LocalDate.now().plusDays(2) + " 17:30");
            sample.setDurationMin(675);
            sample.setTransfers(1);
            sample.setTotalFare(2450);
            sample.setCo2Kg(45.2);
            sample.setModeSummary("Train + Flight");
            sample.setItineraryDetails("Pune -> Mumbai [Train 12128 Intercity] -> Delhi [Flight 6E-204]");
            sample.setPlannedLegs("T_MMR_NGP_1|Manmad|Nagpur|390|750\n");
            sample.setStatus("CONFIRMED");
            bookingRepository.save(sample);

            System.out.println(">>> Demo users & sample booking seeded successfully!");
            System.out.println("    Admin:    admin@journey.com / admin123");
            System.out.println("    Traveler: traveler@journey.com / traveler123");
        }
    }
}
