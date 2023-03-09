import { JsonSchemaType, ModelOptions } from 'aws-cdk-lib/aws-apigateway';

export const CreateProjectModel: ModelOptions = {
  modelName: 'CreateProject',
  contentType: 'application/json',
  schema: {
    title: 'createProject',
    type: JsonSchemaType.OBJECT,
    properties: {
      id: {
        type: JsonSchemaType.STRING,
      },
      name: {
        type: JsonSchemaType.STRING,
      },
      description: {
        type: JsonSchemaType.STRING,
      },
    },
    required: ['projectId', 'name', 'description'],
  },
};

export default { CreateProjectModel };
