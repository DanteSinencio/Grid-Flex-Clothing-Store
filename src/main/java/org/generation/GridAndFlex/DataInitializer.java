package org.generation.GridAndFlex;

import org.generation.GridAndFlex.model.Category;
import org.generation.GridAndFlex.model.Role;
import org.generation.GridAndFlex.model.User;
import org.generation.GridAndFlex.repository.CategoryRepository;
import org.generation.GridAndFlex.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    public static final String ADMIN_EMAIL = "admin@gridflex.com";
    public static final String ADMIN_PASSWORD = "Admin123#";

    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public DataInitializer(CategoryRepository categoryRepository, UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedAdmin();
    }

    private void seedCategories() {
        List<String> categories = List.of(
                "Playeras",
                "Pantalones",
                "Sudaderas",
                "Vestidos",
                "Calzado",
                "Accesorios",
                "Ropa deportiva",
                "Ropa formal",
                "Ropa de invierno",
                "Ropa casual"
        );

        for (String categoryName : categories) {
            if (!categoryRepository.existsByNombreIgnoreCase(categoryName)) {
                categoryRepository.save(new Category(categoryName));
            }
        }
    }

    private void seedAdmin() {
        if (!userRepository.existsByCorreoIgnoreCase(ADMIN_EMAIL)) {
            User admin = new User(Role.admin, "Admin", "GridFlex", ADMIN_EMAIL, "0000000000", ADMIN_PASSWORD);
            userRepository.save(admin);
        }
    }
}
