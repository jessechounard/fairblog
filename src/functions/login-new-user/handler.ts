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
import {
    LoginNewUserInput,
    loginNewUserInputSchema,
    LoginNewUserOutput,
} from 'src/models/login-new-user';
import { StatusCodes } from 'http-status-codes';
import { POOL_DATA } from 'src/models/pool-data';

const handler: APIGatewayProxyEventWithBodyHandler<
    LoginNewUserInput,
    LoginNewUserOutput
> = async (event) => {
    loginNewUserInputSchema.parse(event.body);

    const { userName, temporaryPassword, newPassword } = event.body;

    const authenticationData: IAuthenticationDetailsData = {
        Username: userName,
        Password: temporaryPassword,
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

    let loginNewUserOutput: LoginNewUserOutput = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Unknown Error - Default',
    };

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (_result) {
            loginNewUserOutput = {
                statusCode: StatusCodes.BAD_REQUEST,
                message: 'User does not have a temporary password',
            };
        },

        onFailure: function (_error) {
            loginNewUserOutput = {
                statusCode: StatusCodes.UNAUTHORIZED,
                message: 'Authentication Failed',
            };
        },

        newPasswordRequired: function (_userAttributes, requiredAttributes) {
            console.log('change');

            cognitoUser.completeNewPasswordChallenge(
                newPassword,
                requiredAttributes,
                {
                    onSuccess: function (result) {
                        console.log('success');

                        loginNewUserOutput = {
                            statusCode: StatusCodes.OK,
                            token: result.getAccessToken().getJwtToken(),
                        };
                    },

                    onFailure: function (_error) {
                        console.log(JSON.stringify(_error, undefined, 2));

                        loginNewUserOutput = {
                            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                            message: 'Unknown Error',
                        };
                    },
                },
            );
        },
    });

    return loginNewUserOutput;
};

export const main = middy(handler)
    .use(middyJsonBodyParser())
    .use(middyHttpErrorHandler());
