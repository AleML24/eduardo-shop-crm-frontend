export const fetchCategories = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/categories/get-names`)
        console.log("Categorias cargadas desde index.js",request);

        success = request?.data?.success;
        data = request?.data?.data
        message = request?.data?.message;
        meta = request?.data?.meta;
        return { success, message, data, meta }

    } catch (error) {
        message = error?.response?.data?.message || error || "Ocurrió un error al actualizar el evento";

        success = false;
        return { success, message, data, meta }

    }

}

export const submitCategory = async (categoryData) => {
    try {
        const request = await $axios.post('/categories', categoryData);
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


export const updateCategory = async (categoryId, data) => {
    try {
        const request = await $axios.put(`/categories/${categoryId}`, {
            name: data.name // Envía el nombre directamente en el cuerpo
        });
        
        // Asegurar formato de respuesta consistente
        return {
            success: true,
            data: request.data?.data || request.data,
            message: request.data?.message || 'Categoría actualizada',
            meta: request.data?.meta || null
        };
    } catch (error) {
        console.error("Error en updateCategory:", error.response?.data || error);
        return {
            success: false,
            message: error.response?.data?.message || 
                   error.response?.data?.errors?.name?.[0] || 
                   "Error al actualizar la categoría",
            data: error.response?.data?.errors || null,
            meta: null
        };
    }
};

export const deleteCategory = async (categoryId) => {
    try {
        const request = await $axios.delete(`/categories/${categoryId}`);
        return {
            success: request?.data?.success,
            message: request?.data?.message,
            data: request?.data?.data
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al eliminar subcategoría"
        };
    }
};

// Para subcategorías
export const submitSubcategory = async (subcategoryData) => {
    try {
        const request = await $axios.post('/subcategories', subcategoryData);
        return {
            success: request?.data?.success,
            data: request?.data?.data,
            message: request?.data?.message,
            meta: request?.data?.meta
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al crear subcategoría",
            data: error.response?.data?.errors || null,
            meta: null
        };
    }
};

export const updateSubcategory = async (subcategoryId, data) => {
    try {
        const request = await $axios.put(`/subcategories/${subcategoryId}`, {
            name: data.name,
            category_id: data.category_id
        });
        
        return {
            success: request.data?.success ?? true,
            data: request.data?.data ?? request.data,
            message: request.data?.message || 'Subcategoría actualizada correctamente',
            meta: request.data?.meta || null
        };
    } catch (error) {
        console.error("Error en updateSubcategory:", error.response?.data || error);
        return {
            success: false,
            message: error.response?.data?.message || 
                   error.response?.data?.errors?.name?.[0] || 
                   "Error al actualizar la subcategoría",
            data: error.response?.data?.errors || null,
            meta: null
        };
    }
};

export const deleteSubcategory = async (subcategoryId) => {
    try {
        const request = await $axios.delete(`/subcategories/${subcategoryId}`);
        return {
            success: request?.data?.success,
            message: request?.data?.message,
            data: request?.data?.data
        };
    } catch (error) {
        return {
            success: false,
            message: error?.response?.data?.message || "Error al eliminar subcategoría"
        };
    }
};