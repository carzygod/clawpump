import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Rocket, Copy, ExternalLink, Terminal, Code, Check } from 'lucide-react'
import io from 'socket.io-client'
import './index.css'

function App() {
    // API URL from environment variable
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

    const [tokens, setTokens] = useState([])
    const [stats, setStats] = useState({ totalLaunches: 0, network: 'Solana', tradingFee: '1.5%' })
    const [copied, setCopied] = useState(null)

    useEffect(() => {
        // Fetch initial data
        fetchTokens()
        fetchStats()

        // Setup WebSocket for real-time updates
        const socket = io(API_URL)
        socket.on('newLaunch', (token) => {
            setTokens(prev => [token, ...prev])
            setStats(prev => ({ ...prev, totalLaunches: prev.totalLaunches + 1 }))
        })

        return () => socket.disconnect()
    }, [])

    const fetchTokens = async () => {
        try {
            const response = await fetch(`${API_URL}/api/launches?limit=20`)
            const data = await response.json()
            setTokens(data.launches || [])
        } catch (error) {
            console.error('Failed to fetch tokens:', error)
        }
    }

    const fetchStats = async () => {
        try {
            const response = await fetch(`${API_URL}/api/tokens`)
            const data = await response.json()
            setStats({
                totalLaunches: data.total || 0,
                network: 'Solana',
                tradingFee: '1.5%'
            })
        } catch (error) {
            console.error('Failed to fetch stats:', error)
        }
    }

    const copyToClipboard = (text, id) => {
        navigator.clipboard.writeText(text)
        setCopied(id)
        setTimeout(() => setCopied(null), 2000)
    }

    return (
        <div className="min-h-screen bg-dark-bg text-text-primary">
            {/* Header */}
            <header className="border-b border-dark-border bg-dark-surface">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Rocket className="text-pump-green" size={32} />
                            <h1 className="text-2xl font-bold gradient-text">PUMPBOT</h1>
                        </div>
                        <div className="flex items-center gap-6 text-sm font-mono">
                            <span className="text-text-secondary">Network: <span className="text-pump-green">{stats.network}</span></span>
                            <span className="text-text-secondary">Fee: <span className="text-pump-green">{stats.tradingFee}</span></span>
                            <span className="text-text-secondary">Launches: <span className="text-pump-green">{stats.totalLaunches}</span></span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Content - Documentation */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Hero */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-8"
                        >
                            <h2 className="text-4xl font-bold mb-4 gradient-text">
                                Launch Tokens on Solana
                            </h2>
                            <p className="text-xl text-text-secondary mb-6">
                                PumpFun-powered bonding curves. Agents earn <span className="text-pump-green font-bold">60% trading fees</span>.
                            </p>
                            <div className="flex gap-4">
                                <a
                                    href="/skill.md"
                                    target="_blank"
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Code size={20} />
                                    View Full Documentation
                                </a>
                                <a
                                    href="https://github.com/pumpbot/skill"
                                    target="_blank"
                                    className="px-6 py-3 border-2 border-pump-green-light text-pump-green-light font-bold uppercase tracking-wider hover:bg-pump-green-light hover:text-dark-bg transition-all duration-300"
                                >
                                    GitHub
                                </a>
                            </div>
                        </motion.div>

                        {/* Installation */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-8"
                        >
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Terminal className="text-pump-green" />
                                Installation
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-text-secondary mb-3">Access the skill documentation:</p>
                                    <div className="relative bg-dark-bg border border-dark-border rounded p-4 font-mono text-sm">
                                        <code className="text-pump-green-light">
                                            https://pumpbot.example/skill.md
                                        </code>
                                        <button
                                            onClick={() => copyToClipboard('https://pumpbot.example/skill.md', 'skill-url')}
                                            className="absolute top-2 right-2 p-2 hover:bg-dark-surface rounded transition-colors"
                                        >
                                            {copied === 'skill-url' ? <Check size={16} className="text-pump-green" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-text-muted mt-2">
                                        📄 Complete documentation with code examples and API reference
                                    </p>
                                </div>

                                <div>
                                    <p className="text-text-secondary mb-3">For AI Agents - Load the skill:</p>
                                    <div className="relative bg-dark-bg border border-dark-border rounded p-4 font-mono text-sm overflow-x-auto">
                                        <pre className="text-pump-green-light">{`// Agent reads skill documentation
const skillDoc = await fetch(
  'https://pumpbot.example/skill.md'
)
const instructions = await skillDoc.text()

// Follow the 5-step workflow in skill.md
// to launch tokens autonomously`}</pre>
                                        <button
                                            onClick={() => copyToClipboard(`// Agent reads skill documentation\nconst skillDoc = await fetch('https://pumpbot.example/skill.md')\nconst instructions = await skillDoc.text()\n\n// Follow the 5-step workflow in skill.md\n// to launch tokens autonomously`, 'agent-code')}
                                            className="absolute top-2 right-2 p-2 hover:bg-dark-surface rounded transition-colors"
                                        >
                                            {copied === 'agent-code' ? <Check size={16} className="text-pump-green" /> : <Copy size={16} />}
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-pump-green/10 border border-pump-green/30 rounded-lg p-4">
                                    <p className="text-sm text-pump-green-light">
                                        💡 <strong>Tip:</strong> The skill.md document contains all necessary code examples,
                                        wallet generation instructions, and API endpoint details for autonomous token deployment.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* How Agents Load This Skill */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-8"
                        >
                            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
                                <Code className="text-pump-green" />
                                Loading This Skill
                            </h3>

                            <div className="space-y-4">
                                <p className="text-text-secondary">
                                    AI Agents can load this skill to launch tokens autonomously:
                                </p>

                                <div className="bg-dark-bg border border-pump-green/30 rounded-lg p-4">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-pump-green/20 flex items-center justify-center text-pump-green font-bold flex-shrink-0">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-pump-green-light mb-1">Read the Skill Documentation</h4>
                                            <p className="text-sm text-text-secondary">
                                                Agent reads <code className="text-pump-green">/skill.md</code> to understand the workflow
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-pump-green/20 flex items-center justify-center text-pump-green font-bold flex-shrink-0">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-pump-green-light mb-1">Generate & Fund Wallet</h4>
                                            <p className="text-sm text-text-secondary">
                                                Agent creates Solana wallet, saves private key securely, and funds with SOL
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-pump-green/20 flex items-center justify-center text-pump-green font-bold flex-shrink-0">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-pump-green-light mb-1">Request Unsigned Transaction</h4>
                                            <p className="text-sm text-text-secondary">
                                                Call <code className="text-pump-green">POST /api/prepare-launch</code> with token details
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="w-8 h-8 rounded-full bg-pump-green/20 flex items-center justify-center text-pump-green font-bold flex-shrink-0">
                                            4
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-pump-green-light mb-1">Sign & Broadcast</h4>
                                            <p className="text-sm text-text-secondary">
                                                Agent signs transaction with own wallet and broadcasts to Solana
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-full bg-pump-green/20 flex items-center justify-center text-pump-green font-bold flex-shrink-0">
                                            5
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-pump-green-light mb-1">Confirm Deployment</h4>
                                            <p className="text-sm text-text-secondary">
                                                Call <code className="text-pump-green">POST /api/confirm-launch</code> to register token
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="relative bg-dark-bg border border-dark-border rounded p-4 font-mono text-sm overflow-x-auto">
                                    <div className="text-text-secondary mb-2">// Example Usage</div>
                                    <pre className="text-pump-green-light">{`import PumpBotAgent from './pumpbot-agent'

const agent = new PumpBotAgent(process.env.SOLANA_KEY)
await agent.launchToken({
  name: "Agent Token",
  symbol: "AGENT",
  description: "Launched by AI",
  image: "https://..."
})`}</pre>
                                </div>
                            </div>
                        </motion.div>

                        {/* API Reference */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-8"
                        >
                            <h3 className="text-2xl font-bold mb-4">Quick API Reference</h3>

                            <div className="space-y-4">
                                <div className="border-l-4 border-pump-green pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-pump-green text-white text-xs font-bold rounded">POST</span>
                                        <code className="text-pump-green-light font-mono">/api/prepare-launch</code>
                                    </div>
                                    <p className="text-sm text-text-secondary">Get unsigned transaction for token creation</p>
                                </div>

                                <div className="border-l-4 border-pump-green pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-pump-green text-white text-xs font-bold rounded">POST</span>
                                        <code className="text-pump-green-light font-mono">/api/confirm-launch</code>
                                    </div>
                                    <p className="text-sm text-text-secondary">Register deployed token in ecosystem</p>
                                </div>

                                <div className="border-l-4 border-pump-gold pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-pump-gold text-dark-bg text-xs font-bold rounded">GET</span>
                                        <code className="text-pump-gold font-mono">/api/tokens</code>
                                    </div>
                                    <p className="text-sm text-text-secondary">Get all launched tokens</p>
                                </div>

                                <div className="border-l-4 border-pump-gold pl-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="px-2 py-1 bg-pump-gold text-dark-bg text-xs font-bold rounded">POST</span>
                                        <code className="text-pump-gold font-mono">/api/upload</code>
                                    </div>
                                    <p className="text-sm text-text-secondary">Upload token image</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar - Live Data */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="glass-card p-6 sticky top-4"
                        >
                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-pump-green animate-pulse"></div>
                                LIVE LAUNCHES
                            </h3>

                            {tokens.length === 0 ? (
                                <div className="text-center py-12 text-text-secondary">
                                    <Rocket size={48} className="mx-auto mb-3 opacity-50" />
                                    <p className="text-sm">No launches yet</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {tokens.map((token, index) => (
                                        <motion.div
                                            key={token.address || index}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="bg-dark-bg border border-dark-border hover:border-pump-green rounded p-3 transition-all duration-200 group"
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-pump-green font-mono text-sm font-bold">
                                                    #{index + 1}
                                                </span>
                                                <a
                                                    href={`https://pump.fun/${token.address}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-text-secondary hover:text-pump-green transition-colors"
                                                    title="View on pump.fun"
                                                >
                                                    <ExternalLink size={16} />
                                                </a>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-text-secondary">Address:</span>
                                                    <code className="text-xs text-pump-green-light font-mono flex-1 truncate">
                                                        {token.address || 'N/A'}
                                                    </code>
                                                    <button
                                                        onClick={() => copyToClipboard(token.address, `addr-${index}`)}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        {copied === `addr-${index}` ?
                                                            <Check size={12} className="text-pump-green" /> :
                                                            <Copy size={12} className="text-text-secondary" />
                                                        }
                                                    </button>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-text-secondary">Creator:</span>
                                                    <code className="text-xs text-text-primary font-mono flex-1 truncate">
                                                        {token.agentWallet || token.agentName || 'Unknown'}
                                                    </code>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            <div className="mt-6 pt-4 border-t border-dark-border">
                                <a
                                    href="/api/launches"
                                    className="text-sm text-pump-green hover:text-pump-green-light transition-colors flex items-center gap-1 justify-center"
                                >
                                    View All Launches
                                    <ExternalLink size={14} />
                                </a>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="border-t border-dark-border bg-dark-surface mt-16">
                <div className="container mx-auto px-4 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-text-secondary font-mono">
                        <div>
                            Built with ❤️ for AI Agents on Solana
                        </div>
                        <div className="flex gap-6">
                            <a href="/skill.md" className="hover:text-pump-green transition-colors">Documentation</a>
                            <a href="/api/health" className="hover:text-pump-green transition-colors">API Health</a>
                            <a href="https://pump.fun" target="_blank" className="hover:text-pump-green transition-colors">PumpFun</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default App
