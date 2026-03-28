import { createReadStream, createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { Transform } from 'stream';
import crypto from 'crypto';

/**
 * Performance optimization utilities for file uploads
 */

/**
 * Memory-efficient file processor using streams
 */
export class StreamProcessor {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize || 64 * 1024; // 64KB chunks
    this.maxMemoryUsage = options.maxMemoryUsage || 100 * 1024 * 1024; // 100MB
    this.concurrencyLimit = options.concurrencyLimit || 3;
  }

  /**
   * Process file in chunks to reduce memory usage
   * @param {Buffer} fileBuffer - File buffer
   * @param {Function} processor - Chunk processing function
   * @returns {Promise<Buffer>} - Processed buffer
   */
  async processInChunks(fileBuffer, processor) {
    const chunks = [];
    let offset = 0;

    while (offset < fileBuffer.length) {
      const chunk = fileBuffer.subarray(offset, offset + this.chunkSize);
      const processedChunk = await processor(chunk, offset, fileBuffer.length);
      chunks.push(processedChunk);
      offset += this.chunkSize;

      // Force garbage collection if memory usage is high
      if (process.memoryUsage().heapUsed > this.maxMemoryUsage) {
        if (global.gc) {
          global.gc();
        }
      }
    }

    return Buffer.concat(chunks);
  }

  /**
   * Create a transform stream for processing
   * @param {Function} transformFunction - Transform function
   * @returns {Transform} - Transform stream
   */
  createTransformStream(transformFunction) {
    return new Transform({
      transform(chunk, encoding, callback) {
        try {
          const result = transformFunction(chunk);
          callback(null, result);
        } catch (error) {
          callback(error);
        }
      }
    });
  }

  /**
   * Process multiple files concurrently with memory management
   * @param {Array} files - Array of file buffers
   * @param {Function} processor - Processing function
   * @returns {Promise<Array>} - Processed files
   */
  async processConcurrently(files, processor) {
    const results = [];
    const semaphore = new Semaphore(this.concurrencyLimit);

    const processFile = async (file, index) => {
      await semaphore.acquire();
      try {
        const result = await processor(file, index);
        results[index] = result;
      } finally {
        semaphore.release();
      }
    };

    await Promise.all(files.map((file, index) => processFile(file, index)));
    return results;
  }
}

/**
 * Simple semaphore implementation for concurrency control
 */
class Semaphore {
  constructor(maxConcurrency) {
    this.maxConcurrency = maxConcurrency;
    this.currentConcurrency = 0;
    this.queue = [];
  }

  async acquire() {
    return new Promise((resolve) => {
      if (this.currentConcurrency < this.maxConcurrency) {
        this.currentConcurrency++;
        resolve();
      } else {
        this.queue.push(resolve);
      }
    });
  }

  release() {
    this.currentConcurrency--;
    if (this.queue.length > 0) {
      const next = this.queue.shift();
      this.currentConcurrency++;
      next();
    }
  }
}

/**
 * Memory usage monitor
 */
export class MemoryMonitor {
  constructor() {
    this.thresholds = {
      warning: 80 * 1024 * 1024, // 80MB
      critical: 90 * 1024 * 1024, // 90MB
      emergency: 95 * 1024 * 1024  // 95MB
    };
    this.monitoring = false;
  }

  /**
   * Start monitoring memory usage
   * @param {Function} onThreshold - Callback when threshold is reached
   */
  startMonitoring(onThreshold) {
    if (this.monitoring) return;

    this.monitoring = true;
    const checkMemory = () => {
      if (!this.monitoring) return;

      const usage = process.memoryUsage();
      const heapUsed = usage.heapUsed;

      if (heapUsed > this.thresholds.emergency) {
        onThreshold('emergency', usage);
      } else if (heapUsed > this.thresholds.critical) {
        onThreshold('critical', usage);
      } else if (heapUsed > this.thresholds.warning) {
        onThreshold('warning', usage);
      }

      setTimeout(checkMemory, 1000); // Check every second
    };

    checkMemory();
  }

  /**
   * Stop monitoring
   */
  stopMonitoring() {
    this.monitoring = false;
  }

  /**
   * Get current memory usage
   * @returns {Object} - Memory usage stats
   */
  getCurrentUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      percentageUsed: (usage.heapUsed / usage.heapTotal) * 100
    };
  }
}

/**
 * Cache manager for upload optimization
 */
export class UploadCache {
  constructor() {
    this.cache = new Map();
    this.maxSize = 1000;
    this.ttl = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Set cache item
   * @param {string} key - Cache key
   * @param {any} value - Cache value
   */
  set(key, value) {
    // Remove oldest item if cache is full
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      timestamp: Date.now()
    });
  }

  /**
   * Get cache item
   * @param {string} key - Cache key
   * @returns {any} - Cached value or null
   */
  get(key) {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item is expired
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete cache item
   * @param {string} key - Cache key
   */
  delete(key) {
    this.cache.delete(key);
  }

  /**
   * Clear expired items
   */
  clearExpired() {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   * @returns {Object} - Cache stats
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: this.hits / (this.hits + this.misses) || 0
    };
  }
}

/**
 * File deduplication utility
 */
export class FileDeduplicator {
  constructor() {
    this.hashCache = new UploadCache();
  }

