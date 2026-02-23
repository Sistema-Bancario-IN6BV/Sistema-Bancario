export const createUser = async (req, res) => {
    try {

        if (req.user?.role !== 'ADMIN') {
            return res.status(403).json({
                message: 'Solo el admin puede crear usuarios'
            });
        }

        return res.status(200).json({
            message: 'Usuario creado'
        });

    } catch (err) {
        return res.status(500).json({ err });
    }
};