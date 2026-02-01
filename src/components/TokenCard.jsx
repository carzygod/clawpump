import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'

export default function TokenCard({ token, onClick }) {
    const {
        name,
        symbol,
        image,
        marketCap,
        bondingProgress = 0,
        priceChange24h = 0,
        agentName
    } = token

    const isPositive = priceChange24h > 0

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.02 }}
            className="glass-card p-5 cursor-pointer tech-border token-card-enter group"
            onClick={onClick}
        >
            {/* Token Image */}
            <div className="relative mb-4">
                <div className="w-full aspect-square rounded-lg overflow-hidden bg-dark-bg border border-dark-border group-hover:border-pump-green transition-colors">
                    <img
                        src={image || '/placeholder-token.png'}
                        alt={name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.target.src = `https://via.placeholder.com/200/111716/0d9488?text=${symbol}`
                        }}
                    />
                </div>

                {/* Bonding Progress Badge */}
                <div className="absolute -top-2 -right-2 bg-dark-bg border border-pump-green px-2 py-1 rounded">
                    <span className="text-xs font-mono text-pump-green font-bold">
                        {bondingProgress}%
                    </span>
                </div>
            </div>

            {/* Token Info */}
            <div className="mb-3">
                <h3 className="text-xl font-bold mb-1 truncate group-hover:text-pump-green transition-colors">
                    {name}
                </h3>
                <div className="flex items-center justify-between">
                    <span className="font-mono text-text-secondary text-sm">${symbol}</span>
                    {agentName && (
                        <span className="text-xs font-mono text-text-muted">by {agentName}</span>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="space-y-2">
                {/* Market Cap */}
                <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">Market Cap</span>
                    <span className="font-mono font-bold text-pump-green">
                        ${formatNumber(marketCap)}
                    </span>
                </div>

                {/* Price Change */}
                {priceChange24h !== 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-text-secondary">24h Change</span>
                        <div className={`flex items-center gap-1 font-mono text-sm font-bold ${isPositive ? 'text-pump-green' : 'text-red-500'
                            }`}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {isPositive ? '+' : ''}{priceChange24h.toFixed(2)}%
                        </div>
                    </div>
                )}

                {/* Bonding Progress Bar */}
                <div>
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-text-secondary">Bonding Curve</span>
                        <span className="text-xs font-mono text-pump-green">{bondingProgress}%</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${bondingProgress}%` }}
                        />
                    </div>
                    {bondingProgress >= 100 && (
                        <div className="mt-1">
                            <span className="text-xs font-mono text-pump-gold">
                                🎉 Graduated to Raydium
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Hover Glow Effect */}
            <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-t from-neon-green/5 to-transparent" />
            </div>
        </motion.div>
    )
}

function formatNumber(num) {
    if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M'
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K'
    return num.toFixed(0)
}
