'use strict';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { dbConnection } from './db.js';

import userRoutes from '../src/users/user.routes.js';
import accountRoutes from '../src/accounts/accounts.routes.js';

const BASE_PATH = '/bankSystem/v1';

export const initServer = async () => {
    const app = express();
    const PORT = process.env.PORT || 3000;

    await dbConnection();

    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('dev'));

    app.get(`${BASE_PATH}/health`, (req, res) => {
        res.status(200).json({
            status: 'Healthy'
        });
    });

    app.use(`${BASE_PATH}/users`, userRoutes);
    app.use(`${BASE_PATH}/accounts`, accountRoutes);

    app.use((req, res) => {
        res.status(404).json({
            message: 'Endpoint not found in Bank API'
        });
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
};