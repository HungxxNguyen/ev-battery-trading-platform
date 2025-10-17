import React from "react";
import { Link } from "react-router-dom";
import { FiCheckCircle } from "react-icons/fi";
import { Button } from "../../components/Button/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card/card";
import MainLayout from "../../components/layout/MainLayout";

const PaymentSuccess = () => {
  return (
    <MainLayout>
      <section className="bg-gradient-to-b from-gray-900 to-blue-900 py-16">
        <div className="max-w-xl mx-auto px-6">
          <Card className="bg-gray-800/80 border border-cyan-500/30 text-cyan-100 backdrop-blur-md shadow-xl shadow-cyan-500/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full grid place-items-center bg-emerald-500/10 ring-2 ring-emerald-400/40">
                <FiCheckCircle className="w-9 h-9 text-emerald-400" />
              </div>
              <CardTitle className="text-white text-2xl md:text-3xl">
                Thanh toán thành công!
              </CardTitle>
              <p className="text-blue-200 mt-2">
                Cảm ơn bạn đã thanh toán gói đăng tin của
                <span className="font-semibold"> VoltX</span>. Tin đăng của bạn
                đang được xử lý và sẽ sớm được duyệt.
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/">
                  <Button className="px-5 py-3">Về trang chủ</Button>
                </Link>
                <Link to="/manage-listing?tab=pending">
                  <Button variant="outline" className="px-5 py-3">
                    Xem tin chờ duyệt
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </MainLayout>
  );
};

export default PaymentSuccess;
