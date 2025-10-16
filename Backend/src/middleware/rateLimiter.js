import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // Use IP address as the identifier for rate limiting
    const identifier = req.ip || req.connection.remoteAddress || 'anonymous';
    
    // Log request details for debugging
    console.log(`[Rate Limiter] ${new Date().toISOString()} - ${req.method} ${req.url} from ${identifier}`);
    
    const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
    
    // Add rate limit headers to response
    res.set({
      'X-RateLimit-Limit': limit,
      'X-RateLimit-Remaining': remaining,
      'X-RateLimit-Reset': new Date(reset)
    });
    
    console.log(`[Rate Limiter] IP: ${identifier}, Remaining: ${remaining}/${limit}, Success: ${success}`);
    
    if (!success) {
      console.log(`[Rate Limiter] BLOCKED - Too many requests from ${identifier}`);
      return res
        .status(429)
        .json({ 
          message: "Too many requests, please try again later.",
          retryAfter: Math.round((reset - Date.now()) / 1000)
        });
    }
    
    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    // Allow request to continue if rate limiting fails
    next();
  }
};
export default rateLimiter;