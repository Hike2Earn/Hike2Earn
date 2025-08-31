"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  AlertTriangle, 
  RefreshCw, 
  Wallet, 
  Settings,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { 
  getErrorMessage, 
  diagnoseWalletEnvironment,
  logWalletEnvironment,
  handleMultipleWalletError 
} from "@/lib/wallet-utils";
import { useState } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
  showDetails: boolean;
}

export class WalletErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Generate unique error ID for tracking
    const errorId = `wallet_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return {
      hasError: true,
      error,
      errorId,
      showDetails: false,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.group(`🚨 Wallet Error Boundary Caught Error [${this.state.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    
    // Log comprehensive wallet environment for debugging
    logWalletEnvironment();
    
    console.groupEnd();

    this.setState({
      error,
      errorInfo,
    });

    // Report to external service if configured
    if (typeof window !== 'undefined' && (window as any).reportError) {
      (window as any).reportError(error, { 
        context: 'WalletErrorBoundary',
        errorId: this.state.errorId,
        componentStack: errorInfo.componentStack 
      });
    }
  }

  handleRetry = () => {
    console.log(`🔄 Retrying after wallet error [${this.state.errorId}]...`);
    
    // Clear error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
      showDetails: false,
    });

    // Force a small delay to let any wallet state settle
    setTimeout(() => {
      // Trigger a re-render of children
      this.forceUpdate();
    }, 500);
  };

  handleReload = () => {
    console.log(`🔄 Reloading page after wallet error [${this.state.errorId}]...`);
    window.location.reload();
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (!this.state.hasError || !this.state.error) {
      return this.props.children;
    }

    // Use custom fallback if provided
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const { error } = this.state;
    const errorDetails = getErrorMessage(error);
    const diagnostic = diagnoseWalletEnvironment();
    
    // Check for specific wallet extension conflicts
    const isPhantomConflict = error.message?.includes('evmAsk.js') || 
                             error.message?.includes('selectExtension');
    
    const isMultipleWalletError = error.message?.includes('Unexpected error') ||
                                 diagnostic.multipleProvidersDetected;

    return (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-800">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <CardTitle className="text-red-800 dark:text-red-200 flex items-center gap-2">
                  <Wallet className="w-5 h-5" />
                  {errorDetails.title}
                </CardTitle>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  Error ID: {this.state.errorId}
                </p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Main error message */}
            <div className="p-4 bg-red-50 dark:bg-red-950/40 rounded-lg border border-red-200 dark:border-red-800">
              <p className="text-red-800 dark:text-red-200 font-medium">
                {errorDetails.message}
              </p>
              
              {/* Show specific message for wallet conflicts */}
              {isMultipleWalletError && (
                <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-amber-800 dark:text-amber-200 text-sm font-medium">
                    🔧 Multiple Wallet Extensions Detected
                  </p>
                  <p className="text-amber-700 dark:text-amber-300 text-xs mt-1">
                    {handleMultipleWalletError(error)}
                  </p>
                </div>
              )}
            </div>

            {/* Wallet diagnostic info */}
            {(diagnostic.multipleProvidersDetected || diagnostic.phantomDetected) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-sm text-muted-foreground">
                    Detected Wallets:
                  </h4>
                  <div className="flex gap-1">
                    {diagnostic.providers.map((provider, index) => {
                      const name = provider.isPhantom ? 'Phantom' : 
                                  provider.isMetaMask ? 'MetaMask' :
                                  provider.isCoinbaseWallet ? 'Coinbase' : 'Unknown';
                      const isProblematic = provider.isPhantom;
                      
                      return (
                        <Badge 
                          key={index}
                          variant={isProblematic ? "destructive" : "outline"}
                          className="text-xs"
                        >
                          {name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>

                {diagnostic.conflicts.length > 0 && (
                  <div className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/20 p-2 rounded border border-amber-200 dark:border-amber-800">
                    <strong>Conflicts:</strong>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {diagnostic.conflicts.map((conflict, index) => (
                        <li key={index}>{conflict}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action suggestions */}
            {errorDetails.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-sm text-muted-foreground">
                  💡 Suggested Solutions:
                </h4>
                <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                  <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                    {errorDetails.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 dark:text-blue-400 font-bold text-xs mt-0.5">
                          {index + 1}.
                        </span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              <Button 
                onClick={this.handleRetry}
                className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>

              <Button 
                variant="outline" 
                onClick={this.handleReload}
                className="flex-1 border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>

              {/* Link to wallet management */}
              <Button 
                variant="outline" 
                size="sm"
                asChild
                className="border-purple-200 hover:bg-purple-100 dark:hover:bg-purple-950/40"
              >
                <a 
                  href="chrome://extensions/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title="Open Chrome Extensions"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Manage Extensions
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </Button>
            </div>

            {/* Technical details (collapsible) */}
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={this.toggleDetails}
                className="w-full justify-between text-muted-foreground hover:text-foreground"
              >
                <span className="text-xs">Technical Details</span>
                {this.state.showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>

              {this.state.showDetails && (
                <div className="mt-3 space-y-2">
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border text-xs font-mono">
                    <div className="space-y-1">
                      <div><strong>Error:</strong> {error.name}</div>
                      <div><strong>Message:</strong> {error.message}</div>
                      <div><strong>Time:</strong> {new Date().toISOString()}</div>
                      {error.stack && (
                        <div className="mt-2">
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>

                  {this.state.errorInfo && (
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border text-xs font-mono">
                      <strong>Component Stack:</strong>
                      <pre className="mt-1 text-xs overflow-x-auto whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  {/* Wallet environment info */}
                  <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg border text-xs">
                    <strong>Wallet Environment:</strong>
                    <div className="mt-1 space-y-1">
                      <div>Has Ethereum: {diagnostic.hasEthereum ? '✅' : '❌'}</div>
                      <div>Providers: {diagnostic.providers.length}</div>
                      <div>Multiple Providers: {diagnostic.multipleProvidersDetected ? '⚠️' : '✅'}</div>
                      <div>Phantom Detected: {diagnostic.phantomDetected ? '⚠️' : '✅'}</div>
                      <div>User Agent: {navigator.userAgent}</div>
                      <div>Timestamp: {Date.now()}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
}

// Hook version for functional components
export function useWalletErrorHandler() {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error) => {
    console.error('🚨 Wallet error handled:', error);
    logWalletEnvironment();
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  const retry = (callback: () => void | Promise<void>) => {
    clearError();
    setTimeout(async () => {
      try {
        await callback();
      } catch (newError) {
        handleError(newError as Error);
      }
    }, 500);
  };

  return {
    error,
    handleError,
    clearError,
    retry,
    hasError: !!error,
  };
}