
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
  componentName?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
    
    // Here you could send this to a monitoring service like Sentry, LogRocket, etc.
  }

  resetErrorBoundary = (): void => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default error UI
      return (
        <Card className="border-error-300 shadow-md">
          <CardHeader className="bg-error-50">
            <CardTitle className="flex items-center text-error-700">
              <AlertTriangle className="mr-2 h-5 w-5" />
              An error occurred
              {this.props.componentName && ` in ${this.props.componentName}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-sm text-gray-600 mb-4">
              {this.state.error?.message || 'Unknown error'}
            </div>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-[200px]">
                <pre>{this.state.error.stack}</pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="bg-gray-50 flex justify-end">
            <Button 
              variant="outline" 
              onClick={this.resetErrorBoundary}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}
