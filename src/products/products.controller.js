'use strict';

import Product from './products.model.js';
import Account from '../accounts/accounts.model.js';
import Transaction from '../transactions/transaction.model.js';

export const createProduct = async (req, res) => {
    try {

        if(req.user.role !== 'ADMIN_ROLE'){
            return res.status(403).json({
                success: false,
                message: 'Only admins can create products'
            });
        }

        const data = req.body;

        const product = new Product(data);
        await product.save();

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error creating the product',
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
            message: 'Error obtaining products',
            error: error.message
        });
    }
};

export const updateProduct = async (req, res) => {
    try {

        if(req.user.role !== 'ADMIN_ROLE'){
            return res.status(403).json({
                success: false,
                message: 'Only admins can update products'
            });
        }

        const { id } = req.params;
        const data = req.body;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const updated = await Product.findByIdAndUpdate(
            id,
            data,
            { new: true, runValidators: true }
        );

        return res.json({
            success: true,
            message: 'Product updated successfully',
            updated
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error updating product',
            error: error.message
        });
    }
};

export const deleteProduct = async (req, res) => {
    try {

        if(req.user.role !== 'ADMIN_ROLE'){
            return res.status(403).json({
                success: false,
                message: 'Only admins can delete products'
            });
        }

        const { id } = req.params;

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        await Product.findByIdAndUpdate(id, { isActive: false });

        return res.json({
            success: true,
            message: 'Product deleted (deactivated) successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting product',
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
                message: 'Product not found or inactive'
            });
        }

        return res.json({
            success: true,
            product
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error obtaining product',
            error: error.message
        });
    }
};

export const purchaseProduct = async (req, res) => {
    try {

        const { productId, accountId } = req.body;


        const product = await Product.findOne({_id: productId,isActive: true});

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found or inactive'
            });
        }

        const account = await Account.findById(accountId);

        if (!account || !account.isActive || account.status !== 'ACTIVE') {
            return res.status(404).json({
                success: false,
                message: 'Invalid account'
            });
        }

        if (account.balance < product.price) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient balance'
            });
        }

        account.balance -= product.price;
        const earnedPoints = Math.floor(product.price / 10);
        account.points += earnedPoints;
        await account.save();

        const transaction = await Transaction.create({
            type: 'PURCHASE',
            amount: product.price,
            sourceAccount: account._id,
            description: `Purchase of product: ${product.name}`,
            isReversible: false
        });

        return res.status(200).json({
            success: true,
            message: 'Product purchased successfully',
            newBalance: account.balance,
            newPoints: account.points,
            earnedPoints,
            transaction
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error purchasing product',
            error: error.message
        });
    }
};

export const changeProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const product = await Product.findByIdAndUpdate(
            id, 
            { isActive },
            { new: true}
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: `Producto no encontrado`,
            });
        }

        res.status(200).json({
            success: true,
            message: `Producto ${action} exitosamente`,
            data: product
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del producto',
            error: error.message,
        });
        
    }
}

export const getPurchasedProductsByAccount = async (req, res) => {
    try {

        const { id } = req.params;

        if (req.user.role !== 'ADMIN_ROLE' && req.user.role !== 'USER_ROLE') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized'
            });
        }

        const account = await Account.findById(id);

        if (!account) {
            return res.status(404).json({
                success: false,
                message: 'Account not found'
            });
        }

        const purchases = await Transaction.find({
            type: 'PURCHASE',
            sourceAccount: id
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            total: purchases.length,
            purchases
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error getting purchased products',
            error: error.message
        });
    }
};