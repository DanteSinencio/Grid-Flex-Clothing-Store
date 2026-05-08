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


    public Optional<Pedidos> getById(int id) {
        return pedidosRepository.findById(id);
    }


    public Pedidos update(int id, Pedidos pedidoActualizado) {
        return pedidosRepository.findById(id).map(pedido -> {
            pedido.setRoles(pedidoActualizado.getRoles());
            pedido.setNombre(pedidoActualizado.getNombre());
            pedido.setApellido(pedidoActualizado.getApellido());
            pedido.setCorreo(pedidoActualizado.getCorreo());
            pedido.setTelefono(pedidoActualizado.getTelefono());
            pedido.setContrasena(pedidoActualizado.getContrasena());
            return pedidosRepository.save(pedido);
        }).orElse(null);
    }
}