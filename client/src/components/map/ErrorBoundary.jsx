import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-[#122438] text-white p-6 rounded-2xl border border-white/10">
          <h2 className="text-xl font-bold text-red-400 mb-2">Map Display Error</h2>
          <p className="text-sm text-white/70 text-center max-w-md mb-4">
            Something went wrong while displaying the map.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
