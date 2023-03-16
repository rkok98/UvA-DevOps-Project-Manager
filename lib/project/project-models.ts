// The project models: Documentation of API requests regarding project in or to the resource (table in DB).

import { JsonSchemaType, ModelOptions } from 'aws-cdk-lib/aws-apigateway';

// Format request for (posting) a new project
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
    required: ['id', 'name', 'description'],
  },
};

export default { CreateProjectModel };
