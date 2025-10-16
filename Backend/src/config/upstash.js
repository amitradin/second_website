import {Ratelimit} from '@upstash/ratelimit'
import {Redis} from '@upstash/redis'
import dotenv from 'dotenv'

// I want to implement a simple rate limiter.

dotenv.config()

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(20, '20 s'), // 20 requests every 20 seconds
})

export default ratelimit