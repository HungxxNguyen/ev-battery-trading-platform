import React from "react";
import { Link } from "react-router-dom";
import { FiXCircle } from "react-icons/fi";
import { Button } from "../../components/Button/button";
import MainLayout from "../../components/layout/MainLayout";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/Card/card";

const PaymentFailed = () => {
  return (
    <MainLayout>
      <section className="bg-gradient-to-b from-gray-900 to-blue-900 py-16">
        <div className="max-w-xl mx-auto px-6">
          <Card className="bg-gray-800/80 border border-cyan-500/30 text-cyan-100 backdrop-blur-md shadow-xl shadow-cyan-500/20">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 rounded-full grid place-items-center bg-rose-500/10 ring-2 ring-rose-400/40">
                <FiXCircle className="w-9 h-9 text-rose-400" />
              </div>
              <CardTitle className="text-white text-2xl md:text-3xl">
                Thanh toán thất bại!
              </CardTitle>
              <p className="text-blue-200 mt-2">
                Rất tiếc, đã có sự cố trong quá trình thanh toán. Vui lòng thử
                lại
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/manage-listing?tab=payment">
                  <Button className="px-5 py-3">Xem tin chờ thanh toán</Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="px-5 py-3">
                    Về trang chủ
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

export default PaymentFailed;
