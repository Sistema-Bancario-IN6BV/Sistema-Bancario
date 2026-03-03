import swaggerJsdoc from "swagger-jsdoc";

const BASE_PATH = "/bankSystem/v1";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Bank System API",
            version: "1.0.0",
            description: "Documentación oficial del sistema bancario",
        },
        servers: [
            {
                url: `http://localhost:3000${BASE_PATH}`,
                description: "Servidor local",
            },
        ],
        tags: [
            { name: "Accounts", description: "Gestión de cuentas bancarias" },
            { name: "Favorites", description: "Gestión de cuentas favoritas" },
            { name: "Products", description: "Gestión de productos bancarios" },
            { name: "Transactions", description: "Gestión de transacciones" },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                Account: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65f2ca7e77f8b30f5077aa11" },
                        externalUserId: { type: "string", example: "USR-001" },
                        accountNumber: { type: "string", example: "10081234567890" },
                        balance: { type: "number", format: "float", example: 2500.75 },
                        status: { type: "string", enum: ["ACTIVE", "BLOCKED", "CLOSED"], example: "ACTIVE" },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Favorite: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65f2ca7e77f8b30f5077bb22" },
                        externalUserId: { type: "string", example: "USR-001" },
                        accountId: { type: "string", example: "65f2ca7e77f8b30f5077aa11" },
                        alias: { type: "string", example: "Cuenta principal" },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Product: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65f2ca7e77f8b30f5077cc33" },
                        name: { type: "string", example: "Seguro de vida" },
                        description: { type: "string", example: "Cobertura anual para titular" },
                        price: { type: "number", format: "float", example: 120.5 },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                Transaction: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65f2ca7e77f8b30f5077dd44" },
                        type: { type: "string", enum: ["TRANSFER", "DEPOSIT", "PURCHASE", "CREDIT", "REVERSAL"], example: "TRANSFER" },
                        amount: { type: "number", format: "float", example: 500 },
                        sourceAccount: { type: "string", nullable: true, example: "65f2ca7e77f8b30f5077aa11" },
                        destinationAccount: { type: "string", nullable: true, example: "65f2ca7e77f8b30f5077aa12" },
                        description: { type: "string", example: "Pago de servicios" },
                        isReversible: { type: "boolean", example: true },
                        isReversed: { type: "boolean", example: false },
                        isActive: { type: "boolean", example: true },
                        createdAt: { type: "string", format: "date-time" },
                        updatedAt: { type: "string", format: "date-time" },
                    },
                },
                ApiError: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        message: { type: "string", example: "Error en la operación" },
                        error: { type: "string", example: "Detalle técnico" },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ["./src/**/*.router.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;