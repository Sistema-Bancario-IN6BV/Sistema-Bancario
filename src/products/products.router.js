import { Router } from "express";
import { createProduct, getProducts, updateProduct, deleteProduct, getProductById, purchaseProduct } from "./products.controller.js";
import { validateCreateProduct, validateProductID } from "../../middlewares/product-validator.js";
import { validateJWT } from "../../middlewares/validate-JWT.js";

const api = Router();

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Lista productos activos
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Productos obtenidos
 */
api.get('/', validateJWT, getProducts);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Obtiene un producto por ID
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto encontrado
 *       404:
 *         description: Producto no encontrado
 */
api.get('/:id', validateProductID, getProductById);

/**
 * @swagger
 * /products/create:
 *   post:
 *     summary: Crea un nuevo producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Tarjeta de crédito Gold
 *               description:
 *                 type: string
 *                 example: Beneficios premium y cashback
 *               price:
 *                 type: number
 *                 example: 250
 *     responses:
 *       201:
 *         description: Producto creado
 *       403:
 *         description: Solo administradores
 */
api.post('/create', validateCreateProduct, createProduct);

/**
 * @swagger
 * /products/update/{id}:
 *   put:
 *     summary: Actualiza un producto
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Producto actualizado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Producto no encontrado
 */
api.put('/update/:id', validateCreateProduct, validateProductID, updateProduct);

/**
 * @swagger
 * /products/delete/{id}:
 *   delete:
 *     summary: Elimina un producto (desactivación lógica)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Producto eliminado
 *       403:
 *         description: Solo administradores
 *       404:
 *         description: Producto no encontrado
 */
api.delete('/delete/:id', validateProductID, deleteProduct);

/**
 * @swagger
 * /products/purchase:
 *   post:
 *     summary: Compra un producto usando una cuenta activa
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId, accountId]
 *             properties:
 *               productId:
 *                 type: string
 *               accountId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Compra realizada
 *       400:
 *         description: Saldo insuficiente o datos inválidos
 *       403:
 *         description: Solo usuarios cliente
 *       404:
 *         description: Producto o cuenta inválida
 */
api.post('/purchase', validateJWT, purchaseProduct);

export default api;