package org.generation.GridAndFlex.repository;

import org.generation.GridAndFlex.model.Pedidos;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigInteger;

public interface PedidosRepository extends JpaRepository<Pedidos, BigInteger> {

}