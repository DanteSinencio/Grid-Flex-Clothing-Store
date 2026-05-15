package org.generation.GridAndFlex.repository;

import org.generation.GridAndFlex.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByCorreoIgnoreCase(String correo);
}
