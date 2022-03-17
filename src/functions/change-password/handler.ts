import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyHttpErrorHandler from '@middy/http-error-handler';
import {
    APIGatewayProxyEventResponse,
    APIGatewayProxyEventWithBodyHandler,
} from 'src/common/handler-types';
import {
    ChangePasswordInput,
    changePasswordInputSchema,
} from 'src/models/change-password';
import { CognitoStatus, cognitoChangePassword } from 'src/common/cognito';
import { StatusCodes } from 'http-status-codes';

const handler: APIGatewayProxyEventWithBodyHandler<
    ChangePasswordInput,
    APIGatewayProxyEventResponse
> = async (event) => {
    changePasswordInputSchema.parse(event.body);

    const { username, oldPassword, newPassword } = event.body;

    const result = await cognitoChangePassword(
        username,
        oldPassword,
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
