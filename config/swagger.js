import swaggerJSDoc from 'swagger-jsdoc';

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Market Watcher API Engine Documentation',
            version: '1.0.0',
            description: 'Centralized routing system and self-documenting directory for Market Watcher and adjacent projects'
        },
        servers: [
            { 
                url: 'http://localhost:5000', 
                description: 'Local Development Server' 
            }
        ]
    },
    // Crucial: This tells Swagger to scan all JavaScript files inside your routes folder
    apis: ['./routes/*.js'] 
};

// Generate the complete OpenAPI JSON schema specifications
export const specs = swaggerJSDoc(options);
