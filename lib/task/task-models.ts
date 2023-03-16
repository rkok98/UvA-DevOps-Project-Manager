import { JsonSchemaType, ModelOptions } from 'aws-cdk-lib/aws-apigateway';

/**
 * This file contains the project models, which document the API requests
 * related to the project resource (table in DB).
 */

// Define the request format for creating a new project
export const CreateTaskModel: ModelOptions = {
  modelName: 'CreateTask',
  contentType: 'application/json',
  schema: {
    title: 'createTask',
    type: JsonSchemaType.OBJECT,
    properties: {
      projectId: {
        type: JsonSchemaType.STRING,
      },
      title: {
        type: JsonSchemaType.STRING,
      },
      description: {
        type: JsonSchemaType.STRING,
      },
      dateTime: {
        type: JsonSchemaType.STRING,
      },
      createdBy: {
        type: JsonSchemaType.STRING,
      },
    },
    required: ['title', 'description'],
  },
};

export const UpdateTaskModel: ModelOptions = {
  modelName: 'UpdateTask',
  contentType: 'application/json',
  schema: {
    title: 'updateTask',
    type: JsonSchemaType.OBJECT,
    properties: {
      projectId: {
        type: JsonSchemaType.STRING,
      },
      title: {
        type: JsonSchemaType.STRING,
      },
      description: {
        type: JsonSchemaType.STRING,
      },
      dateTime: {
        type: JsonSchemaType.STRING,
      },
      createdBy: {
        type: JsonSchemaType.STRING,
      },
    },
  },
};

export default { CreateTaskModel };
