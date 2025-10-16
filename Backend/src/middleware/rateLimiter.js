import ratelimit from "../config/upstash.js";

const rateLimiter = async (req, res, next) => {
  try {
    // Use IP address as the identifier for rate limiting
    const identifier = req.ip || req.connection.remoteAddress || 'anonymous';
    const { success } = await ratelimit.limit(identifier);
    if (!success) {
      return res
        .status(429)
        .json({ message: "Too many requests, please try again later." });
    }
    next();
  } catch (error) {
    console.error("Rate limiting error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export default rateLimiter;