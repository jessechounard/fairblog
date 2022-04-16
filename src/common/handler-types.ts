import { APIGatewayProxyEvent, Handler } from 'aws-lambda';

export type APIGatewayProxyEventExtended<
    BodyType,
    PathParametersType,
    QueryStringParametersType,
> = Omit<
    APIGatewayProxyEvent,
    'body' | 'pathParameters' | 'queryStringParameters'
> & {
    body: BodyType;
    pathParameters: PathParametersType;
    queryStringParameters: QueryStringParametersType;
};

export type APIGatewayProxyEventResponse<ResponseType> = {
    statusCode: number;
    body: ResponseType;
};

export type DefaultBodyType = APIGatewayProxyEvent['body'];
export type DefaultPathParametersType = APIGatewayProxyEvent['pathParameters'];
export type DefaultQueryStringParametersType =
    APIGatewayProxyEvent['queryStringParameters'];

export type APIGatewayProxyEventHandler<
    ResponseBodyType,
    BodyType = DefaultBodyType,
    PathParametersType = DefaultPathParametersType,
    QueryStringParametersType = DefaultQueryStringParametersType,
> = Handler<
    APIGatewayProxyEventExtended<
        BodyType,
        PathParametersType,
        QueryStringParametersType
    >,
    APIGatewayProxyEventResponse<ResponseBodyType>
>;
