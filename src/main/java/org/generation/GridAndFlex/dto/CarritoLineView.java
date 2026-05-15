package org.generation.GridAndFlex.dto;

public record CarritoLineView(
        Integer detalleId,
        Long productoId,
        Integer cantidad,
        double precioUnitario,
        String nombre,
        String urlImagen,
        String talla
) {
}
