const createRateLimiter = ({ windowMs = 15 * 60 * 1000, max = 100 } = {}) => {
  const hits = new Map();

  // Periodically clean up expired entries every 5 minutes
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hits) {
      if (now > record.resetAt) {
        hits.delete(ip);
      }
    }
  }, 5 * 60 * 1000);

  // Allow cleanup interval to not keep the process alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown';
    const record = hits.get(ip);

    if (!record || now > record.resetAt) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (record.count >= max) {
      const retryAfter = Math.ceil((record.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      return res.status(429).json({ error: 'Too many requests. Please try again later.' });
    }

    record.count += 1;
    hits.set(ip, record);
    return next();
  };
};

export { createRateLimiter };
