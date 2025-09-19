// src/pages/AddListing/AddListing.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FaClipboardList,
  FaTag,
  FaMoneyBillAlt,
  FaCar,
  FaCheckCircle,
  FaChargingStation,
  FaIndustry,
  FaCalendarAlt,
  FaRoad,
  FaCogs,
  FaGasPump,
  FaTachometerAlt,
  FaWrench,
  FaCircle,
  FaPallet,
  FaDoorClosed,
  FaIdCard,
  FaTags,
  FaFileAlt,
} from "react-icons/fa";
import { Camera } from "lucide-react";
import MainLayout from "../../components/layout/MainLayout";
import { Link } from "react-router-dom";

// ======================== SCHEMA ========================
const CAR_DETAILS = [
  {
    label: "Listing Title",
    name: "listingTitle",
    fieldType: "text",
    required: true,
    icon: "FaClipboardList",
  },
  { label: "Tagline", name: "tagline", fieldType: "text", icon: "FaTag" },
  {
    label: "Price",
    name: "price",
    fieldType: "number",
    required: true,
    icon: "FaMoneyBillAlt",
  },
  {
    label: "Category",
    name: "category",
    fieldType: "dropdown",
    options: ["EV Cars", "Batteries", "Accessories"],
    required: true,
    icon: "FaCar",
  },
  {
    label: "Condition",
    name: "condition",
    fieldType: "dropdown",
    required: true,
    options: ["New", "Used", "Refurbished"],
    icon: "FaCheckCircle",
  },
  {
    label: "EV Type",
    name: "evType",
    fieldType: "dropdown",
    required: true,
    options: ["BEV", "PHEV", "HEV"],
    icon: "FaChargingStation",
  },
  {
    label: "Make",
    name: "make",
    fieldType: "dropdown",
    required: true,
    options: [
      "VinFast",
      "Tesla",
      "Porsche",
      "BMW",
      "Audi",
      "BYD",
      "KIA",
      "Hyundai",
    ],
    icon: "FaIndustry",
  },
  {
    label: "Model",
    name: "model",
    fieldType: "text",
    required: true,
    icon: "FaCar",
  },
  {
    label: "Year",
    name: "year",
    fieldType: "number",
    required: true,
    icon: "FaCalendarAlt",
  },
  {
    label: "Drive Type",
    name: "driveType",
    fieldType: "dropdown",
    required: true,
    options: ["FWD", "RWD", "AWD"],
    icon: "FaRoad",
  },
  {
    label: "Transmission",
    name: "transmission",
    fieldType: "dropdown",
    required: true,
    options: ["Automatic", "Manual"],
    icon: "FaCogs",
  },
  {
    label: "Battery Capacity (kWh)",
    name: "batteryCapacity",
    fieldType: "number",
    required: true,
    icon: "FaGasPump",
  },
  {
    label: "Range (km)",
    name: "range",
    fieldType: "number",
    required: true,
    icon: "FaTachometerAlt",
  },
  {
    label: "Charging Time (hours)",
    name: "chargingTime",
    fieldType: "number",
    required: true,
    icon: "FaWrench",
  },
  {
    label: "Color",
    name: "color",
    fieldType: "dropdown",
    required: true,
    options: ["White", "Black", "Blue", "Green", "Silver"],
    icon: "FaPallet",
  },
  {
    label: "Doors",
    name: "doors",
    fieldType: "number",
    required: true,
    icon: "FaDoorClosed",
  },
  { label: "VIN", name: "vin", fieldType: "text", icon: "FaIdCard" },
  {
    label: "Offer Type",
    name: "offerType",
    fieldType: "dropdown",
    options: ["Buy", "Hot Offer", "Sell", "Urgent"],
    icon: "FaTags",
  },
  {
    label: "Listing Description",
    name: "listingDescription",
    fieldType: "textarea",
    required: true,
    icon: "FaFileAlt",
  },
];

const FEATURES = [
  { name: "gps", label: "GPS Navigation" },
  { name: "sunroof", label: "Sunroof" },
  { name: "leatherSeats", label: "Leather Seats" },
  { name: "backupCamera", label: "Backup Camera" },
  { name: "wirelessCharging", label: "Wireless Charging" },
  { name: "autopilot", label: "Autopilot Features" },
];

// ======================== ICON MAP ========================
const ICONS = {
  FaClipboardList: <FaClipboardList />,
  FaTag: <FaTag />,
  FaMoneyBillAlt: <FaMoneyBillAlt />,
  FaCar: <FaCar />,
  FaCheckCircle: <FaCheckCircle />,
  FaChargingStation: <FaChargingStation />,
  FaIndustry: <FaIndustry />,
  FaCalendarAlt: <FaCalendarAlt />,
  FaRoad: <FaRoad />,
  FaCogs: <FaCogs />,
  FaGasPump: <FaGasPump />,
  FaTachometerAlt: <FaTachometerAlt />,
  FaWrench: <FaWrench />,
  FaCircle: <FaCircle />,
  FaPallet: <FaPallet />,
  FaDoorClosed: <FaDoorClosed />,
  FaIdCard: <FaIdCard />,
  FaTags: <FaTags />,
  FaFileAlt: <FaFileAlt />,
};

// ======================== HELPERS ========================
const valOf = (obj, name) => obj?.[name] ?? "";

// ======================== SUBCOMPONENTS ========================
const LabelWithIcon = ({ icon, label, required }) => (
  <label className="text-sm font-medium text-gray-600 flex gap-2 items-center">
    <span className="text-primary bg-green-100 p-1.5 rounded-full">
      {ICONS[icon]}
    </span>
    {label} {required && <span className="text-red-500">*</span>}
  </label>
);

