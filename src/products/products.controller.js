'use strict';

import Product from './products.model.js';

export const createProduct = async (req, res) => {
    try {
        const data = req.body;

        const product = new Product(data);
        await product.save();

        return res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al crear el producto',
            error: error.message
        });
    }
};

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true });

        return res.json({
            success: true,
            total: products.length,
            products
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener los productos',
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        const updated = await Product.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        return res.json({
            success: true,
            message: 'Producto actualizado',
            updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al actualizar el producto',
            error: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        await Product.findByIdAndUpdate(id, { isActive: false });

        return res.json({
            success: true,
            message: 'Producto eliminado (desactivado) correctamente'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al eliminar el producto',
            error: error.message
        });
    }
};

export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        const product = await Product.findOne({ _id: id, isActive: true });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado o está inactivo'
            });
        }

        return res.json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};