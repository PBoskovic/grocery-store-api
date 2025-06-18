import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Grocery Store API',
            version: '1.0.0',
            description: 'API docs for the Grocery Store backend',
        },
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts', 'src/docs/swaggerComponents.ts'], // adjust path to where your routes are
};

const swaggerSpec = swaggerJSDoc(options);

export { swaggerUi, swaggerSpec };
