import { Router } from "express";
import { addFavorite, updateFavorite, deleteFavorite, getMyFavorites, changeFavoriteStatus, fastTransfer } from "./favorite.controller.js";
import { validateAddFavorite, validateIdFavorite, validateFavoriteStatusChange } from "../../middlewares/favorite-validator.js";
import { validateGet } from "../../middlewares/account-validator.js";

const api = Router();

/**
 * @swagger
 * /favorites/create:
 *   post:
 *     summary: Agrega una cuenta a favoritos
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [accountId, alias]
 *             properties:
 *               accountId:
 *                 type: string
 *                 example: 65f2ca7e77f8b30f5077aa11
 *               alias:
 *                 type: string
 *                 example: Cuenta de ahorros
 *     responses:
 *       201:
 *         description: Favorito creado
 *       404:
 *         description: Cuenta no encontrada
 */
api.post('/create', validateAddFavorite, addFavorite);

/**
 * @swagger
 * /favorites:
 *   get:
 *     summary: Obtiene favoritos del usuario autenticado
 *     tags: [Favorites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de favoritos
 */
api.get('/', validateGet, getMyFavorites);

/**
 * @swagger
 * /favorites/update/{id}:
 *   put:
 *     summary: Actualiza el alias de un favorito
 *     tags: [Favorites]
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
 *             required: [alias]
 *             properties:
 *               alias:
 *                 type: string
 *                 example: Cuenta sueldo
 *     responses:
 *       200:
 *         description: Favorito actualizado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Favorito no encontrado
 */
api.put('/update/:id', validateIdFavorite, updateFavorite);

/**
 * @swagger
 * /favorites/delete/{id}:
 *   delete:
 *     summary: Elimina un favorito (desactivación lógica)
 *     tags: [Favorites]
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
 *         description: Favorito eliminado
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Favorito no encontrado
 */
api.delete('/delete/:id', validateIdFavorite, deleteFavorite);
api.put('/activate/:id', validateFavoriteStatusChange, changeFavoriteStatus);
api.put('/deactivate/:id', validateFavoriteStatusChange, changeFavoriteStatus);
api.post('/fastTransfer', fastTransfer);

export default api;