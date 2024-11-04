"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const handler = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'No body provided' }),
            };
        }
        const { firstName, lastName } = JSON.parse(event.body);
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
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Internal server error',
            }),
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=index.js.map