import { Component } from 'react'
import { C } from '../constants/colors'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null, info: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    // In production, send to an error reporting service (Sentry, Datadog, etc.)
    console.error('[VERD1CT] Unhandled error:', error, info)
    this.setState({ info })
  }

  handleReset = () => {
    this.setState({ error: null, info: null })
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            minHeight: '100vh', background: C.bg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: C.tx, fontFamily: "'Outfit',sans-serif", padding: 24,
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: 440 }}>
            <div style={{ fontSize: 52, marginBottom: 20 }}>⚠️</div>
            <h2 style={{ fontSize: 24, fontWeight: 900, color: C.red, marginBottom: 12 }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 8, lineHeight: 1.7 }}>
              An unexpected error occurred. Your balance and positions are safe — they are stored locally and will be restored when you reload.
            </p>
            <p style={{ fontSize: 11, color: C.dim, fontFamily: "'JetBrains Mono',monospace", marginBottom: 28, wordBreak: 'break-all' }}>
              {this.state.error?.message}
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button
                onClick={this.handleReset}
                style={{
                  padding: '10px 28px', borderRadius: 12,
                  background: C.vG, border: `1px solid ${C.vio}`,
                  color: C.vio, fontWeight: 800, cursor: 'pointer', fontSize: 14,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >Try Again</button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 28px', borderRadius: 12,
                  background: 'transparent', border: `1px solid ${C.bd}`,
                  color: C.sub, fontWeight: 800, cursor: 'pointer', fontSize: 14,
                  fontFamily: "'Outfit',sans-serif",
                }}
              >Full Reload</button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
