package org.generation.GridAndFlex.controller;

import org.generation.GridAndFlex.dto.CarritoLineView;
import org.generation.GridAndFlex.service.CarritoService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/carrito")
public class CarritoController {

    private final CarritoService carritoService;

    public CarritoController(CarritoService carritoService) {
        this.carritoService = carritoService;
    }

    @GetMapping("/{userId}")
    public List<CarritoLineView> get(@PathVariable Long userId) {
        return carritoService.getCarritoLines(userId);
    }

    public record AddItemBody(Long productoId, Integer cantidad) {
    }

    @PostMapping("/{userId}/items")
    public List<CarritoLineView> add(@PathVariable Long userId, @RequestBody AddItemBody body) {
        int q = body.cantidad() == null ? 1 : body.cantidad();
        carritoService.addItem(userId, body.productoId(), q);
        return carritoService.getCarritoLines(userId);
    }

    public record QtyBody(Integer cantidad) {
    }

    @PutMapping("/items/{detalleId}")
    public List<CarritoLineView> update(
            @PathVariable Integer detalleId,
            @RequestParam Long userId,
            @RequestBody QtyBody body) {
        int qty = body.cantidad() == null ? 0 : body.cantidad();
        carritoService.updateItemQty(userId, detalleId, qty);
        return carritoService.getCarritoLines(userId);
    }

    @DeleteMapping("/items/{detalleId}")
    public List<CarritoLineView> delete(@PathVariable Integer detalleId, @RequestParam Long userId) {
        carritoService.removeItem(userId, detalleId);
        return carritoService.getCarritoLines(userId);
    }

    public record CheckoutBody(BigDecimal montoTotal) {
    }

    @PostMapping("/{userId}/checkout")
    public void checkout(@PathVariable Long userId, @RequestBody CheckoutBody body) {
        carritoService.checkout(userId, body.montoTotal());
    }
}
