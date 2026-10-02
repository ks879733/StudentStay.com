import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OwnerBackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate("/owner/dashboard")}
      className="mb-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-200 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      aria-label="Back to owner dashboard"
    >
      <ArrowLeft className="h-4 w-4" aria-hidden="true" />
      <span>Dashboard</span>
    </button>
  );
};

export default OwnerBackButton;
