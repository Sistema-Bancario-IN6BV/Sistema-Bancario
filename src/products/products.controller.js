
import Product from './product.model.js';
// Crear producto
export const createProduct = async (req, res) => {
    try {
        const data = req.body;

        const product = new Product(data);
        await product.save();

        res.status(201).json({
            success: true,
            message: 'Producto creado exitosamente',
            data: product
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear la cuenta',
            error: error.message
        });
    }
};

// Obtener Productos
export const getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 10,  isActive = true} = req.query;

        const filter = { isActive };

        const fields = await Field.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Product.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: products,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener las cuentas',
            error: error.message
        });
    }
};

// Obtener producto por ID
export const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            success: true,
            data: product
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener el producto',
            error: error.message
        });
    }
};

// Actualizar producto
export const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const currentProduct = await Product.findById(id);
        if (!currentProduct) {
            return res.status(404).json({
                success: false,
                message: "Producto no encontrado",
            });
        }

        const updateData = { ...req.body };


        const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
            new: true,
            runValidators: true,
        });

        res.status(200).json({
            success: true,
            message: "Campo actualizado exitosamente",
            data: updatedField,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error al actualizar campo",
            error: error.message,
        });
    }
};

export const changeProductStatus = async (req, res) => {
    try {
        const { id } = req.params;
        // Detectar si es activate o deactivate desde la URL
        const isActive = req.url.includes('/activate');
        const action = isActive ? 'activado' : 'desactivado';

        const product = await Product.findByIdAndUpdate(
            id,
            { isActive },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Producto no encontrado',
            });
        }

        res.status(200).json({
            success: true,
            message: `Producto ${action} exitosamente`,
            data: product,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al cambiar el estado del producto',
            error: error.message,
        });
    }
};
