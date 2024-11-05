import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { z } from 'zod';

// Define the schema for request validation
const NameRequestSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
});

// Infer the type from the schema
// type NameRequest = z.infer<typeof NameRequestSchema>;

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
    const result = NameRequestSchema.safeParse(JSON.parse(event.body));

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
        message: `Hello, ${firstName} ${lastName}!`,
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