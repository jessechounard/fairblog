import type { AWS } from '@serverless/typescript';

import changePassword from '@functions/change-password';
import login from '@functions/login';
import loginNewUser from '@functions/login-new-user';

const serverlessConfiguration: AWS = {
    service: 'fairblog',
    frameworkVersion: '3',
    plugins: ['serverless-esbuild'],
    provider: {
        name: 'aws',
        region: 'us-east-1', // default: 'us-east-1', override with CLI: sls deploy --region
        stage: 'dev', // default: 'dev', override with CLI: sls deploy --stage
        runtime: 'nodejs14.x',
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
            NODE_OPTIONS: '--enable-source-maps --stack-trace-limit=1000',
        },
    },

    functions: { changePassword, login, loginNewUser },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ['aws-sdk'],
            target: 'node14',
            define: { 'require.resolve': undefined },
            platform: 'node',
            concurrency: 10,
        },
        region: '${opt:region, self:provider.region}',
        stage: '${opt:stage, self:provider.stage}',
    },
    resources: {
        Resources: {
            CognitoUserPool: {
                Type: 'AWS::Cognito::UserPool',
                Properties: {
                    AdminCreateUserConfig: {
                        AllowAdminCreateUserOnly: true,
                        InviteMessageTemplate: {
                            EmailMessage:
                                'Your username is {username} and temporary password is {####}. Please login and change your password, it will expire in 7 days.',
                            EmailSubject: 'New fairblog account created',
                            SMSMessage:
                                'Your username is {username} and temporary password is {####}.',
                        },
                    },
                    UserPoolName:
                        '${self:service}-user-pool-${self:custom.stage}',
                    UsernameAttributes: ['email'],
                    AutoVerifiedAttributes: ['email'],
                    Policies: {
                        PasswordPolicy: {
                            MinimumLength: 8,
                            RequireLowercase: false,
                            RequireNumbers: false,
                            RequireSymbols: false,
                            RequireUppercase: false,
                            TemporaryPasswordValidityDays: 7,
                        },
                    },
                },
            },
            CognitoUserPoolClient: {
                Type: 'AWS::Cognito::UserPoolClient',
                Properties: {
                    ClientName:
                        '${self:service}-user-pool-client-${self:custom.stage}',
                    UserPoolId: {
                        Ref: 'CognitoUserPool',
                    },
                    ExplicitAuthFlows: ['ADMIN_NO_SRP_AUTH'],
                    GenerateSecret: false,
                },
            },
        },
    },
};

module.exports = serverlessConfiguration;
