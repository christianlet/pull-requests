import { APIGatewayEventRequestContextV2, APIGatewayProxyEventV2WithRequestContext } from 'aws-lambda'

export const handler = async (event: APIGatewayProxyEventV2WithRequestContext<APIGatewayEventRequestContextV2>) => {
    console.log(event)

    return {
        statusCode: 200,
        body: JSON.stringify({
            test: event.pathParameters?.id ?? false
        })
    }
}