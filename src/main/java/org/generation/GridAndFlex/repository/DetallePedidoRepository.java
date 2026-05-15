package org.generation.GridAndFlex.repository;

import org.generation.GridAndFlex.model.DetallePedido;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DetallePedidoRepository extends JpaRepository<DetallePedido, Integer> {

    List<DetallePedido> findByPedidoId(Long pedidoId);

    Optional<DetallePedido> findByPedidoIdAndProductoId(Long pedidoId, Long productoId);
}