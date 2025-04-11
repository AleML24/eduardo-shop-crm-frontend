export const fetchNextProductCode = async () => {
    try {
        const request = await $axios.get('/products/get-next-product-code');
        return {
            success: request?.data?.success,
            data: request?.data?.data,
            message: request?.data?.message,
            meta: request?.data?.meta
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al obtener código",
            data: null,
            meta: null
        };
    }
};

export const submitProduct = async (productData) => {
    try {
        const request = await $axios.post('/products', productData);
        return {
            success: request?.data?.success,
            data: request?.data?.data,
            message: request?.data?.message,
            meta: request?.data?.meta
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al crear producto",
            data: error.response?.data?.errors || null,
            meta: null
        };
    }
};

export const fetchCategories = async () => {
    try {
        const response = await $axios.get('/categories/get-names');
        return {
            success: true,
            data: response.data.data.map(cat => ({ 
                title: cat.name, 
                value: cat.id 
            }))
        };
    } catch (error) {
        return {
            success: false,
            message: "Error al cargar categorías"
        };
    }
};

export const fetchSubcategories = async (categoryId) => {
    try {
        const response = await $axios.get(`/subcategories/by-category/${categoryId}`);
        
        return {
            success: true,
            data: response.data.data.map(sub => ({ 
                title: sub.name, 
                value: sub.id 
            }))
        };
    } catch (error) {
        let message = "Error al cargar subcategorías";
        
        // Manejo específico de errores
        if (error.response) {
            if (error.response.status === 404) {
                message = "Categoría no encontrada";
            } else if (error.response.data?.message) {
                message = error.response.data.message;
            }
        }
        
        return {
            success: false,
            message: message,
            data: null
        };
    }
};

export const fetchProductById = async (id) => {
    try {
        const response = await $axios.get(`/products/${id}`);
        
        if (response.data?.success && response.data?.data) {
            const productData = response.data.data;
            
            return {
                success: true,
                data: {
                    code: productData.code,
                    name: productData.name,
                    description: productData.description,
                    price: productData.price,
                    amount: productData.amount,
                    state: productData.state,
                    dimension: productData.dimension,
                    weight: productData.weight,
                    capacity: productData.capacity,
                    color: productData.color || [''],
                    category_id: productData.category_id || productData.category?.id || null,
                    subcategory_id: productData.subcategory_id || productData.subcategory?.id || null,
                    visible: Boolean(productData.visible), // Asegurar valor booleano
                    destacated: Boolean(productData.destacated), // Asegurar valor booleano
                    category: productData.category,
                    subcategory: productData.subcategory,
                    images: productData.images || [],
                },
                message: response.data.message
            };
        }
        throw new Error(response.data?.message || 'Estructura de respuesta inválida');
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Error al cargar producto',
            data: null
        };
    }
};

export const updateProduct = async (productId, data) => {
    let message = null;
    let success = null;
    let responseData = null;

    try {
        const request = await $axios.put(`/products/${productId}`, data);
        
        success = request?.data?.success;
        responseData = request?.data?.data;
        message = request?.data?.message;
        
        return { success, message, data: responseData };

    } catch (error) {
        message = error?.response?.data?.message || error?.message || "Error al actualizar el producto";
        success = false;
        return { success, message, data: null };
    }
}
