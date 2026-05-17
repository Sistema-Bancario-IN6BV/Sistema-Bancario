'use strict'

import Account from '../accounts/accounts.model.js';
import User from './user.model.js';
import bcrypt from 'bcryptjs';

/* ===============================
   GENERAR NUMERO DE CUENTA
=================================*/
export const generateAccountNumber = async () => {
    let accountNumber;
    let exists = true;

    while (exists) {
        accountNumber = Math.floor(
            1000000000 + Math.random() * 9000000000
        ).toString();

        exists = await Account.findOne({ accountNumber });
    }

    return accountNumber;
};

/* ===============================
   CREAR USUARIO (CLIENTE)
=================================*/
export const createUser = async (req, res) => {
    try {

        const {
            name,
            username,
            dpi,
            address,
            phone,
            email,
            password,
            jobName,
            monthlyIncome
        } = req.body;

        // Validar ingresos
        if (monthlyIncome < 100) {
            return res.status(400).send({
                message: 'Los ingresos deben ser mayores a Q100'
            });
        }

        // Encriptar contraseña
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Crear usuario
        const user = await User.create({
            name,
            username,
            dpi,
            address,
            phone,
            email,
            password: encryptedPassword,
            jobName,
            monthlyIncome,
            role: 'CLIENT'
        });

        // Generar número de cuenta
        const accountNumber = await generateAccountNumber();

        // Crear cuenta asociada
        await Account.create({
            accountNumber,
            externalUserId: user._id.toString(),
            balance: 0
        });

        return res.status(200).send({
            message: 'Usuario creado correctamente'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).send({
            message: 'Error al crear usuario'
        });
    }
};