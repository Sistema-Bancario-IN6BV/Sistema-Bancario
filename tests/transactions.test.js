'use strict';

import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { startDb, stopDb, clearDb, mockRes } from './setup.js';
import Account from '../src/accounts/accounts.model.js';
import Favorite from '../src/favorite/favorite.model.js';
import { createTransaction, revertTransaction } from '../src/transactions/transaction.controller.js';
import { fastTransfer } from '../src/favorite/favorite.controller.js';

before(async () => { await startDb(); }, { timeout: 120000 });
after(async () => { await stopDb(); });
beforeEach(async () => { await clearDb(); });

const createAccount = (overrides = {}) => Account.create({
    accountNumber: overrides.accountNumber || `ACC${Math.floor(Math.random() * 1e9)}`,
    externalUserId: overrides.externalUserId || 'user-1',
    balance: overrides.balance ?? 1000,
    status: 'ACTIVE',
    isActive: true,
});

test('createTransaction TRANSFER moves funds atomically between owned accounts', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 1000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });

    const req = {
        body: { type: 'TRANSFER', amount: 500, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'user-1', role: 'USER_ROLE' }
    };
    const res = mockRes();

    await createTransaction(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);

    const updatedSource = await Account.findById(source._id);
    const updatedDestination = await Account.findById(destination._id);
    assert.equal(updatedSource.balance, 500);
    assert.equal(updatedDestination.balance, 500);
});

test('createTransaction TRANSFER rejects a user who does not own the source account (BOLA regression)', async () => {
    const source = await createAccount({ externalUserId: 'owner', balance: 1000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });

    const req = {
        body: { type: 'TRANSFER', amount: 500, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'attacker', role: 'USER_ROLE' }
    };
    const res = mockRes();

    await createTransaction(req, res);

    assert.equal(res.statusCode, 403);

    const untouched = await Account.findById(source._id);
    assert.equal(untouched.balance, 1000);
});

test('createTransaction TRANSFER rejects amounts over the Q2000 per-transaction cap', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 5000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });

    const req = {
        body: { type: 'TRANSFER', amount: 2500, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'user-1', role: 'USER_ROLE' }
    };
    const res = mockRes();

    await createTransaction(req, res);

    assert.equal(res.statusCode, 400);
});

test('createTransaction TRANSFER rejects transfers that would exceed the Q10000 daily cap', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 100000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });
    const makeReq = (amount) => ({
        body: { type: 'TRANSFER', amount, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'user-1', role: 'USER_ROLE' }
    });

    // 5 transfers of 2000 = 10000 exactly; the 6th (even Q1) must be rejected.
    for (let i = 0; i < 5; i += 1) {
        const res = mockRes();
        await createTransaction(makeReq(2000), res);
        assert.equal(res.statusCode, 201, `transfer ${i + 1} should succeed`);
    }

    const res = mockRes();
    await createTransaction(makeReq(1), res);
    assert.equal(res.statusCode, 400);
});

test('createTransaction TRANSFER rejects insufficient funds without mutating balances', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 100 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });

    const req = {
        body: { type: 'TRANSFER', amount: 500, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'user-1', role: 'USER_ROLE' }
    };
    const res = mockRes();

    await createTransaction(req, res);

    assert.equal(res.statusCode, 400);
    const untouched = await Account.findById(source._id);
    assert.equal(untouched.balance, 100);
});

test('createTransaction TRANSFER never double-debits under concurrent requests (race regression)', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 1000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });

    const makeReq = () => ({
        body: { type: 'TRANSFER', amount: 600, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'user-1', role: 'USER_ROLE' }
    });

    const res1 = mockRes();
    const res2 = mockRes();

    await Promise.all([
        createTransaction(makeReq(), res1),
        createTransaction(makeReq(), res2)
    ]);

    const statuses = [res1.statusCode, res2.statusCode].sort();
    // exactly one of the two concurrent transfers succeeds; the other is rejected for insufficient funds
    assert.deepEqual(statuses, [201, 400]);

    const finalSource = await Account.findById(source._id);
    assert.equal(finalSource.balance, 400); // 1000 - 600, never double-debited or negative
});

test('revertTransaction rejects reverting the same transaction twice (isReversed regression)', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 1000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });

    const createReq = {
        body: { type: 'TRANSFER', amount: 500, sourceAccount: source.accountNumber, destinationAccount: destination.accountNumber },
        user: { id: 'user-1', role: 'USER_ROLE' }
    };
    const createRes = mockRes();
    await createTransaction(createReq, createRes);
    assert.equal(createRes.statusCode, 201);
    const transactionId = createRes.body.transaction._id;

    const revertReq = { params: { id: String(transactionId) }, user: { id: 'admin', role: 'ADMIN_ROLE' } };

    const firstRevert = mockRes();
    await revertTransaction(revertReq, firstRevert);
    assert.equal(firstRevert.statusCode, 200);

    const secondRevert = mockRes();
    await revertTransaction(revertReq, secondRevert);
    assert.equal(secondRevert.statusCode, 400);

    const finalSource = await Account.findById(source._id);
    assert.equal(finalSource.balance, 1000); // reverted exactly once
});

test('fastTransfer enforces the same Q2000 limit as createTransaction (bypass regression)', async () => {
    const source = await createAccount({ externalUserId: 'user-1', balance: 10000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });
    const favorite = await Favorite.create({ externalUserId: 'user-1', accountId: destination._id, alias: 'Test' });

    const req = {
        body: { favoriteId: String(favorite._id), sourceAccount: String(source._id), amount: 2500 },
        user: { id: 'user-1', role: 'USER_ROLE' }
    };
    const res = mockRes();

    await fastTransfer(req, res);

    assert.equal(res.statusCode, 400);

    const untouched = await Account.findById(source._id);
    assert.equal(untouched.balance, 10000);
});

test('fastTransfer rejects a user who does not own the source account (BOLA regression)', async () => {
    const source = await createAccount({ externalUserId: 'owner', balance: 10000 });
    const destination = await createAccount({ externalUserId: 'user-2', balance: 0 });
    const favorite = await Favorite.create({ externalUserId: 'attacker', accountId: destination._id, alias: 'Test' });

    const req = {
        body: { favoriteId: String(favorite._id), sourceAccount: String(source._id), amount: 500 },
        user: { id: 'attacker', role: 'USER_ROLE' }
    };
    const res = mockRes();

    await fastTransfer(req, res);

    assert.equal(res.statusCode, 403);

    const untouched = await Account.findById(source._id);
    assert.equal(untouched.balance, 10000);
});
