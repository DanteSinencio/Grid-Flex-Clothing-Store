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


    public Category() {
    }

    public Category(Long idCategory, String nombre) {
        this.idCategory = idCategory;
        this.nombre = nombre;
    }

    // Getters y Setters

    // GETTERS Y SETTERS

    public Integer getId_productos() {return id_productos;}

    public void setId_productos(Integer id_productos) {this.id_productos = id_productos;}

    public String getNombre() {return nombre;}

    public void setNombre(String nombre) {this.nombre = nombre;}

    public String getDescripcion() {return descripcion;}

    public void setDescripcion(String descripcion) {this.descripcion = descripcion;}

    public Double getPrecio() {return precio;}

    public void setPrecio(Double precio) {this.precio = precio;}

    public Integer getExistencias() {return existencias;}

    public void setExistencias(Integer existencias) {this.existencias = existencias;}

    public String getUrlImagen() {return urlImagen;}

    public void setUrlImagen(String urlImagen) {this.urlImagen = urlImagen;}

    public Category getCategoria() {return categoria;}

    public void setCategoria(Category categoria) {this.categoria = categoria;}
}
