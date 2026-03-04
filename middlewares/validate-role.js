'use strict';

export const USER_ROLES = {
    ADMIN: 'ADMIN_ROLE',
    USER: 'USER_ROLE'
};
export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado',
                error: 'UNAUTHORIZED',
            });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para acceder a este recurso',
                error: 'FORBIDDEN',
                requiredRole: allowedRoles,
                yourRole: userRole,
            });
        }

        next();
    };
};
