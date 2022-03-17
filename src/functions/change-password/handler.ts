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
import {
    ChangePasswordInput,
    changePasswordInputSchema,
    ChangePasswordOutput,
} from 'src/models/change-password';
import { POOL_DATA } from 'src/models/pool-data';

const handler: APIGatewayProxyEventWithBodyHandler<
    ChangePasswordInput,
    ChangePasswordOutput
> = async (event) => {
    changePasswordInputSchema.parse(event.body);

    const { userName, oldPassword, newPassword } = event.body;

    const authenticationData: IAuthenticationDetailsData = {
        Username: userName,
        Password: oldPassword,
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

    let changePasswordOutput: ChangePasswordOutput = {
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'Unknown Error - Default',
    };

    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (_result) {
            console.log('1');
            cognitoUser.changePassword(
                oldPassword,
                newPassword,
                (error, _result) => {
                    console.log(JSON.stringify(error, undefined, 2));
                    changePasswordOutput = error
                        ? {
                              statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
                              message: 'Unknown Error',
                          }
                        : {
                              statusCode: StatusCodes.OK,
                              message: 'Password Changed',
                          };
                },
            );
        },

        onFailure: function (_error) {
            console.log('2');
            changePasswordOutput = {
                statusCode: StatusCodes.UNAUTHORIZED,
                message: 'Authentication Failed',
            };
        },

        newPasswordRequired: function (_userAttributes, _requiredAttributes) {
            console.log('3');
            changePasswordOutput = {
                statusCode: StatusCodes.UNAUTHORIZED,
                message: 'New Password Required - Contact Admin',
            };
        },
    });

    return changePasswordOutput;
};

export const main = middy(handler)
    .use(middyJsonBodyParser())
    .use(middyHttpErrorHandler());
