import { motion, AnimatePresence } from 'framer-motion'
import { X, ExternalLink, Copy, Check, Twitter, Globe } from 'lucide-react'
import { useState } from 'react'
import BondingCurveChart from './BondingCurveChart'

export default function TokenModal({ token, onClose }) {
    const [copied, setCopied] = useState(false)

    const copyAddress = () => {
        navigator.clipboard.writeText(token.address)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="glass-card max-w-4xl w-full max-h-[90vh] overflow-y-auto tech-border"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-dark-surface/95 backdrop-blur-md border-b border-dark-border p-6 flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <img
                                src={token.image}
                                alt={token.name}
                                className="w-16 h-16 rounded-lg border border-pump-green"
                                onError={(e) => {
                                    e.target.src = `https://via.placeholder.com/200/111716/0d9488?text=${token.symbol}`
                                }}
                            />
                            <div>
                                <h2 className="text-3xl font-bold gradient-text">{token.name}</h2>
                                <p className="font-mono text-text-secondary">${token.symbol}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-text-secondary hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Description */}
                        <div>
                            <h3 className="text-lg font-bold mb-2 text-pump-green">Description</h3>
                            <p className="text-text-secondary">{token.description}</p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <StatBox label="Market Cap" value={`$${formatNumber(token.marketCap)}`} />
                            <StatBox label="Bonding Progress" value={`${token.bondingProgress}%`} />
                            <StatBox label="24h Volume" value={`$${formatNumber(token.volume24h || 0)}`} />
                            <StatBox
                                label="24h Change"
                                value={`${token.priceChange24h > 0 ? '+' : ''}${token.priceChange24h?.toFixed(2) || 0}%`}
                                valueClass={token.priceChange24h > 0 ? 'text-pump-green' : 'text-red-500'}
                            />
                        </div>

                        {/* Bonding Curve Chart */}
                        <div>
                            <h3 className="text-lg font-bold mb-4 text-pump-green">Bonding Curve</h3>
                            <BondingCurveChart progress={token.bondingProgress} />
                        </div>

                        {/* Contract & Agent Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="glass-card p-4">
                                <h4 className="text-sm font-mono text-text-secondary mb-2">Contract Address</h4>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 font-mono text-sm text-pump-green truncate">
                                        {token.address}
                                    </code>
                                    <button
                                        onClick={copyAddress}
                                        className="text-text-secondary hover:text-pump-green transition-colors"
                                    >
                                        {copied ? <Check size={16} /> : <Copy size={16} />}
                                    </button>
                                </div>
                            </div>

                            <div className="glass-card p-4">
                                <h4 className="text-sm font-mono text-text-secondary mb-2">Launched By</h4>
                                <div>
                                    <p className="font-bold text-pump-gold">{token.agentName || 'Unknown Agent'}</p>
                                    <p className="font-mono text-xs text-text-muted truncate">{token.agentWallet}</p>
                                </div>
                            </div>
                        </div>

                        {/* Social Links */}
                        {(token.website || token.twitter) && (
                            <div>
                                <h3 className="text-lg font-bold mb-3 text-pump-green">Links</h3>
                                <div className="flex gap-3">
                                    {token.website && (
                                        <a
                                            href={token.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 glass-card hover:border-neon-green transition-colors"
                                        >
                                            <Globe size={16} />
                                            <span className="font-mono text-sm">Website</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                    {token.twitter && (
                                        <a
                                            href={token.twitter.startsWith('http') ? token.twitter : `https://twitter.com/${token.twitter.replace('@', '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-2 px-4 py-2 glass-card hover:border-neon-green transition-colors"
                                        >
                                            <Twitter size={16} />
                                            <span className="font-mono text-sm">Twitter</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Trading Links */}
                        <div className="flex gap-3">
                            <a
                                href={`https://dexscreener.com/solana/${token.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 btn-primary text-center"
                            >
                                View on DexScreener
                            </a>
                            <a
                                href={`https://raydium.io/swap/?inputCurrency=sol&outputCurrency=${token.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 px-6 py-3 border-2 border-pump-green-light text-pump-green-light font-bold uppercase tracking-wider hover:bg-pump-green-light hover:text-dark-bg transition-all duration-300 text-center"
                            >
                                Trade on Raydium
                            </a>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}

function StatBox({ label, value, valueClass = 'text-neon-green' }) {
    return (
        <div className="glass-card p-4">
            <p className="text-xs text-text-secondary mb-1 font-mono uppercase">{label}</p>
            <p className={`text-2xl font-bold font-mono ${valueClass}`}>{value}</p>
        </div>
    )
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
}
