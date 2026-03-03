import { Router } from "express";
import { addFavorite, updateFavorite, deleteFavorite, getMyFavorites, changeFavoriteStatus } from "./favorite.controller.js";
import { validateAddFavorite, validateIdFavorite, validateFavoriteStatusChange } from "../../middlewares/favorite-validator.js";
import { validateGet } from "../../middlewares/account-validator.js";

const api = Router();

api.post('/create', validateAddFavorite, addFavorite);
api.get('/', validateGet, getMyFavorites);
api.put('/update/:id', validateIdFavorite, updateFavorite);
api.delete('/delete/:id', validateIdFavorite, deleteFavorite);
api.put('/activate/:id', validateFavoriteStatusChange, changeFavoriteStatus);
api.put('/deactivate/:id', validateFavoriteStatusChange, changeFavoriteStatus);

export default api;