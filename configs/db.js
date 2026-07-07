'use strict';

import dns from "node:dns";
import mongoose from "mongoose";

// Node's c-ares resolver can't do raw UDP SRV queries on some Windows/VPN
// setups even though the OS resolver works fine (that's why `mongodb+srv://`
// URIs fail with `querySrv ECONNREFUSED` while `nslookup` succeeds). Pointing
// c-ares at public DNS sidesteps that without needing a non-SRV connection
// string.
dns.setServers(["8.8.8.8", "1.1.1.1", ...dns.getServers()]);

export const dbConnection = async () => {
    try {
        mongoose.connection.on('error', () => {
            console.log('MongoDB | no se pudo conectar a mongoDB');
            mongoose.disconnect();
        });
        mongoose.connection.on('connecting', () => {
            console.log('MongoDB | intentando conectar a mongoDB');
        });
        mongoose.connection.on('connected', () => {
            console.log('MongoDB | conectado a mongoDB');
        });
        mongoose.connection.on('open', () => {
            console.log('MongoDB | conectado a la base de datos kinalSports');
        });
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB | reconectando a mongoDB');
        });
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB | desconectando a mongoDB');
        });

        await mongoose.connect(process.env.URI_MONGO, {
            serverSelectionTimeoutMS: 5000,
            maxPoolSize: 10
        })
    } catch (error) {
        console.log(`Error al conectar la db: ${error}`);
    }
}

const gracefulShutdown = async (signal) => {
    console.log(`MongoDB | Received ${signal}. Closing database connection...`);
    try {
        await mongoose.connection.close();
        console.log('MongoDB | Database connection closed successfully');
        process.exit(0);
    } catch (error) {
        console.error('MongoDB | Error during graceful shutdown:', error.message);
        process.exit(1);
    }
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGURS2', () => gracefulShutdown('SIGURS2'));