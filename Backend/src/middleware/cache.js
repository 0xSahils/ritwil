import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration = 300) => (req, res, next) => {
  if (req.method !== "GET") {
    return next();
  }

  const key = `__express__${req.originalUrl || req.url}`;
  const cachedResponse = cache.get(key);

  if (cachedResponse) {
    return res.json(cachedResponse);
  }

  const originalJson = res.json;
  res.json = (body) => {
    res.originalJson = res.json;
    originalJson.call(res, body);
    cache.set(key, body, duration);
  };
  next();
};

export const clearCacheMiddleware = (req, res, next) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        cache.flushAll();
    }
    next();
};
