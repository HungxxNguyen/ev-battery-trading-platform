// src/pages/Notifications/Notifications.jsx
import React from "react";
import { FiBell, FiClock } from "react-icons/fi";
import MainLayout from "../../components/layout/MainLayout";

const notificationsMock = [
  {
    id: "noti-1",
    title: "Tin dang da duoc duyet",
    description: "Tin VINFAST VF3 da duoc phe duyet va dang hien thi.",
    time: "2 gio truoc",
    type: "success",
  },
  {
    id: "noti-2",
    title: "Co 3 nguoi vua luu tin cua ban",
    description: "Hay tra loi tin nhan de tang ty le chot don.",
    time: "8 gio truoc",
    type: "info",
  },
  {
    id: "noti-3",
    title: "Tin dang sap het han",
    description: "Tin Nissan Leaf 40 kWh con 3 ngay se het han. Gia han ngay.",
    time: "1 ngay truoc",
    type: "warning",
  },
];

const badgeStyles = {
  success: "bg-green-100 text-green-700",
  info: "bg-blue-100 text-blue-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
};

const Notifications = () => {
  return (
    <MainLayout>
      <div className="bg-gray-50 py-8 min-h-[70vh]">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-500">
              <FiBell className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Quan ly thong bao</p>
              <h1 className="text-2xl font-bold text-gray-800">Thong bao cua ban</h1>
            </div>
          </div>

          <div className="space-y-4">
            {notificationsMock.map((noti) => (
              <div
                key={noti.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 flex gap-4"
              >
                <div
                  className={`h-10 w-10 flex items-center justify-center rounded-full ${badgeStyles[noti.type] || badgeStyles.info}`}
                >
                  <FiBell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-800">{noti.title}</p>
                      <p className="text-sm text-gray-500 mt-1">{noti.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-400 whitespace-nowrap">
                      <FiClock />
                      <span>{noti.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Notifications;
