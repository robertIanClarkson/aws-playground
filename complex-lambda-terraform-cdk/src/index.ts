import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { verify } from './verify';
import { lower } from "./lower";
import { upper } from './upper';

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

    // Parse and validate the request body
    const result = verify(JSON.parse(event.body));

    if (!result.success) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Validation failed',
          errors: result.error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message,
          })),
        }),
      };
    }

    const { firstName, lastName } = result.data;

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Hello, ${lower(firstName)} ${upper(lastName)}!`,
      }),
    };
  } catch (error) {
    // Add better error handling for JSON.parse errors
    if (error instanceof SyntaxError) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid JSON in request body',
        }),
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
      }),
    };
  }
};

// const event = {
//   "body": "{\"firstName\":\"John\",\"lastName\":\"Doe\"}"
// } as APIGatewayProxyEvent;

// handler(event).then(console.log).catch(console.error)