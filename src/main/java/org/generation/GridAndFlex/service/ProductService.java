package org.generation.GridAndFlex.service;

import org.generation.GridAndFlex.repository.ProductRepository;
import org.generation.GridAndFlex.model.Product;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {
    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> obtenerProductos() {
        return productRepository.findAll();
    }

    public Product obtenerProductosId(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    public Product guardarProducto(Product product) {
        return productRepository.save(product);
    }

    public Product actualizarProducto(Product product){
        return productRepository.save(product);
    }

    public void borrarProducto(Long id){
        productRepository.deleteById(id);
    }

}
