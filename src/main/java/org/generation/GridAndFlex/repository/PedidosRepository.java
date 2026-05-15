package org.generation.GridAndFlex.repository;

import org.generation.GridAndFlex.model.Pedidos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PedidosRepository extends JpaRepository<Pedidos, Long> {

    Optional<Pedidos> findFirstByUsuarioIdAndEstadoOrderByIdDesc(Long usuarioId, Pedidos.EstadoPedido estado);
}