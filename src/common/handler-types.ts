import { APIGatewayProxyEvent, Handler } from 'aws-lambda';

export type APIGatewayProxyEventWithBody<BodyType> = Omit<
    APIGatewayProxyEvent,
    'body'
> & { body: BodyType };

export type APIGatewayProxyEventWithBodyHandler<BodyType, ResponseType> =
    Handler<APIGatewayProxyEventWithBody<BodyType>, ResponseType>;

export type APIGatewayProxyEventResponse = {
    statusCode: number;
    body?: string;
};
