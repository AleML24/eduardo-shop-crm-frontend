export const fetchProducts = async (page, itemsPerPage, sortBy, orderBy, selectedCategory, selectedSubCategory) => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/products`, {
            params: {
                page,
                itemsPerPage,
                sortBy,
                orderBy,
                selectedCategory,
                selectedSubCategory
            }
        })

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

export const fetchFilters = async () => {
    let message = null;
    let success = null;
    let data = null;
    let meta = null;

    try {
        const request = await $axios.get(`/categories/get-names`,)
        console.log(request);
        
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
