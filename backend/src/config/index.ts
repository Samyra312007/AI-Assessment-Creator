import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_assessment',
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',

  llmProvider: process.env.LLM_PROVIDER || 'nvidia-nim',

  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o',
  },

  nvidiaNim: {
    apiKey: process.env.NVIDIA_NIM_API_KEY || '',
    model: process.env.NVIDIA_NIM_MODEL || 'meta/llama-3.3-70b-instruct',
    baseUrl: process.env.NVIDIA_NIM_BASE_URL || 'https://integrate.api.nvidia.com/v1',
  },

  jwtSecret: process.env.JWT_SECRET || 'vedaai-jwt-secret-dev-only',
};
