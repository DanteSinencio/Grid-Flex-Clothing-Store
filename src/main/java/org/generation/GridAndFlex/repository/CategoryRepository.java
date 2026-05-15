package org.generation.GridAndFlex.repository;

import org.generation.GridAndFlex.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByNombreIgnoreCase(String nombre);
}
