'use strict';

import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let replSet;

// Money-movement code paths use mongoose sessions/transactions, which require
// a replica set (a plain standalone mongod cannot run multi-document
// transactions) — spin up a single-node replica set for tests.
export const startDb = async () => {
    replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
    await mongoose.connect(replSet.getUri());
};

export const stopDb = async () => {
    await mongoose.disconnect();
    if (replSet) {
        await replSet.stop();
    }
};

export const clearDb = async () => {
    const { collections } = mongoose.connection;
    await Promise.all(Object.values(collections).map((collection) => collection.deleteMany({})));
};

export const mockRes = () => {
    const res = { statusCode: 200, body: undefined };
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (payload) => { res.body = payload; return res; };
    res.set = () => res;
    res.end = () => res;
    return res;
};
