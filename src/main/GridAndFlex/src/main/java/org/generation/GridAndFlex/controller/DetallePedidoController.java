package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.model.DetallePedido;
import org.generation.GridAndFlex.service.DetallePedidoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/detalle")
public class DetallePedidoController {

    @Autowired
    private DetallePedidoService service;

    // EL GET TODOS
    @GetMapping
    public List<DetallePedido> getAllDetalles() {
        return service.getAllDetalles();
    }

    // EL GET por ID
    @GetMapping("/{id}")
    public Optional<DetallePedido> getDetalleById(@PathVariable Long id) {
        return service.getDetalleById(id);
    }

    // EL POST
    @PostMapping
    public DetallePedido createDetalle(@RequestBody DetallePedido detallePedido) {
        return service.saveDetalle(detallePedido);
    }

    // EL PUT
    @PutMapping("/{id}")
    public DetallePedido updateDetalle(
            @PathVariable Long id,
            @RequestBody DetallePedido detallePedido) {
        return service.updateDetalle(id, detallePedido);
    }

    // LE DELETE
    @DeleteMapping("/{id}")
    public String deleteDetalle(@PathVariable Long id) {
        service.deleteDetalle(id);
        return "Detalle eliminado correctamente";
    }
}