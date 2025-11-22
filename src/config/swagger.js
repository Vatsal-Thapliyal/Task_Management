const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Psiborg API",
    version: "1.0.0",
    description: "API documentation for Psiborg task management system",
  },
  servers: [
    { url: process.env.NODEJS_BACKEND_URL || "http://localhost:8080" }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          username: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["user","manager","admin"] }
        }
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
          error: { type: "string" }
        }
      }
    },
    responses: {
      UnauthorizedError: {
        description: "Unauthorized - JWT missing or invalid",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Unauthorized", error: "Invalid or missing token" }
          }
        }
      },
      ForbiddenError: {
        description: "Forbidden - insufficient permissions",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Access denied", error: "You do not have permission to perform this action" }
          }
        }
      },
      ServerError: {
        description: "Internal server error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
            example: { message: "Internal Server Error", error: "Something went wrong" }
          }
        }
      }
    }
  }
};

const options = {
  swaggerDefinition,
  apis: [path.join(__dirname, "../routes/*.js")],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: `
        .swagger-ui .topbar { display: none }
        .swagger-ui .models { display: none }
        .swagger-ui section.models { display: none }
      `,
      customSiteTitle: "Psiborg API Documentation",
      swaggerOptions: {
        persistAuthorization: true,
        defaultModelsExpandDepth: -1,
        docExpansion: "list",
      },
    })
  );

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("API Documentation available at /api-docs");
  console.log("OpenAPI spec available at /api-docs.json");
};

module.exports = setupSwagger;
