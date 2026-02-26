import { Router } from "express";
import { addFavorite, updateFavorite, deleteFavorite, getMyFavorites } from "./favorite.controller.js";
import { validateAddFavorite, validateIdFavorite } from "../../middlewares/favorite-validator.js";
import { validateGet } from "../../middlewares/account-validator.js";

const api = Router();

api.post('/create', validateAddFavorite, addFavorite);
api.get('/', validateGet, getMyFavorites);
api.put('/update/:id', validateIdFavorite, updateFavorite);
api.delete('/delete/:id', validateIdFavorite, deleteFavorite);

export default api;