const InputField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
    />
    <input
      id={item.name}
      name={item.name}
      autoComplete="off"
      type={item.fieldType === "number" ? "number" : "text"}
      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900 placeholder-gray-400"
      placeholder={`Enter ${item.label.toLowerCase()}`}
      value={valOf(formData, item.name)}
      onChange={(e) => onChange(item.name, e.target.value)}
      required={item.required}
    />
  </div>
);

const DropdownField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
    />
    <select
      id={item.name}
      name={item.name}
      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900"
      value={valOf(formData, item.name)}
      onChange={(e) => onChange(item.name, e.target.value)}
      required={item.required}
    >
      <option value="" disabled>
        Select {item.label}
      </option>
      {item.options.map((option) => (
        <option key={`${item.name}-${option}`} value={option}>
          {option}
        </option>
      ))}
    </select>
  </div>
);

const TextAreaField = ({ item, formData, onChange }) => (
  <div>
    <LabelWithIcon
      icon={item.icon}
      label={item.label}
      required={item.required}
    />
    <textarea
      id={item.name}
      name={item.name}
      rows={3}
      className="mt-2 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 bg-white text-gray-900 placeholder-gray-400"
      placeholder={`Enter ${item.label.toLowerCase()}`}
      value={valOf(formData, item.name)}
      onChange={(e) => onChange(item.name, e.target.value)}
      required={item.required}
    />
  </div>
);

// ======================== MAIN ========================
const AddListing = () => {
  const [formData, setFormData] = useState({});
  const [featuresData, setFeaturesData] = useState({});
  const [selectedImages, setSelectedImages] = useState([]);

  const handleInputChange = (name, value) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleFeaturesChange = (name, checked) =>
    setFeaturesData((prev) => ({ ...prev, [name]: checked }));

  // --- Upload by click ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
  };

  // --- Drag & Drop ---
  const handleDrop = (e) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer?.files || []);
    addFiles(files);
  };
  const handleDragOver = (e) => e.preventDefault();

  // Validate và add file
  const addFiles = (files) => {
    if (!files.length) return;
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    // optional: giới hạn tổng số ảnh (ví dụ 10)
    const remain = Math.max(0, 10 - selectedImages.length);
    const slice = files.slice(0, remain);
    const valid = slice.filter((f) => {
      const okType = allowed.includes(f.type);
      const okSize = f.size <= 10 * 1024 * 1024; // <=10MB
      return okType && okSize;
    });
    setSelectedImages((prev) => [...prev, ...valid]);
  };

  const removeImage = (index) =>
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData, featuresData, selectedImages);
    // TODO: call API save + upload
  };

  return (
    <MainLayout>
      <motion.div
        className="px-6 md:px-16 my-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="font-bold text-4xl text-gray-800 mb-4">
          Add New Listing
        </h2>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 border border-gray-200 shadow-lg rounded-2xl"
        >
          {/* Car Details */}
          <div className="mb-8">
            <h2 className="font-semibold text-2xl mb-4 text-gray-700">
              EV/Battery Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {CAR_DETAILS.map((item) => (
                <div key={item.name}>
                  {item.fieldType === "text" || item.fieldType === "number" ? (
                    <InputField
                      item={item}
                      formData={formData}
                      onChange={handleInputChange}
                    />
                  ) : item.fieldType === "dropdown" ? (
                    <DropdownField
                      item={item}
                      formData={formData}
                      onChange={handleInputChange}
                    />
                  ) : item.fieldType === "textarea" ? (
                    <TextAreaField
                      item={item}
                      formData={formData}
                      onChange={handleInputChange}
                    />
                  ) : null}
                </div>
              ))}
            </div>
          </div>

          <hr className="my-8 border-gray-200" />

          {/* Features */}
          <div className="mb-8">
            <h2 className="font-semibold text-2xl mb-4 text-gray-700">
              Features
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {FEATURES.map((feature) => (
                <label
                  key={feature.name}
                  className="flex gap-2 items-center text-gray-700"
                >
                  <input
                    type="checkbox"
                    className="h-5 w-5 border-gray-300 rounded focus:ring-indigo-400 focus:ring-2"
                    checked={!!featuresData[feature.name]}
                    onChange={(e) =>
                      handleFeaturesChange(feature.name, e.target.checked)
                    }
                  />
                  <span>{feature.label}</span>
                </label>
              ))}
            </div>
          </div>

          <hr className="my-6 border-gray-200" />

          {/* Upload Images */}
          <div className="mb-8">
            <h2 className="font-semibold text-2xl mb-4 text-gray-700">
              Upload Images
            </h2>

            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md bg-white"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <Camera className="mx-auto h-12 w-12 text-gray-500" />
                <div className="flex text-sm text-gray-600 justify-center gap-1">
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500 transition-colors duration-200"
                  >
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      multiple
                      onChange={handleImageUpload}
                    />
                  </label>

                  <p>or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  PNG, JPG, GIF, WEBP up to 10MB (Max 10 images)
                </p>
              </div>
            </div>

            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {selectedImages.map((image, index) => (
                  <div
                    key={`preview-${index}`}
                    className="relative border border-gray-200 rounded-lg p-2 bg-white"
                  >
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Preview ${index + 1}`}
                      className="w-full max-h-64 object-contain rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex justify-end mt-8">
            <button
              type="submit"
              className="px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-400 transition-all duration-200"
            >
              Submit Listing
            </button>
          </div>
        </form>
      </motion.div>
    </MainLayout>
  );
};

export default AddListing;
