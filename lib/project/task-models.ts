import { JsonSchemaType, ModelOptions } from 'aws-cdk-lib/aws-apigateway';

export const CreateTaskModel: ModelOptions = {
  modelName: 'CreateTask',
  contentType: 'application/json',
  schema: {
    title: 'createTask',
    type: JsonSchemaType.OBJECT,
    properties: {
      id: {
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
    required: ['id', 'title', 'description'],
  },
};

export const GetTaskModel: ModelOptions = {
  modelName: 'GetTask',
  contentType: 'application/json',
  schema: {
    title: 'getTask',
    type: JsonSchemaType.OBJECT,
    properties: {
      id: {
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

export default { CreateTaskModel, GetTaskModel };
