const redisClient = require("../config/redis");

const CACHE_TTL = 60 * 5;

exports.cacheMiddleware = (keyGenerator) => {
  return async (req, res, next) => {
    try {
      const key = keyGenerator(req);

      const cachedData = await redisClient.get(key);

      if (cachedData) {
        return res.status(200).json(JSON.parse(cachedData));
      }

      const originalJson = res.json.bind(res);

      res.json = async (body) => {
        try {
          await redisClient.setEx(key, CACHE_TTL, JSON.stringify(body));
        } catch (err) {
          console.error("Redis setEx error:", err);
        }
        return originalJson(body);
      };

      next();

    } catch (err) {
      console.error("Cache middleware error:", err);
      next();
    }
  };
};
