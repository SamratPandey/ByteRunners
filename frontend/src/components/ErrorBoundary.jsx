import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faRefresh } from '@fortawesome/free-solid-svg-icons';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
          <Card className="bg-gray-900 border-gray-800 p-8 max-w-lg w-full text-center">
            <div className="mb-6">
              <FontAwesomeIcon 
                icon={faExclamationTriangle} 
                className="text-yellow-500 text-4xl mb-4" 
              />
              <h2 className="text-2xl font-bold text-white mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-400 mb-4">
                We encountered an unexpected error while loading the test interface.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <FontAwesomeIcon icon={faRefresh} className="mr-2" />
                Try Again
              </Button>
              
              <Button 
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Go Home
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left bg-gray-800 p-4 rounded">
                <summary className="cursor-pointer text-sm text-gray-400 mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs text-red-400 overflow-auto max-h-40">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
