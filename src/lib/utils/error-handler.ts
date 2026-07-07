import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/types/api";
import { logger } from "@/lib/utils/logger";

export type { ApiErrorResponse, ApiSuccessResponse } from "@/lib/types/api";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500,
    public code = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ValidationError extends ApiError {
  constructor(message = "Please check the submitted information.") {
    super(message, 400, "VALIDATION_ERROR");
    this.name = "ValidationError";
  }
}

export class AuthError extends ApiError {
  constructor(message = "Please sign in to continue.") {
    super(message, 401, "AUTH_ERROR");
    this.name = "AuthError";
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "You do not have permission to perform this action.") {
    super(message, 403, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "The requested resource was not found.") {
    super(message, 404, "NOT_FOUND");
    this.name = "NotFoundError";
  }
}

function logError(error: unknown, response: ApiErrorResponse["error"]) {
  const context = {
    code: response.code,
    message: response.message,
  };

  if (error instanceof Error) {
    logger.error("API request failed", error, context);
    return;
  }

  logger.error("API request failed", undefined, { ...context, error });
}

export function handleError(error: unknown): NextResponse<ApiErrorResponse> {
  if (error instanceof ApiError) {
    const response = {
      code: error.code,
      message: error.message,
    };
    logError(error, response);
    return NextResponse.json({ success: false, error: response }, { status: error.statusCode });
  }

  if (error instanceof ZodError) {
    const response = {
      code: "VALIDATION_ERROR",
      message: error.issues[0]?.message ?? "Please check the submitted information.",
    };
    logError(error, response);
    return NextResponse.json({ success: false, error: response }, { status: 400 });
  }

  const response = {
    code: "INTERNAL_ERROR",
    message: "Something went wrong. Please try again.",
  };
  logError(error, response);
  return NextResponse.json({ success: false, error: response }, { status: 500 });
}

export function createApiResponse<T>(data: T, message?: string, statusCode = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, message, data }, { status: statusCode });
}
