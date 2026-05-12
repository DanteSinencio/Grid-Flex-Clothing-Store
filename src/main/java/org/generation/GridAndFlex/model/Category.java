package org.generation.GridAndFlex.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Long idCategory;

    @Column(nullable = false, length = 45)
    private String nombre;

    // 1. Constructor vacío
    public Category() {
    }

    // 2. Constructor con parámetros
    public Category(String nombre) {
        this.nombre = nombre;
    }

    // 3. Getters y Setters
    public Long getIdCategory() {
        return idCategory;
    }

    public void setIdCategory(Long idCategory) {
        this.idCategory = idCategory;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}