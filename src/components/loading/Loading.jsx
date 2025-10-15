const Loading = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-3"></div>
    <span className="text-lg text-gray-700">Đang tải thông tin...</span>
  </div>
);

export default Loading;
