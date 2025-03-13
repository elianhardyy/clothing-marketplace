// File: src/utils/response.ts
import { Response } from 'express';

interface ApiResponseData {
  statusCode: number;
  message: string;
  data: any;
  pagination?: PaginationData;
  errors?: string | string[];
}

interface PaginationData {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export class ApiResponse {
  /**
   * Send success response
   */
  public static success(
    res: Response,
    message: string,
    data: any,
    statusCode: number = 200,
    pagination?: PaginationData,
  ): Response {
    const responseData: ApiResponseData = {
      statusCode,
      message,
      data,
    };

    if (pagination) {
      responseData.pagination = pagination;
    }

    return res.status(statusCode).json(responseData);
  }

  /**
   * Send error response
   */
  public static error(
    res: Response,
    message: string,
    statusCode: number = 500,
    errors?: string | string[],
  ): Response {
    const responseData: ApiResponseData = {
      statusCode,
      message,
      data: null,
    };

    if (errors) {
      responseData.errors = errors;
    }

    return res.status(statusCode).json(responseData);
  }
}
