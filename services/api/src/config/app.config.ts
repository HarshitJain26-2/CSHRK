export const appConfig = () => ({
  port: parseInt(process.env.PORT || process.env.API_PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:19006,http://localhost:8081').split(','),
  jwt: {
    secret: process.env.JWT_SECRET || 'cshrk_dev_jwt_super_secret_key_change_in_production_32char',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'cshrk_dev_refresh_super_secret_key_change_in_production',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },
});
