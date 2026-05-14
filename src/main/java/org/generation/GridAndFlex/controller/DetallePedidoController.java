package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.model.DetallePedido;
import org.generation.GridAndFlex.service.DetallePedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/detalle")
public class DetallePedidoController {

    @Autowired
    private DetallePedidoService service;

    // GET todos
    @GetMapping
    public List<DetallePedido> getAllDetalles() {
        return service.getAllDetalles();
    }

    // GET por ID
    @GetMapping("/{id}")
    public Optional<DetallePedido> getDetalleById(@PathVariable Integer id) {
        return service.getDetalleById(id);
    }

    // POST
    @PostMapping
    public DetallePedido createDetalle(@RequestBody DetallePedido detallePedido) {
        return service.saveDetalle(detallePedido);
    }

    // PUT
    @PutMapping("/{id}")
    public DetallePedido updateDetalle(
            @PathVariable Integer id,
            @RequestBody DetallePedido detallePedido) {
        return service.updateDetalle(id, detallePedido);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public String deleteDetalle(@PathVariable Integer id) {
        service.deleteDetalle(id);
        return "Detalle eliminado correctamente";
    }
}