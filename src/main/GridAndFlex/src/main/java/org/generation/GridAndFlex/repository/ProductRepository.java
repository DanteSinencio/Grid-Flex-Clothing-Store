package org.generation.GridAndFlex.repository;


import org.generation.GridAndFlex.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Integer> {
}