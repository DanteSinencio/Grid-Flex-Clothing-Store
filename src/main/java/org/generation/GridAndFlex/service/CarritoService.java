package org.generation.GridAndFlex.service;

import org.generation.GridAndFlex.dto.CarritoLineView;
import org.generation.GridAndFlex.model.DetallePedido;
import org.generation.GridAndFlex.model.Pedidos;
import org.generation.GridAndFlex.model.Product;
import org.generation.GridAndFlex.model.User;
import org.generation.GridAndFlex.repository.DetallePedidoRepository;
import org.generation.GridAndFlex.repository.PedidosRepository;
import org.generation.GridAndFlex.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CarritoService {

    private static final Pattern TALLA_PATTERN = Pattern.compile("\\[Talla:([^]]+)\\]");

    private final PedidosRepository pedidosRepository;
    private final DetallePedidoRepository detallePedidoRepository;
    private final UserService userService;
    private final ProductRepository productRepository;

    public CarritoService(PedidosRepository pedidosRepository,
                          DetallePedidoRepository detallePedidoRepository,
                          UserService userService,
                          ProductRepository productRepository) {
        this.pedidosRepository = pedidosRepository;
        this.detallePedidoRepository = detallePedidoRepository;
        this.userService = userService;
        this.productRepository = productRepository;
    }

    @Transactional
    public Pedidos getOrCreateCarrito(Long userId) {
        User u = requireUser(userId);
        return pedidosRepository
                .findFirstByUsuarioIdAndEstadoOrderByIdDesc(userId, Pedidos.EstadoPedido.pendiente)
                .orElseGet(() -> {
                    Pedidos p = new Pedidos();
                    p.setUsuario(u);
                    p.setEstado(Pedidos.EstadoPedido.pendiente);
                    p.setMontoTotal(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
                    return pedidosRepository.save(p);
                });
    }

    private User requireUser(Long userId) {
        User u = userService.findById(userId);
        if (u == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado");
        }
        return u;
    }

    @Transactional
    public void addItem(Long userId, Long productoId, int cantidad) {
        if (cantidad < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cantidad inválida");
        }
        Product product = productRepository.findById(productoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
        Pedidos carrito = getOrCreateCarrito(userId);
        Long pid = carrito.getId();

        DetallePedido line = detallePedidoRepository
                .findByPedidoIdAndProductoId(pid, productoId)
                .orElse(null);

        double precio = product.getPrecio() != null ? product.getPrecio() : 0.0;
        if (line == null) {
            line = new DetallePedido();
            line.setPedidoId(pid);
            line.setProductoId(productoId);
            line.setCantidad(cantidad);
            line.setPrecioUnitario(precio);
            detallePedidoRepository.save(line);
        } else {
            line.setCantidad(line.getCantidad() + cantidad);
            line.setPrecioUnitario(precio);
            detallePedidoRepository.save(line);
        }
        recalcularMonto(pid);
    }

    @Transactional
    public void updateItemQty(Long userId, Integer detalleId, int nuevaCantidad) {
        DetallePedido line = detallePedidoRepository.findById(detalleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Línea no encontrada"));
        Pedidos pedido = pedidosRepository.findById(line.getPedidoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        assertCarritoOwned(pedido, userId);
        if (nuevaCantidad < 1) {
            detallePedidoRepository.deleteById(detalleId);
        } else {
            line.setCantidad(nuevaCantidad);
            detallePedidoRepository.save(line);
        }
        recalcularMonto(pedido.getId());
    }

    @Transactional
    public void removeItem(Long userId, Integer detalleId) {
        DetallePedido line = detallePedidoRepository.findById(detalleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Línea no encontrada"));
        Pedidos pedido = pedidosRepository.findById(line.getPedidoId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Pedido no encontrado"));
        assertCarritoOwned(pedido, userId);
        Long pid = pedido.getId();
        detallePedidoRepository.deleteById(detalleId);
        recalcularMonto(pid);
    }

    private void assertCarritoOwned(Pedidos pedido, Long userId) {
        if (pedido.getEstado() != Pedidos.EstadoPedido.pendiente) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El pedido ya no es un carrito abierto");
        }
        if (pedido.getUsuario() == null || !pedido.getUsuario().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No autorizado");
        }
    }

    private void recalcularMonto(Long pedidoId) {
        Pedidos p = pedidosRepository.findById(pedidoId).orElseThrow();
        List<DetallePedido> lines = detallePedidoRepository.findByPedidoId(pedidoId);
        BigDecimal total = BigDecimal.ZERO;
        for (DetallePedido d : lines) {
            BigDecimal pu = BigDecimal.valueOf(d.getPrecioUnitario() != null ? d.getPrecioUnitario() : 0.0);
            int c = d.getCantidad() != null ? d.getCantidad() : 0;
            BigDecimal sub = pu.multiply(BigDecimal.valueOf(c));
            total = total.add(sub);
        }
        p.setMontoTotal(total.setScale(2, RoundingMode.HALF_UP));
        pedidosRepository.save(p);
    }

    @Transactional(readOnly = true)
    public List<CarritoLineView> getCarritoLines(Long userId) {
        requireUser(userId);
        return pedidosRepository
                .findFirstByUsuarioIdAndEstadoOrderByIdDesc(userId, Pedidos.EstadoPedido.pendiente)
                .map(p -> mapLines(p.getId()))
                .orElseGet(List::of);
    }

    private List<CarritoLineView> mapLines(Long pedidoId) {
        List<DetallePedido> lines = detallePedidoRepository.findByPedidoId(pedidoId);
        List<CarritoLineView> out = new ArrayList<>();
        for (DetallePedido d : lines) {
            Product prod = productRepository.findById(d.getProductoId()).orElse(null);
            String nombre = prod != null ? prod.getNombre() : "Producto";
            String imagen = prod != null && prod.getUrlImagen() != null ? prod.getUrlImagen() : "";
            String talla = "M";
            if (prod != null && prod.getDescripcion() != null) {
                Matcher m = TALLA_PATTERN.matcher(prod.getDescripcion());
                if (m.find()) {
                    talla = m.group(1);
                }
            }
            double precio = d.getPrecioUnitario() != null ? d.getPrecioUnitario()
                    : (prod != null && prod.getPrecio() != null ? prod.getPrecio() : 0.0);
            out.add(new CarritoLineView(
                    d.getIdDetalle(),
                    d.getProductoId(),
                    d.getCantidad(),
                    precio,
                    nombre,
                    imagen,
                    talla));
        }
        return out;
    }

    @Transactional
    public void checkout(Long userId, BigDecimal montoTotalCliente) {
        Pedidos carrito = pedidosRepository
                .findFirstByUsuarioIdAndEstadoOrderByIdDesc(userId, Pedidos.EstadoPedido.pendiente)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No hay carrito activo"));
        assertCarritoOwned(carrito, userId);
        List<DetallePedido> lines = detallePedidoRepository.findByPedidoId(carrito.getId());
        if (lines.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El carrito está vacío");
        }
        if (montoTotalCliente == null || montoTotalCliente.compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Monto inválido");
        }
        carrito.setMontoTotal(montoTotalCliente.setScale(2, RoundingMode.HALF_UP));
        carrito.setEstado(Pedidos.EstadoPedido.pagado);
        pedidosRepository.save(carrito);
    }
}
