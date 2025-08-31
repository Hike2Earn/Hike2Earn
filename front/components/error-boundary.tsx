"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      retryCount: 0,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🚨 Error caught by ErrorBoundary:", error);
    console.error("🚨 Error message:", error.message);
    console.error("🚨 Error stack:", error.stack);
    console.error("🚨 Error info:", errorInfo);
    console.error("🚨 Component stack:", errorInfo.componentStack);

    // Additional debugging info
    console.error("🚨 Current state:", this.state);

    this.setState({
      error,
      errorInfo,
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Auto-retry logic with exponential backoff
    if (this.state.retryCount < 3) {
      const retryDelay = Math.pow(2, this.state.retryCount) * 1000; // 1s, 2s, 4s
      console.log(
        `⏰ Auto-retry in ${retryDelay}ms (attempt ${
          this.state.retryCount + 1
        }/3)`
      );

      this.retryTimeoutId = setTimeout(() => {
        this.handleRetry(true);
      }, retryDelay);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = (isAutoRetry = false) => {
    console.log(
      `🔄 ${isAutoRetry ? "Auto-retrying" : "Manual retry"} component render...`
    );

    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: isAutoRetry ? prevState.retryCount + 1 : 0,
    }));

    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = undefined;
    }
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="backdrop-blur-md bg-white/10 border border-red-500/20 rounded-xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-red-400 mb-2">
                Something went wrong
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                {this.state.error?.message || "An unexpected error occurred"}
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => this.handleRetry(false)}
                variant="outline"
                className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="w-full"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
                  Show Error Details
                </summary>
                <div className="mt-3 p-3 bg-black/20 rounded border border-white/10">
                  <p className="text-xs font-mono text-red-300">
                    {this.state.error.name}: {this.state.error.message}
                  </p>
                  <pre className="text-xs font-mono text-muted-foreground mt-2 overflow-auto">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-xs font-mono text-muted-foreground mt-2 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {this.state.retryCount > 0 && (
              <p className="text-xs text-muted-foreground mt-4">
                Retry attempts: {this.state.retryCount}/3
              </p>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier use
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
}

// Hook for handling async errors in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = React.useCallback((error: Error) => {
    console.error("🚨 Async error handled:", error);
    setError(error);
  }, []);

  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  // Throw error to be caught by ErrorBoundary
  if (error) {
    throw error;
  }

  return { handleError, clearError };
}
