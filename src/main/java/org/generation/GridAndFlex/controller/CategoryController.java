package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.model.Category;
import org.generation.GridAndFlex.service.CategoryService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/categories")
public class CategoryController {

    // Definimos el servicio como final para asegurar que se asigne mediante el constructor
    private final CategoryService categoryService;

    // Inyección por constructor: Es más seguro y facilita las pruebas unitarias
    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Obtener todas las categorías (Ej: Playeras, Pantalones, etc.)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // Guardar una nueva categoría
    @PostMapping
    public Category saveCategory(@RequestBody Category category) {
        return categoryService.saveCategory(category);
    }

    // Actualizar una categoría existente por su ID
    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return categoryService.updateCategory(id, category);
    }

    // Eliminar una categoría
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}