'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';
import { corsOptions } from './cors-configuration.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { requestLimit } from '../middlewares/request-limit.js';
import { errorHandler } from '../middlewares/handle-errors.js';

import accountRoutes from '../src/accounts/accounts.router.js';
import favoriteRoutes from '../src/favorite/favorite.router.js';
import productRoutes from '../src/products/products.router.js';
import transactionRoutes from '../src/transactions/transactions.router.js';
const BASE_PATH = '/bankSystem/v1';

const middlewares = (app) => {
    app.use(express.urlencoded({ extended: false, limit: '10mb' }));
    app.use(express.json({ limit: '10mb' }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(requestLimit);
    app.use(morgan('dev'));
};

const routes = (app) => {
    // ACCOUNTS
    app.use(`${BASE_PATH}/accounts`, accountRoutes);

    // FAVORITES
    app.use(`${BASE_PATH}/favorites`, favoriteRoutes);

    // PRODUCTS
    app.use(`${BASE_PATH}/products`, productRoutes);

    

    // Health check
    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy',
            timestamp: new Date().toISOString(),
            service: 'Bank System API'
        });
    });

    // 404
    app.use((req, res) => {
        res.status(404).json({
            success: false,
            message: 'Endpoint not found in Bank API'
        });
    });
};

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;

    app.set('trust proxy', 1);

    try {
        await dbConnection();
        middlewares(app);
        routes(app);

        app.use(errorHandler);

        app.listen(PORT, () => {
            console.log(`Bank System server running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        });

    } catch (error) {
        console.error(`Error starting Bank Server: ${error.message}`);
        process.exit(1);
    }
};
