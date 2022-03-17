import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyHttpErrorHandler from '@middy/http-error-handler';
import {
    APIGatewayProxyEventResponse,
    APIGatewayProxyEventWithBodyHandler,
} from 'src/common/handler-types';
import { LoginInput, loginInputSchema } from 'src/models/login';
import { cognitoLoginUser, CognitoStatus } from 'src/common/cognito';
import { StatusCodes } from 'http-status-codes';

const handler: APIGatewayProxyEventWithBodyHandler<
    LoginInput,
    APIGatewayProxyEventResponse
> = async (event) => {
    loginInputSchema.parse(event.body);

    const { username, password } = event.body;
    const result = await cognitoLoginUser(username, password);

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
