import { API_ENDPOINTS_BRAND } from "../../constants/apiEndPoint";
import { performApiRequest } from "../../utils/apiUtils";

// Chuẩn hoá response từ API
function extractItems(payload) {
  const p = payload?.data ?? payload;
  if (Array.isArray(p)) return p;
  if (Array.isArray(p?.items)) return p.items;
  if (Array.isArray(p?.data)) return p.data;
  if (p && typeof p === "object") {
    for (const k of Object.keys(p)) if (Array.isArray(p[k])) return p[k];
  }
  return [];
}

const brandService = {
  async getBrands() {
    return await performApiRequest(API_ENDPOINTS_BRAND.GET_BRANDS, { method: "get" });
  },

  // trả về dữ liệu về Map -> tăng performance join data
  async getBrandsAsMap() {
    const res = await this.getBrands();
    const items = extractItems(res);
    return new Map(
      items.map((b) => [
        b?.id ?? b?.brandId ?? b?.Id, //Key: brandId
        { name: b?.name ?? b?.brandName ?? "Unknown", type: b?.type ?? b?.category ?? "" },
      ])
    );
  },

  async getBrandById(id) {
    if (!id) throw new Error("Thiếu id thương hiệu");
    return await performApiRequest(API_ENDPOINTS_BRAND.GET_BY_ID(id), { method: "get" });
  },

  async createBrand(name, type) {
    //Validation
    if (!name || !name.trim()) throw new Error("Tên thương hiệu không hợp lệ");

    //Chuẩn bị form Data
    const form = new FormData();
    form.append("Name", name.trim());
    form.append("Type", type);

    //Gửi Post request
    return await performApiRequest(API_ENDPOINTS_BRAND.CREATE, {
      method: "post",
      data: form,
      // headers: axios tự động set
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
    });
  },

  async deleteBrand(id) {
    if (!id) throw new Error("Thiếu id thương hiệu");
    return await performApiRequest(API_ENDPOINTS_BRAND.DELETE(id), { method: "delete" });
  },
};

export default brandService;
