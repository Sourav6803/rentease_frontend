'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  title?: string
}

interface State {
  hasError: boolean
  message?: string
}

export class AdminErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: unknown): State {
    const message = error instanceof Error ? error.message : 'An unexpected error occurred.'
    return { hasError: true, message }
  }

  handleReset = () => {
    this.setState({ hasError: false, message: undefined })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[60vh] items-center justify-center p-6">
          <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-white p-6 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50">
              <AlertCircle className="h-6 w-6 text-rose-500" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">Something went wrong</h3>
            <p className="mt-1 text-sm text-slate-500">
              {this.state.message ?? 'This section failed to load.'}
            </p>
            <Button className="mt-5 gap-1.5" size="sm" onClick={this.handleReset}>
              <RotateCw className="h-3.5 w-3.5" />
              Retry
            </Button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

export default AdminErrorBoundary
