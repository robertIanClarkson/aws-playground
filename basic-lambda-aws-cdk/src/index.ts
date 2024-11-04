import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface NameRequest {
  firstName: string;
  lastName: string;
}

export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'No body provided' }),
      };
    }

    const { firstName, lastName } = JSON.parse(event.body) as NameRequest;

    if (!firstName || !lastName) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'First name and last name are required',
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Hello, ${firstName} ${lastName}!`,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};
