// src/response.js

export function createSuccessResponse(data) {
  return {
    status: 'ok',
    ...data,
  };
};

export function createErrorResponse(code, message) {
  return {
    status: 'error',
    error: {
      code: code,
      message: message,
    },
  };
};
