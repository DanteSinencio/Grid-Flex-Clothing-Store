package org.generation.GridAndFlex.service;

import org.generation.GridAndFlex.model.DetallePedido;
import org.generation.GridAndFlex.repository.DetallePedidoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DetallePedidoService {

    @Autowired
    private DetallePedidoRepository repository;

    // GET todos
    public List<DetallePedido> getAllDetalles() {
        return repository.findAll();
    }

    // POST
    public DetallePedido saveDetalle(DetallePedido detallePedido) {
        return repository.save(detallePedido);
    }

    // GET por ID
    public Optional<DetallePedido> getDetalleById(Integer id) {
        return repository.findById(id);
    }

    // PUT
    public DetallePedido updateDetalle(Integer id, DetallePedido detalleActualizado) {
        detalleActualizado.setIdDetalle(id);
        return repository.save(detalleActualizado);
    }

    // DELETE
    public void deleteDetalle(Integer id) {
        repository.deleteById(id);
    }
}