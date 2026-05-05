INSERT INTO Usuario (roles, nombre, apellido, correo, telefono, contrasena) VALUES
('admin', 'Carlos', 'Ramirez', 'carlos.admin@mail.com', '5512345678', 'hash1'),
('cliente', 'Ana', 'Lopez', 'ana.lopez@mail.com', '5523456789', 'hash2'),
('cliente', 'Luis', 'Martinez', 'luis.mtz@mail.com', '5534567890', 'hash3'),
('cliente', 'Sofia', 'Hernandez', 'sofia.hdz@mail.com', '5545678901', 'hash4'),
('cliente', 'Diego', 'Torres', 'diego.torres@mail.com', '5556789012', 'hash5'),
('cliente','Mario','Gomez','mario1@mail.com','5510000001','hash'),
('cliente','Lucia','Perez','lucia2@mail.com','5510000002','hash'),
('cliente','Jorge','Diaz','jorge3@mail.com','5510000003','hash'),
('cliente','Elena','Ruiz','elena4@mail.com','5510000004','hash'),
('cliente','Pablo','Santos','pablo5@mail.com','5510000005','hash'),
('cliente','Diana','Vega','diana6@mail.com','5510000006','hash'),
('cliente','Fernando','Cruz','fernando7@mail.com','5510000007','hash'),
('cliente','Laura','Morales','laura8@mail.com','5510000008','hash'),
('cliente','Ricardo','Ortiz','ricardo9@mail.com','5510000009','hash'),
('cliente','Gabriela','Castro','gabriela10@mail.com','5510000010','hash'),
('cliente','Hugo','Rojas','hugo11@mail.com','5510000011','hash'),
('cliente','Patricia','Navarro','patricia12@mail.com','5510000012','hash'),
('cliente','Raul','Mendez','raul13@mail.com','5510000013','hash'),
('cliente','Claudia','Flores','claudia14@mail.com','5510000014','hash'),
('cliente','Oscar','Herrera','oscar15@mail.com','5510000015','hash'),
('cliente','Valeria','Aguilar','valeria16@mail.com','5510000016','hash'),
('cliente','Alberto','Salazar','alberto17@mail.com','5510000017','hash'),
('cliente','Monica','Delgado','monica18@mail.com','5510000018','hash'),
('cliente','Andres','Pineda','andres19@mail.com','5510000019','hash'),
('cliente','Daniela','Campos','daniela20@mail.com','5510000020','hash');

INSERT INTO categoria (nombre) VALUES
('Playeras'),
('Pantalones'),
('Sudaderas'),
('Vestidos'),
('Calzado'),
('Accesorios'),
('Ropa deportiva'),
('Ropa formal'),
('Ropa de invierno'),
('Ropa casual');

INSERT INTO productos (nombre, descripcion, precio, existencias, url_imagen, categoria_id_categoria) VALUES
-- Playeras
('Playera básica blanca','Algodón 100%',199.99,50,'img/playera1.jpg',1),
('Playera estampada','Diseño moderno',249.99,40,'img/playera2.jpg',1),

-- Pantalones
('Jeans azul','Mezclilla clásica',499.99,30,'img/pantalon1.jpg',2),
('Pantalón negro formal','Corte recto',599.99,25,'img/pantalon2.jpg',2),

-- Sudaderas
('Sudadera con capucha','Color negro',399.99,20,'img/sudadera1.jpg',3),
('Sudadera oversize','Estilo urbano',449.99,15,'img/sudadera2.jpg',3),

-- Vestidos
('Vestido floral','Tela ligera',599.99,15,'img/vestido1.jpg',4),
('Vestido elegante','Para eventos',799.99,10,'img/vestido2.jpg',4),

-- Calzado
('Tenis deportivos','Running',899.99,35,'img/calzado1.jpg',5),
('Zapatos formales','Piel negra',999.99,20,'img/calzado2.jpg',5),
-- Accesorios
('Gorra','Ajustable',149.99,40,'img/accesorio1.jpg',6),

-- Ropa deportiva
('Short deportivo','Ligero',249.99,45,'img/deporte1.jpg',7),
('Playera deportiva','Transpirable',299.99,50,'img/deporte2.jpg',7),

-- Ropa formal
('Camisa formal','Manga larga',549.99,30,'img/formal1.jpg',8),

-- Ropa de invierno
('Chamarra gruesa','Para frío intenso',1199.99,12,'img/invierno1.jpg',9);

INSERT INTO pedidos (montoTotal, estado, Usuario_id_Usuario) VALUES
(199.99, 'pagado', 2),
(499.99, 'enviado', 3),
(399.99, 'pendiente', 4),
(749.98, 'entregado', 5),
(349.98, 'pagado', 2);

INSERT INTO detalle_pedido (cantidad, precio_unitario, pedidos_id_pedidos, productos_id_productos) VALUES
(1, 199.99, 1, 1),
(1, 499.99, 2, 2),
(1, 399.99, 3, 3),
(1, 599.99, 4, 4),
(1, 149.99, 5, 5);