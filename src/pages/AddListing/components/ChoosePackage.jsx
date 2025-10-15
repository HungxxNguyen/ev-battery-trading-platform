import { useEffect, useState } from "react";
import packageService from "../../../services/apis/packageApi";

const ChoosePackage = ({ open, onClose, onConfirm, loading, category }) => {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [packageLoading, setPackageLoading] = useState(false);

  // Hàm dịch packageType
  const translatePackageType = (packageType) => {
    const typeMap = {
      ElectricCar: "Ô tô điện",
      ElectricMotorbike: "Xe máy điện",
      RemovableBattery: "Pin điện",
    };
    return typeMap[packageType] || packageType;
  };

  // Fetch packages from API and filter by selected category
  useEffect(() => {
    const fetchPackages = async () => {
      setPackageLoading(true);
      try {
        const response = await packageService.getAllPackages();
        if (response.data && response.data.data) {
          // Transform API data to match component structure
          const transformedPlans = response.data.data.map((pkg) => ({
            id: pkg.id,
            days: pkg.durationInDays,
            price: pkg.price,
            name: pkg.name,
            packageType: pkg.packageType,
            translatedPackageType: translatePackageType(pkg.packageType),
            oldPrice: null,
            discount: 0,
            description: pkg.description,
            status: pkg.status,
          }));

          // Filter by selected category if provided
          const filtered = category
            ? transformedPlans.filter((p) => p.packageType === category)
            : [];

          setPlans(filtered);
          setSelected(filtered.length > 0 ? filtered[0] : null);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setPackageLoading(false);
      }
    };

    if (open) {
      fetchPackages();
    }
  }, [open, category]);

  useEffect(() => {
    if (!open) {
      setPlans([]);
      setSelected(null);
    }
  }, [open]);

  const handleConfirm = () => {
    if (selected) {
      onConfirm(selected);
      onClose(); // Đóng modal sau khi chọn
    }
  };

  if (!open) return null;

  // When category not selected, guide user to choose category first
  if (open && !category && !packageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="font-semibold text-gray-800">Chọn gói đăng tin</div>
            <button
              type="button"
              className="px-2 text-gray-600 text-xl leading-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
            >
              x
            </button>
          </div>
          <div className="p-5 text-center">
            <div className="text-gray-600">Vui lòng chọn danh mục trước</div>
          </div>
        </div>
      </div>
    );
  }

  if (packageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
        <div className="absolute inset-0 bg-black/40" />
        <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-center px-5 py-8">
            <div className="text-gray-600">Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  if (plans.length === 0 && !packageLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => !loading && onClose()}
        />
        <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-2xl rounded-lg bg-white shadow-xl">
          <div className="flex items-center justify-between px-5 py-3 border-b">
            <div className="font-semibold text-gray-800">Chọn gói đăng tin</div>
            <button
              type="button"
              className="px-2 text-gray-600 text-xl leading-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
            >
              x
            </button>
          </div>
          <div className="p-5 text-center">
            <div className="text-gray-600">Không có gói nào khả dụng</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !loading && onClose()}
      />
      <div className="relative mx-3 mt-16 md:mt-0 w-full max-w-2xl rounded-lg bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-3 border-b">
          <div className="font-semibold text-gray-800">Chọn gói đăng tin</div>
          <button
            type="button"
            className="px-2 text-gray-600 text-xl leading-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={loading}
          >
            x
          </button>
        </div>
        <div className="p-5">
          <div className="font-semibold text-gray-800 mb-3">
            Chọn thời gian hiển thị tin
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((plan) => {
              const active = selected?.id === plan.id;
              return (
                <button
                  key={`plan-${plan.id}`}
                  type="button"
                  onClick={() => setSelected(plan)}
                  className={`relative text-left rounded-lg border px-4 py-4 cursor-pointer transition ${
                    active
                      ? "border-green-600 bg-green-50 ring-1 ring-green-200"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {plan.discount > 0 && (
                    <span className="absolute -top-2 -right-2 text-xs font-bold text-white bg-red-600 px-2 py-0.5 rounded-full">
                      -{plan.discount}%
                    </span>
                  )}
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex h-5 w-5 rounded-full border ${
                        active
                          ? "border-green-600 bg-blue-600 ring-2 ring-green-200"
                          : "border-gray-300"
                      }`}
                    />
                    <div>
                      <div className="font-semibold text-gray-800">
                        {plan.days} ngày - {plan.name}
                      </div>
                      <div className="text-gray-500">
                        {plan.oldPrice ? (
                          <>
                            <span className="line-through mr-2">
                              {Number(plan.oldPrice).toLocaleString("vi-VN")} đ
                            </span>
                            <span className="font-medium text-gray-800">
                              {Number(plan.price).toLocaleString("vi-VN")} đ
                            </span>
                          </>
                        ) : (
                          <span className="font-medium text-gray-800">
                            {Number(plan.price).toLocaleString("vi-VN")} đ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        {plan.translatedPackageType}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 font-medium cursor-pointer hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onClose}
              disabled={loading}
            >
              Quay lại
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-md font-semibold text-white bg-blue-600 hover:bg-cyan-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleConfirm}
              disabled={loading || !selected}
            >
              {loading ? "Đang xử lý..." : "Chọn gói"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoosePackage;
