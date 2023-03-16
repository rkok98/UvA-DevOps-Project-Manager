import { APIGatewayProxyHandler } from 'aws-lambda';
import { Logger } from '@aws-lambda-powertools/logger';
import { Project } from '../models/project';
import { ProjectRepository } from '../services/project-repository';
import { HttpResponse } from '../../util/http-response';
import { DynamodbProjectRepository } from '../services/dynamodb-project-repository';

const logger = new Logger({ serviceName: 'updateProject' });

export const handler: APIGatewayProxyHandler = async (event) => {
    logger.addPersistentLogAttributes({ body: event.body });

    const region = process.env.AWS_REGION;
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    if (!region) {
        logger.error('AWS_REGION was not specified in the environment variables');
        return HttpResponse.internalServerError(
            'AWS_REGION was not specified in the environment variables'
        );
    }

    if (!tableName) {
        logger.error(
            'DYNAMODB_TABLE_NAME was not specified in the environment variables'
        );
        return HttpResponse.internalServerError(
            'DYNAMODB_TABLE_NAME was not specified in the environment variables'
        );
    }

    if (!event.body) {
        logger.error('Request body cannot be empty');
        return HttpResponse.badRequest('Request body cannot be empty');
    }

    const projectId = event.pathParameters?.project_id;
    if (!projectId) {
        logger.error('Project id cannot be empty');
        return HttpResponse.badRequest('Project id cannot be empty');
    }

    const project = JSON.parse(event.body) as Project;
    project.id = projectId;

    const projectRepository: ProjectRepository = new DynamodbProjectRepository(
        region,
        tableName
    );

    return projectRepository
        .updateProject(project)
        .then(() => HttpResponse.updated())
        .catch((error: Error) => {
            logger.error(error.message);
            return HttpResponse.internalServerError(error.message);
        });
};
