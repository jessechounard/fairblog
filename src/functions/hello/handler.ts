import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import middyValidator from '@middy/validator';
import middyHttpErrorHandler from '@middy/http-error-handler';
import { FromSchema } from 'json-schema-to-ts';
import { APIGatewayProxyEventWithBodyHandler } from 'src/types/handler';

const helloSchema = {
    type: 'object',
    properties: {
        name: { type: 'string' },
    },
    required: ['name'],
} as const;

export type HelloData = FromSchema<typeof helloSchema>;

const hello: APIGatewayProxyEventWithBodyHandler<
    HelloData,
    Record<string, unknown>
> = async (event) => {
    return {
        message: `Hello ${event.body.name}, welcome to the exciting Serverless world!`,
        event,
    };
};

export const main = middy(hello)
    .use(middyJsonBodyParser())
    .use(
        middyValidator({
            inputSchema: { type: 'object', properties: { body: helloSchema } },
        }),
    )
    .use(middyHttpErrorHandler());
