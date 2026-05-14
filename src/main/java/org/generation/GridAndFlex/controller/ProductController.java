package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.model.Product;
import org.generation.GridAndFlex.service.ProductService;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/products")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService){
        this.productService=productService;
    }

    //CREATE
    @PostMapping
    public Product crearProducto(@RequestBody Product product) {
        return productService.guardarProducto(product);
    }

    //READ

    @GetMapping
    public List<Product> obtenerProductos() {
        return productService.obtenerProductos();
    }

    @GetMapping("/{id}")
    public Product obtenerProductosId(@PathVariable Long id) {
        return productService.obtenerProductosId(id);
    }

    //UPDATE
    @PutMapping("/{id}")
    public void actualizarProducto(@RequestBody Product product){ productService.actualizarProducto(product);}

    //DELATE
    @DeleteMapping("/{id}")
    public void borrarProducto(@PathVariable Long id){ productService.borrarProducto(id);}



}
