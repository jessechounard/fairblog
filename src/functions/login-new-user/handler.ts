import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyHttpErrorHandler from '@middy/http-error-handler';
import {
    APIGatewayProxyEventResponse,
    APIGatewayProxyEventWithBodyHandler,
} from 'src/common/handler-types';
import {
    LoginNewUserInput,
    loginNewUserInputSchema,
} from 'src/models/login-new-user';
import { StatusCodes } from 'http-status-codes';
import { cognitoLoginNewUser, CognitoStatus } from 'src/common/cognito';

const handler: APIGatewayProxyEventWithBodyHandler<
    LoginNewUserInput,
    APIGatewayProxyEventResponse
> = async (event) => {
    loginNewUserInputSchema.parse(event.body);

    const { username, temporaryPassword, newPassword } = event.body;

    const result = await cognitoLoginNewUser(
        username,
        temporaryPassword,
        newPassword,
    );

    if (result.status === CognitoStatus.Success) {
        return {
            statusCode: StatusCodes.OK,
            body: result.message,
        };
    } else if (result.status === CognitoStatus.UnknownError) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            body: result.message,
        };
    } else {
        return {
            statusCode: StatusCodes.UNAUTHORIZED,
            body: result.message,
        };
    }
};

export const main = middy(handler)
    .use(middyJsonBodyParser())
    .use(middyHttpErrorHandler());
