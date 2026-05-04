import { AlertCircle, CheckCircle } from "lucide-react";
import type { Toast } from "../types";

type AdminToastProps = {
  toast: Toast;
};

export default function AdminToast({ toast }: AdminToastProps) {
  return (
    <div
      className={`fixed top-4 right-4 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-body shadow-xl transition-all ${
        toast.type === "error"
          ? "bg-red-900/80 text-red-200 border border-red-700/50"
          : "bg-emerald-900/80 text-emerald-200 border border-emerald-700/50"
      }`}
    >
      {toast.type === "error" ? (
        <AlertCircle size={16} />
      ) : (
        <CheckCircle size={16} />
      )}
      {toast.msg}
    </div>
  );
}
