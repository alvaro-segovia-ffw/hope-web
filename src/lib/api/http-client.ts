export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  token?: string;
  payload?: unknown;
};

export async function apiRequest<TResponse>(
  path: string,
  options: RequestOptions = {},
): Promise<TResponse> {
  const { method = "GET", token, payload } = options;

  const headers = new Headers({
    Accept: "application/json",
  });

  if (payload !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api/proxy${path}`, {
    method,
    headers,
    cache: "no-store",
    body: payload !== undefined ? JSON.stringify(payload) : undefined,
  });

  const text = await response.text();
  const responseBody = text ? tryParseJson(text) : null;

  if (!response.ok) {
    throw new ApiError(
      resolveErrorMessage(response.status, responseBody),
      response.status,
      responseBody,
    );
  }

  return responseBody as TResponse;
}

function tryParseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

function resolveErrorMessage(status: number, body: unknown): string {
  if (status === 401) {
    return "Your session is not authorized. Please sign in again.";
  }

  if (status === 403) {
    return "You do not have permissions to perform this action.";
  }

  if (body && typeof body === "object" && "message" in body) {
    const message = body.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return `API returned an error (${status}).`;
}
