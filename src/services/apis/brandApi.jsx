import { API_ENDPOINTS_BRAND } from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

const brandService = {
  async getBrands() {
    return await performApiRequest(API_ENDPOINTS_BRAND.GET_BRANDS, {
      method: "get",
    });
  },

  async getBrandById(id) {
    if (!id) throw new Error("Thiếu id thương hiệu");
    return await performApiRequest(API_ENDPOINTS_BRAND.GET_BY_ID(id), {
      method: "get",
    });
  },

  async createBrand(name) {
    if (!name || !name.trim()) throw new Error("Tên thương hiệu không hợp lệ");
    const form = new FormData();
    form.append("Name", name.trim());
    return await performApiRequest(API_ENDPOINTS_BRAND.CREATE, {
      method: "post",
      data: form,
      headers: {
        // Let axios set multipart when sending FormData
      },
    });
  },

  async updateBrand(id, name) {
    if (!id) throw new Error("Thiếu id thương hiệu");
    if (!name || !name.trim()) throw new Error("Tên thương hiệu không hợp lệ");
    const form = new FormData();
    form.append("Id", id);
    form.append("Name", name.trim());
    return await performApiRequest(API_ENDPOINTS_BRAND.UPDATE, {
      method: "put",
      data: form,
      headers: {
        // Let axios set multipart when sending FormData
      },
    });
  },

  async deleteBrand(id) {
    if (!id) throw new Error("Thiếu id thương hiệu");
    return await performApiRequest(API_ENDPOINTS_BRAND.DELETE(id), {
      method: "delete",
    });
  },
};

export default brandService;
