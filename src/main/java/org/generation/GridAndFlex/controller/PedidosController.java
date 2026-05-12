package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.model.Pedidos;
import org.generation.GridAndFlex.service.PedidosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/pedidos")
public class PedidosController {

    private final PedidosService pedidosService;

    public PedidosController(PedidosService pedidosService) {
        this.pedidosService = pedidosService;
    }

    @GetMapping
    public List<Pedidos> getAllPedidos() {
        return pedidosService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedidos> getPedidoById(@PathVariable Long id) {
        return pedidosService.getById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public Pedidos createPedido(@RequestBody Pedidos pedido) {
        return pedidosService.save(pedido);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pedidos> updatePedido(
            @PathVariable Long id,
            @RequestBody Pedidos pedidoData) {

        Pedidos pedido = pedidosService.update(id, pedidoData);
        if (pedido == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(pedido);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePedido(@PathVariable Long id) {
        boolean deleted = pedidosService.delete(id);
        return deleted ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}