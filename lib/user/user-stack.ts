import { Construct } from 'constructs';
import {
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';
import { getEnv } from '../../bin/util/get-env';
import { CognitoUserPoolsAuthorizer } from 'aws-cdk-lib/aws-apigateway';

export class UserStack extends Construct {
  public userPool: UserPool;
  public userPoolClient: UserPoolClient;

  public authorizer: CognitoUserPoolsAuthorizer;

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = this.createUserPool();
    this.userPoolClient = this.createUserPoolClient(this.userPool);
    this.authorizer = this.createAuthorizer([this.userPool]);
  }

  public createUserPool(): UserPool {
    const userPool = new UserPool(this, getEnv(this, 'project-user-pool'), {
      userPoolName: 'project-user-pool',
      selfSignUpEnabled: true,
      signInAliases: {
        email: true,
      },
      standardAttributes: {
        givenName: {
          required: true,
          mutable: false,
        },
        familyName: {
          required: true,
          mutable: false,
        },
      },
      removalPolicy: RemovalPolicy.DESTROY,
      deletionProtection: false,
      autoVerify: {
        email: true,
      },
      userVerification: {
        emailSubject: 'Verify your email for our Project Management App!',
        emailBody:
          'Thanks for signing up to our app! Your verification code is {####}',
        emailStyle: VerificationEmailStyle.CODE,
      },
    });

    userPool.addDomain('hosted-ui', {
      cognitoDomain: {
        domainPrefix: `${getEnv(this, 'project-manager-app')}`,
      },
    });

    return userPool;
  }

  public createUserPoolClient(userPool: UserPool): UserPoolClient {
    return new UserPoolClient(this, getEnv(this, 'user-pool-client'), {
      userPool: userPool,
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
        },
        scopes: [OAuthScope.EMAIL, OAuthScope.OPENID, OAuthScope.PROFILE],
      },
    });
  }

  private createAuthorizer(userPools: UserPool[]): CognitoUserPoolsAuthorizer {
    return new CognitoUserPoolsAuthorizer(
      this,
      `${getEnv(this, 'authorizer')}`,
      {
        cognitoUserPools: userPools,
      }
    );
  }
}
