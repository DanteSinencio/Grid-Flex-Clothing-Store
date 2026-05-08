package org.generation.GridAndFlex.model;

import jakarta.persistence.*;

@Entity
@Table(name = "productos")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_productos")
    private Long id_productos;

    private String nombre;
    private String descripcion;
    private Double precio;
    private Integer existencias;

    @Column(name = "url_imagen")
    private String urlImagen;

    @ManyToOne
    @JoinColumn(name = "categoria_id_categoria")
    private Category categoria;

    // GETTERS Y SETTERS

    public Long getId_productos() {return id_productos;}

    public void setId_productos(Long id_productos) {this.id_productos = id_productos;}

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
