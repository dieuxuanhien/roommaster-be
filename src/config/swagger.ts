import swaggerJsdoc from 'swagger-jsdoc';
import config from './env';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Roommaster API Documentation',
    version: '1.0.0',
    description: 'REST API documentation for Roommaster application',
    license: {
      name: 'ISC',
      url: 'https://opensource.org/licenses/ISC'
    },
    contact: {
      name: 'API Support',
      email: 'support@roommaster.com'
    }
  },
  servers: [
    {
      url: `http://localhost:${config.port}/v1`,
      description: 'Development server'
    },
    {
      url: 'https://api.roommaster.com/v1',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token'
      }
    },
    responses: {
      Unauthorized: {
        description: 'Unauthorized - Invalid or missing authentication token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                  example: 401
                },
                message: {
                  type: 'string',
                  example: 'Please authenticate'
                }
              }
            }
          }
        }
      },
      Forbidden: {
        description: 'Forbidden - Insufficient permissions',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                  example: 403
                },
                message: {
                  type: 'string',
                  example: 'Forbidden'
                }
              }
            }
          }
        }
      },
      NotFound: {
        description: 'Not Found',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                  example: 404
                },
                message: {
                  type: 'string',
                  example: 'Not found'
                }
              }
            }
          }
        }
      },
      ValidationError: {
        description: 'Validation Error',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                code: {
                  type: 'number',
                  example: 400
                },
                message: {
                  type: 'string',
                  example: 'Validation error'
                },
                errors: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      field: {
                        type: 'string'
                      },
                      message: {
                        type: 'string'
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  // Path to the API routes
  apis: ['./src/routes/v1/**/*.ts', './src/routes/v1/**/*.js', './build/routes/v1/**/*.js']
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
