import {Ratelimit} from '@upstash/ratelimit'
import {Redis} from '@upstash/redis'
import dotenv from 'dotenv'

// I want to implement a simple rate limiter.

dotenv.config({quiet:true})

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(15, '1 m'), // 15 requests per minute - more reasonable
})

export default ratelimit