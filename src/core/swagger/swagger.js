import swaggerJsdoc from 'swagger-jsdoc';

const swaggerSpec = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'StudyPro API Documentation',
      version: '0.0.1',
      description: 'API documentation for the StudyPro application',
    },
    servers: [
      {
        url: 'http://localhost:8080/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
        },
      },
    },
  },
  apis: ['src/features/**/routes/*.js', 'src/core/swagger/**/*.yaml'],
});

export default swaggerSpec;
