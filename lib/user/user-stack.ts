import { Construct } from 'constructs';
import {
  OAuthScope,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
  VerificationEmailStyle,
} from 'aws-cdk-lib/aws-cognito';
import { RemovalPolicy } from 'aws-cdk-lib';

export class UserStack extends Construct {
  public userPool: UserPool;
  public userPoolClient: UserPoolClient;

  public constructor(scope: Construct, id: string) {
    super(scope, id);

    this.userPool = this.createUserPool();
    this.userPoolClient = this.createUserPoolClient(this.userPool);
  }

  public createUserPool(): UserPool {
    const userPool = new UserPool(this, 'project-user-pool', {
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
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: false,
        requireSymbols: false,
        requireUppercase: true,
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
        domainPrefix: 'project-management-app',
      },
    });

    return userPool;
  }

  public createUserPoolClient(userPool: UserPool): UserPoolClient {
    return new UserPoolClient(this, 'project-user-pool-client', {
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
}
