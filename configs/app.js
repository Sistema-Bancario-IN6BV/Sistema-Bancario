'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import pkg from 'swagger-ui-express';

import swaggerSpec from './swagger.js';
import { dbConnection } from './db.js';
import { helmetConfiguration } from './helmet-configuration.js';
import { corsOptions } from './cors-configuration.js';
import { errorHandler } from '../middlewares/handle-errors.js';

import userRoutes from '../src/users/user.routes.js';
import accountRoutes from '../src/accounts/accounts.router.js';
import favoriteRoutes from '../src/favorite/favorite.router.js';
import productRoutes from '../src/products/products.router.js';
import transactionRoutes from '../src/transactions/transactions.router.js';

const { serve, setup } = pkg;
const BASE_PATH = '/bankSystem/v1';

// Builds the Express app without connecting to the DB or binding a port, so
// it can be reused both by the persistent server (Docker/local) and by a
// serverless entrypoint (Vercel), which owns its own DB-connection and
// listen lifecycle.
export const buildApp = () => {
    const app = express();
    app.set('trust proxy', 1);

    app.use(express.json());
    app.use(express.urlencoded({ extended: false }));
    app.use(cors(corsOptions));
    app.use(helmet(helmetConfiguration));
    app.use(morgan('dev'));

    app.use('/api-docs', serve, setup(swaggerSpec));

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy'
        });
    });

    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/accounts`, accountRoutes);
    app.use(`${BASE_PATH}/favorites`, favoriteRoutes);
    app.use(`${BASE_PATH}/products`, productRoutes);
    app.use(`${BASE_PATH}/transactions`, transactionRoutes);

    app.use((req, res) => {
        res.status(404).json({
            message: 'Endpoint not found in Bank API'
        });
    });

    app.use(errorHandler);

    return app;
};

export const initServer = async () => {
    const PORT = process.env.PORT || 3006;

    try {
        await dbConnection();

        const app = buildApp();

        app.listen(PORT, () => {
            console.log(`Bank System server running on port ${PORT}`);
            console.log(`Swagger docs: http://localhost:${PORT}/api-docs`);
            console.log(`Health check: http://localhost:${PORT}${BASE_PATH}/health`);
        });
    } catch (error) {
        console.error(`Error starting Bank Server: ${error.message}`);
        process.exit(1);
    }
};