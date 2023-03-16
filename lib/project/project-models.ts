import { JsonSchemaType, ModelOptions } from 'aws-cdk-lib/aws-apigateway';

/**
 * This file contains the project models, which document the API requests
 * related to the project resource (table in DB).
 */

// Define the request format for creating a new project
export const CreateProjectModel: ModelOptions = {
  modelName: 'CreateProject',
  contentType: 'application/json',
  schema: {
    title: 'createProject',
    type: JsonSchemaType.OBJECT,
    properties: {
      name: {
        type: JsonSchemaType.STRING,
      },
      description: {
        type: JsonSchemaType.STRING,
      },
    },
    required: ['name', 'description'],
  },
};

export default { CreateProjectModel };
