package org.generation.GridAndFlex.service;

import org.generation.GridAndFlex.model.Pedidos;
import org.generation.GridAndFlex.repository.PedidosRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PedidosService {

    @Autowired
    private PedidosRepository pedidosRepository;


    public List<Pedidos> getAll() {
        return pedidosRepository.findAll();
    }


    public Optional<Pedidos> getById(Long id) {
        return pedidosRepository.findById(id);
    }


    public Pedidos save(Pedidos pedido) {
        return pedidosRepository.save(pedido);
    }


    public Pedidos update(Long id, Pedidos pedidoActualizado) {
        return pedidosRepository.findById(id).map(pedido -> {
            pedido.setMontoTotal(pedidoActualizado.getMontoTotal());
            pedido.setFecha(pedidoActualizado.getFecha());
            pedido.setEstado(pedidoActualizado.getEstado());
            pedido.setUsuario(pedidoActualizado.getUsuario());
            return pedidosRepository.save(pedido);
        }).orElse(null);
    }


    public boolean delete(Long id) {
        if (pedidosRepository.existsById(id)) {
            pedidosRepository.deleteById(id);
            return true;
        }
        return false;
    }
}