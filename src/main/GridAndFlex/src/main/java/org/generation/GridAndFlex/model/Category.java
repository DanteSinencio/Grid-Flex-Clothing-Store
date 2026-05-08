package org.generation.GridAndFlex.model;

import jakarta.persistence.*;

@Entity
@Table(name = "categoria")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_categoria")
    private Integer idCategory;

    @Column(nullable = false, length = 45)
    private String nombre;


    public Category() {
    }

    public Category(Long idCategory, String nombre) {
        this.idCategory = idCategory;
        this.nombre = nombre;
    }

    // Getters y Setters
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