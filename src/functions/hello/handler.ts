import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyHttpErrorHandler from '@middy/http-error-handler';
import { APIGatewayProxyEventWithBodyHandler } from 'src/common/handler-types';
import { HelloInput, helloInputSchema, HelloOutput } from 'src/models/hello';

const handler: APIGatewayProxyEventWithBodyHandler<
    HelloInput,
    HelloOutput
> = async (event) => {
    helloInputSchema.parse(event.body);

    return {
        message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
    };
};

export const main = middy(handler)
    .use(middyJsonBodyParser())
    .use(middyHttpErrorHandler());
