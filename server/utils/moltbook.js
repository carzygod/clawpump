import axios from 'axios'

/**
 * Fetch a Moltbook post by ID
 */
export async function fetchMoltbookPost(postId, apiKey) {
    try {
        // Mock implementation for development
        // In production, replace with actual Moltbook API call
        console.log(`Fetching Moltbook post ${postId}`)

        // Example: const response = await axios.get(`https://api.moltbook.com/posts/${postId}`, {
        //   headers: { 'Authorization': `Bearer ${apiKey}` }
        // })
        // return response.data

        return {
            id: postId,
            content: `!pumpbot\n\`\`\`json\n{\n  "name": "Test Token",\n  "symbol": "TEST",\n  "wallet": "0x123",\n  "description": "A test token",\n  "image": "https://example.com/image.jpg"\n}\n\`\`\``,
            author: {
                name: 'TestAgent'
            }
        }
    } catch (error) {
        console.error('Error fetching Moltbook post:', error)
        return null
    }
}

/**
 * Extract token data from Moltbook post content
 */
export function extractTokenData(content) {
    try {
        // Check for !pumpbot tag
        if (!content.includes('!pumpbot')) {
            return null
        }

        // Extract JSON from code block
        const codeBlockRegex = /```json\s*\n([\s\S]*?)\n```/
        const match = content.match(codeBlockRegex)

        if (!match || !match[1]) {
            return null
        }

        const jsonData = JSON.parse(match[1])
        return jsonData
    } catch (error) {
        console.error('Error extracting token data:', error)
        return null
    }
}

/**
 * Validate token data
 */
export function validateTokenData(data) {
    const errors = []
    const required = ['name', 'symbol', 'wallet', 'description', 'image']

    // Check required fields
    for (const field of required) {
        if (!data[field]) {
            errors.push(`Missing required field: ${field}`)
        }
    }

    // Validate field lengths
    if (data.name && data.name.length > 50) {
        errors.push('Token name must be 50 characters or less')
    }

    if (data.symbol && data.symbol.length > 10) {
        errors.push('Token symbol must be 10 characters or less')
    }

    if (data.symbol && data.symbol !== data.symbol.toUpperCase()) {
        errors.push('Token symbol must be uppercase')
    }

    if (data.description && data.description.length > 500) {
        errors.push('Description must be 500 characters or less')
    }

    // Validate wallet address (basic check)
    if (data.wallet && !isValidSolanaAddress(data.wallet)) {
        errors.push('Invalid Solana wallet address')
    }

    // Validate image URL
    if (data.image && !isValidImageUrl(data.image)) {
        errors.push('Invalid image URL - must be a direct link to image file')
    }

    return {
        valid: errors.length === 0,
        errors
    }
}

/**
 * Basic Solana address validation
 */
function isValidSolanaAddress(address) {
    // Solana addresses are base58 encoded, 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}

/**
 * Validate image URL
 */
function isValidImageUrl(url) {
    try {
        const parsed = new URL(url)

        // Check for direct image file extensions
        const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg']
        const hasExtension = imageExtensions.some(ext => parsed.pathname.toLowerCase().endsWith(ext))

        // Check for known image hosting services
        const imageHosts = ['iili.io', 'imgur.com', 'arweave.net']
        const isKnownHost = imageHosts.some(host => parsed.hostname.includes(host))

        // Check for IPFS protocol
        const isIPFS = url.startsWith('ipfs://')

        return hasExtension || isKnownHost || isIPFS
    } catch (error) {
        return false
    }
}
