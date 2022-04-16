import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyHttpErrorHandler from '@middy/http-error-handler';
import { APIGatewayProxyEventHandler } from 'src/common/handler-types';
import {
    LoginNewUserInput,
    loginNewUserInputSchema,
} from 'src/models/login-new-user';
import { StatusCodes } from 'http-status-codes';
import { cognitoLoginNewUser, CognitoStatus } from 'src/common/cognito';
import httpResponseSerializer from '@middy/http-response-serializer';

const handler: APIGatewayProxyEventHandler<
    { message?: string },
    LoginNewUserInput
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
            body: { message: result.message },
        };
    } else if (result.status === CognitoStatus.UnknownError) {
        return {
            statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
            body: { message: result.message },
        };
    } else {
        return {
            statusCode: StatusCodes.UNAUTHORIZED,
            body: { message: result.message },
        };
    }
};

export const main = middy(handler)
    .use(middyJsonBodyParser())
    .use(
        httpResponseSerializer({
            serializers: [
                {
                    regex: /^application\/json$/,
                    serializer: ({ body }) => JSON.stringify(body),
                },
            ],
            default: 'application/json',
        }),
    )
    .use(middyHttpErrorHandler());
