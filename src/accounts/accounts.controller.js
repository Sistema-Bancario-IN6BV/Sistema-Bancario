import Account from './accounts.model.js';

export const createAccount = async (req, res) => {
    try {
        const { balance, externalUserId } = req.body;

        if (balance < 100) {
            return res.status(400).json({
                message: 'El ingreso mínimo es Q100'
            });
        }

        const accountNumber = Math.floor(
            1000000000 + Math.random() * 9000000000
        ).toString();

        const account = new Account({
            accountNumber,
            balance,
            externalUserId
        });

        await account.save();

        return res.status(201).json({
            message: 'Cuenta creada',
            account
        });

    } catch (err) {
        return res.status(500).json({
            message: 'Error al crear cuenta',
            err
        });
    }
};