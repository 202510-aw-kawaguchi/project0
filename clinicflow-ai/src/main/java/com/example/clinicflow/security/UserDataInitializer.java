package com.example.clinicflow.security;

import com.example.clinicflow.user.AppUser;
import com.example.clinicflow.user.AppUserRepository;
import java.util.Optional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class UserDataInitializer {

    @Bean
    public CommandLineRunner initUsers(AppUserRepository appUserRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            Optional<AppUser> adminUser = appUserRepository.findByUsername("admin");
            if (adminUser.isPresent()) {
                AppUser current = adminUser.get();
                current.setPassword(passwordEncoder.encode("piyo1212"));
                if (current.getRole() == null || current.getRole().isBlank()) {
                    current.setRole("ROLE_ADMIN");
                }
                appUserRepository.save(current);
                return;
            }

            AppUser admin = new AppUser(
                    "admin",
                    passwordEncoder.encode("piyo1212"),
                    "ROLE_ADMIN"
            );
            appUserRepository.save(admin);
        };
    }
}
