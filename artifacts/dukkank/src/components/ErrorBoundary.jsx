import React from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleHardRefresh = () => {
    try {
      if (typeof window !== "undefined" && "caches" in window) {
        caches.keys().then(names => {
          names.forEach(name => caches.delete(name));
        });
      }
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-[hsl(var(--brand-cream))] grain-bg rounded-3xl border border-red-500/20 text-center my-6">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto animate-pulse">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[hsl(var(--brand-ink))]">عفواً! حدث خطأ غير متوقع</h2>
            <p className="text-sm text-[hsl(var(--brand-ink))]/70 dir-rtl">
              حدث خطأ مؤقت في تحميل هذا الجزء بسبب التحديث المباشر للمتجر. يمكنك تحديث الصفحة لتحميل النسخة الأحدث فوراً.
            </p>
            {this.state.error?.message && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-mono text-red-600 text-left overflow-auto max-h-32">
                {this.state.error.message}
              </div>
            )}
            <div className="flex items-center justify-center gap-3 pt-2 flex-wrap">
              <button
                type="button"
                onClick={() => this.setState({ hasError: false, error: null })}
                className="px-5 py-2.5 rounded-full bg-[hsl(var(--brand-blue-deep))] text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" /> إعادة المحاولة
              </button>
              <button
                type="button"
                onClick={this.handleHardRefresh}
                className="px-5 py-2.5 rounded-full bg-slate-800 text-white font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-md cursor-pointer"
              >
                تحديث الصفحة والكاش 🔄
              </button>
              <a
                href="/"
                className="px-5 py-2.5 rounded-full bg-white dark:bg-white/10 text-[hsl(var(--brand-ink))] font-bold text-sm flex items-center gap-2 border border-black/10 hover:bg-black/5 transition-all"
              >
                <Home className="w-4 h-4" /> الرئيسية
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
