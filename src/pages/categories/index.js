export const fetchCategories = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/categories`)
        console.log("Categorias cargadas",request);

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

// export const fetchFilters = async () => {
//     let message = null;
//     let success = null;
//     let data = null;
//     let meta = null;

//     try {
//         const request = await $axios.get(`/categories/get-names`,)
//         console.log(request);
        
//         success = request?.data?.success;
//         data = request?.data?.data
//         message = request?.data?.message;
//         meta = request?.data?.meta;
//         return { success, message, data, meta }

//     } catch (error) {
//         message = error?.response?.data?.message || error || "Ocurrió un error al actualizar el evento";

//         success = false;
//         return { success, message, data, meta }

//     }
// }

// export const updateProduct = async (productId, data) => {
//     let message = null;
//     let success = null;
//     let responseData = null;

//     try {
//         const request = await $axios.put(`/products/${productId}`, data);
        
//         success = request?.data?.success;
//         responseData = request?.data?.data;
//         message = request?.data?.message;
        
//         return { success, message, data: responseData };

//     } catch (error) {
//         message = error?.response?.data?.message || error?.message || "Error al actualizar el producto";
//         success = false;
//         return { success, message, data: null };
//     }
// };