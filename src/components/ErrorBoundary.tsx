import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0f172a] text-white p-6 flex flex-col items-center justify-center font-sans">
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-2xl max-w-md w-full text-center space-y-4">
            <h2 className="text-xl font-bold text-red-400">Oops, terjadi kesalahan</h2>
            <p className="text-sm text-red-200/70 overflow-auto max-h-32 p-2 bg-black/20 rounded">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
            >
              Reset Aplikasi & Muat Ulang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
