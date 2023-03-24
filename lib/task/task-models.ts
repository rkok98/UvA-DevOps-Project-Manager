import { JsonSchemaType, ModelOptions } from 'aws-cdk-lib/aws-apigateway';

/**
 * This file contains the project models, which document the API requests
 * related to the project resource (table in DB).
 */
export const CreateTaskModel: ModelOptions = {
  modelName: 'CreateTask',
  contentType: 'application/json',
  schema: {
    title: 'createTask',
    type: JsonSchemaType.OBJECT,
    properties: {
      title: {
        type: JsonSchemaType.STRING,
      },
      description: {
        type: JsonSchemaType.STRING,
      },
      state: {
        type: JsonSchemaType.STRING,
      },
    },
    required: ['title', 'description', 'state'],
  },
};

export const UpdateTaskModel: ModelOptions = {
  modelName: 'UpdateTask',
  contentType: 'application/json',
  schema: {
    title: 'updateTask',
    type: JsonSchemaType.OBJECT,
    properties: {
      title: {
        type: JsonSchemaType.STRING,
      },
      description: {
        type: JsonSchemaType.STRING,
      },
      state: {
        type: JsonSchemaType.STRING,
      },
    },
  },
};

export default { CreateTaskModel, UpdateTaskModel };
