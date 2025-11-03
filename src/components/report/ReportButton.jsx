import React, { useMemo, useState } from "react";
import ReportModal from "./ReportModal";

function getToken() {
  // App stores token under 'token' via AuthContext
  return localStorage.getItem("token");
}

export default function ReportButton({
  listingId,
  userId,
  ownerId,
  token,
  label = "Báo cáo tin",
  className = "",
  variant = "link", // 'link' | 'button'
}) {
  const [open, setOpen] = useState(false);
  const effectiveToken = useMemo(() => token || getToken(), [token]);
  const isOwner = useMemo(() => {
    if (!userId || !ownerId) return false;
    try {
      return String(userId) === String(ownerId);
    } catch {
      return false;
    }
  }, [userId, ownerId]);

  if (isOwner) return null;

  const baseClasses =
    variant === "button"
      ? "inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
      : "inline-flex items-center gap-1 text-sm text-gray-500 hover:text-red-600 cursor-pointer";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`${baseClasses} ${className}`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="opacity-80"
        >
          <path d="M4 4h1a1 1 0 0 1 1 1v6.382A2.996 2.996 0 0 1 7 11h11l-1.5 3L18 17H7a3 3 0 0 1-1-.184V20a1 1 0 1 1-2 0V5a1 1 0 0 1 1-1z" />
        </svg>
        <span>{label}</span>
      </button>

      <ReportModal
        open={open}
        onClose={() => setOpen(false)}
        listingId={listingId}
        userId={userId}
        ownerId={ownerId}
        token={effectiveToken}
      />
    </>
  );
}

