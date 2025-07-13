import axios from "axios";

const API = "https://aiarena.superskill.me/api/";
const CACHE_LIMIT = 50;
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

class Api {

  constructor() {
    this.listener = null;
    this.cacheData = new Map();
    this.cacheTtl = new Map();
  }

  listen(listener) {
    this.listener = listener;

    if (this.listener && this.message) this.listener(this.message);
  }

  async get(entity) {
    const cached = getFromCache(this.cacheData, this.cacheTtl, entity);
    if (cached) return cached;

    try {
      this.inform("Loading...");

      const url = entity.startsWith("http") ? entity : API + entity;
      const response = await axios.get(url);

      this.inform();

      if (response.status === 200) {
        addToCache(this.cacheData, this.cacheTtl, entity, response.data);

        return response.data;
      }
    } catch (error) {
      this.inform("No data received from server", error);
      return null;
    }
  }

  async post(entity, body) {
    try {
      const response = await axios.post(API + entity, body);

      if (response.status === 200) {
        if (this.listener) this.listener(null);

        return response.data;
      }
    } catch (error) {
      this.inform("You can't change this data!", error);
    }
  }

  inform(message, error) {
    this.message = message;

    if (this.listener) this.listener(message);
    if (error) console.log(error);
  }

}

function trimCache(cache, ttls) {
  let earliestTtl = Infinity;
  let earliestKey = null;

  for (const key of cache.keys()) {
    const ttl = ttls.get(key);

    if (ttl < earliestTtl) {
      earliestKey = key;
      earliestTtl = ttl;
    }
  }

  if (earliestKey) {
    cache.delete(earliestKey);
    ttls.delete(earliestKey);
  }
}

function getFromCache(cache, ttls, key) {
  const ttl = ttls.get(key);

  if (ttl >= Date.now()) {
    return cache.get(key);
  }
}

function addToCache(cache, ttls, key, value) {
  if (cache.size >= CACHE_LIMIT) trimCache(cache, ttls);

  cache.set(key, value);
  ttls.set(key, Date.now() + CACHE_TTL);
}

const api = new Api();

export default api;
