import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyHttpErrorHandler from '@middy/http-error-handler';
import { APIGatewayProxyEventWithBodyHandler } from 'src/common/handler-types';
import {
    AuthenticationDetails,
    CognitoUser,
    CognitoUserPool,
    IAuthenticationDetailsData,
    ICognitoUserData,
    ICognitoUserPoolData,
} from 'amazon-cognito-identity-js';
import { StatusCodes } from 'http-status-codes';
import { LoginInput, loginInputSchema, LoginOutput } from 'src/models/login';
import { POOL_DATA } from 'src/models/pool-data';

const handler: APIGatewayProxyEventWithBodyHandler<
    LoginInput,
    LoginOutput
> = async (event) => {
    loginInputSchema.parse(event.body);

    const { userName, password } = event.body;

    const authenticationData: IAuthenticationDetailsData = {
        Username: userName,
        Password: password,
    };
    const authenticationDetails = new AuthenticationDetails(authenticationData);

    const poolData: ICognitoUserPoolData = {
        UserPoolId: POOL_DATA.userPoolId,
        ClientId: POOL_DATA.clientId,
    };
    const userPool = new CognitoUserPool(poolData);

    const userData: ICognitoUserData = {
        Username: userName,
        Pool: userPool,
    };
    const cognitoUser = new CognitoUser(userData);

    let loginOutput: LoginOutput = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Unknown Error',
    };

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            loginOutput = {
                statusCode: StatusCodes.OK,
                token: result.getAccessToken().getJwtToken(),
            };
        },

        onFailure: function (_error) {
            loginOutput = {
                statusCode: StatusCodes.UNAUTHORIZED,
                message: 'Authentication Failed',
            };
        },

        newPasswordRequired: function (_userAttributes, _requiredAttributes) {
            loginOutput = {
                statusCode: StatusCodes.UNAUTHORIZED,
                message: 'New Password Required - Use loginNewUser',
            };
        },
    });

    return loginOutput;
};

export const main = middy(handler)
    .use(middyJsonBodyParser())
    .use(middyHttpErrorHandler());
