'use strict';

import { buildApp } from '../configs/app.js';
import { dbConnection } from '../configs/db.js';

// Vercel keeps warm lambda instances alive between invocations and reuses
// this module's scope, so the app and the DB-connection promise are built
// once per instance instead of on every request.
const app = buildApp();
let dbReady = null;

export default async function handler(req, res) {
    if (!dbReady) {
        dbReady = dbConnection();
    }
    await dbReady;

    return app(req, res);
}