  /**
   * Generate file hash
   * @param {Buffer} buffer - File buffer
   * @returns {string} - File hash
   */
  async generateHash(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Check if file is duplicate
   * @param {Buffer} buffer - File buffer
   * @returns {Object} - Deduplication result
   */
  async checkDuplicate(buffer) {
    const hash = await this.generateHash(buffer);
    const cached = this.hashCache.get(hash);

    if (cached) {
      return {
        isDuplicate: true,
        hash,
        existingUrl: cached.url,
        existingFileId: cached.fileId
      };
    }

    return {
      isDuplicate: false,
      hash
    };
  }

  /**
   * Cache file upload result
   * @param {string} hash - File hash
   * @param {Object} uploadResult - Upload result
   */
  cacheUpload(hash, uploadResult) {
    this.hashCache.set(hash, {
      url: uploadResult.url,
      fileId: uploadResult.fileId,
      timestamp: Date.now()
    });
  }
}

/**
 * Upload queue for managing concurrent uploads
 */
export class UploadQueue {
  constructor(options = {}) {
    this.maxConcurrency = options.maxConcurrency || 5;
    this.maxQueueSize = options.maxQueueSize || 100;
    this.queue = [];
    this.processing = new Set();
    this.processed = new Map();
  }

  /**
   * Add upload to queue
   * @param {Object} uploadData - Upload data
   * @returns {Promise} - Upload result
   */
  async add(uploadData) {
    if (this.queue.length >= this.maxQueueSize) {
      throw new Error('Upload queue is full');
    }

    return new Promise((resolve, reject) => {
      this.queue.push({
        data: uploadData,
        resolve,
        reject,
        timestamp: Date.now()
      });

      this.processQueue();
    });
  }

  /**
   * Process upload queue
   */
  async processQueue() {
    if (this.processing.size >= this.maxConcurrency || this.queue.length === 0) {
      return;
    }

    const item = this.queue.shift();
    const uploadId = this.generateUploadId();

    this.processing.add(uploadId);

    try {
      const result = await this.processUpload(item.data);
      this.processed.set(uploadId, result);
      item.resolve(result);
    } catch (error) {
      item.reject(error);
    } finally {
      this.processing.delete(uploadId);
      this.processQueue(); // Process next item
    }
  }

  /**
   * Process individual upload
   * @param {Object} uploadData - Upload data
   * @returns {Object} - Upload result
   */
  async processUpload(uploadData) {
    // This would integrate with the actual upload service
    // For now, simulate upload processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      url: `https://example.com/uploads/${uploadData.filename}`,
      fileId: this.generateFileId(),
      size: uploadData.buffer.length
    };
  }

  /**
   * Generate unique upload ID
   * @returns {string} - Upload ID
   */
  generateUploadId() {
    return crypto.randomUUID();
  }

  /**
   * Generate unique file ID
   * @returns {string} - File ID
   */
  generateFileId() {
    return crypto.randomUUID();
  }

  /**
   * Get queue statistics
   * @returns {Object} - Queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      processing: this.processing.size,
      processed: this.processed.size,
      maxConcurrency: this.maxConcurrency,
      maxQueueSize: this.maxQueueSize
    };
  }
}

/**
 * Resource usage optimizer
 */
export class ResourceOptimizer {
  constructor() {
    this.memoryMonitor = new MemoryMonitor();
    this.uploadQueue = new UploadQueue();
    this.deduplicator = new FileDeduplicator();
    this.streamProcessor = new StreamProcessor();
  }

  /**
   * Optimize upload process
   * @param {Buffer} buffer - File buffer
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} - Optimized upload result
   */
  async optimizeUpload(buffer, options = {}) {
    // Check for duplicates first
    const duplicateCheck = await this.deduplicator.checkDuplicate(buffer);
    if (duplicateCheck.isDuplicate) {
      return {
        ...duplicateCheck,
        optimized: true,
        optimizationType: 'deduplication'
      };
    }

    // Start memory monitoring
    this.memoryMonitor.startMonitoring((level, usage) => {
      if (level === 'critical') {
        console.warn('Critical memory usage detected:', usage);
        if (global.gc) {
          global.gc();
        }
      }
    });

    try {
      // Process upload through queue
      const uploadData = {
        buffer,
        filename: options.filename,
        hash: duplicateCheck.hash
      };

      const result = await this.uploadQueue.add(uploadData);

      // Cache successful upload
      this.deduplicator.cacheUpload(duplicateCheck.hash, result);

      return {
        ...result,
        optimized: true,
        optimizationType: 'queue-processing'
      };

    } finally {
      this.memoryMonitor.stopMonitoring();
    }
  }

  /**
   * Get optimization statistics
   * @returns {Object} - Optimization stats
   */
  getStats() {
    return {
      memory: this.memoryMonitor.getCurrentUsage(),
      queue: this.uploadQueue.getStats(),
      cache: this.deduplicator.hashCache.getStats()
    };
  }
}

/**
 * Create optimized upload middleware
 */
export const createOptimizedUploadMiddleware = (options = {}) => {
  const optimizer = new ResourceOptimizer();

  return async (req, res, next) => {
    try {
      if (!req.file && !req.files) {
        return next();
      }

      const files = req.files || [req.file];
      const optimizedResults = [];

      for (const file of files) {
        const result = await optimizer.optimizeUpload(file.buffer, {
          filename: file.originalname
        });
        optimizedResults.push(result);
      }

      req.optimizedFiles = optimizedResults;
      req.optimizationStats = optimizer.getStats();

      next();

    } catch (error) {
      console.error('Upload optimization failed:', error);
      res.status(500).json({
        success: false,
        message: 'Upload optimization failed',
        error: error.message
      });
    }
  };
};
