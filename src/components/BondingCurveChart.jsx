import { useEffect, useRef } from 'react'

export default function BondingCurveChart({ progress }) {
    const canvasRef = useRef(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext('2d')
        const width = canvas.width
        const height = canvas.height

        // Clear canvas
        ctx.clearRect(0, 0, width, height)

        // Draw grid
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'
        ctx.lineWidth = 1
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i
            const y = (height / 10) * i

            ctx.beginPath()
            ctx.moveTo(x, 0)
            ctx.lineTo(x, height)
            ctx.stroke()

            ctx.beginPath()
            ctx.moveTo(0, y)
            ctx.lineTo(width, y)
            ctx.stroke()
        }

        // Draw bonding curve (exponential-like curve)
        ctx.strokeStyle = '#0d9488'
        ctx.lineWidth = 3
        ctx.beginPath()

        const points = 100
        for (let i = 0; i <= points; i++) {
            const x = (width / points) * i
            const t = i / points
            // Bonding curve formula: price increases exponentially with supply
            const y = height - (height * Math.pow(t, 1.5))

            if (i === 0) {
                ctx.moveTo(x, y)
            } else {
                ctx.lineTo(x, y)
            }
        }
        ctx.stroke()

        // Draw current progress point
        const currentX = (width * progress) / 100
        const currentT = progress / 100
        const currentY = height - (height * Math.pow(currentT, 1.5))

        // Glow effect
        ctx.shadowBlur = 20
        ctx.shadowColor = '#0d9488'

        // Draw point
        ctx.fillStyle = '#0d9488'
        ctx.beginPath()
        ctx.arc(currentX, currentY, 6, 0, Math.PI * 2)
        ctx.fill()

        // Reset shadow
        ctx.shadowBlur = 0

        // Draw vertical line to show current position
        ctx.strokeStyle = 'rgba(13, 148, 136, 0.4)'
        ctx.lineWidth = 2
        ctx.setLineDash([5, 5])
        ctx.beginPath()
        ctx.moveTo(currentX, 0)
        ctx.lineTo(currentX, height)
        ctx.stroke()
        ctx.setLineDash([])

        // Draw graduation line at 100%
        if (progress < 100) {
            ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)'
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.beginPath()
            ctx.moveTo(width, 0)
            ctx.lineTo(width, height)
            ctx.stroke()
            ctx.setLineDash([])

            // Add "Graduation" label
            ctx.fillStyle = '#fbbf24'
            ctx.font = '12px "JetBrains Mono", monospace'
            ctx.textAlign = 'right'
            ctx.fillText('Graduation →', width - 5, 20)
        }

        // Add labels
        ctx.fillStyle = '#a1a1aa'
        ctx.font = '10px "JetBrains Mono", monospace'
        ctx.textAlign = 'left'
        ctx.fillText('Price', 5, 15)
        ctx.textAlign = 'right'
        ctx.fillText('Supply →', width - 5, height - 5)

    }, [progress])

    return (
        <div className="relative">
            <canvas
                ref={canvasRef}
                width={600}
                height={300}
                className="w-full h-auto glass-card p-4"
            />
            <div className="mt-3 flex justify-between items-center font-mono text-sm">
                <span className="text-text-secondary">
                    Progress: <span className="text-pump-green font-bold">{progress}%</span>
                </span>
                <span className="text-text-secondary">
                    {progress >= 100 ? (
                        <span className="text-pump-gold font-bold">✅ Graduated</span>
                    ) : (
                        <span>{(100 - progress).toFixed(1)}% to graduation</span>
                    )}
                </span>
            </div>
        </div>
    )
}
