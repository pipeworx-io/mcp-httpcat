interface McpToolDefinition {
  name: string;
  description: string;
  /** Human-facing one-liner (fleet #1967). Optional; consumers fall back to
   *  description. Kept in step with shared/src/types.ts — scripts/lib/
   *  check-inlined-types.mjs reports drift at publish time. */
  summary?: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
    anyOf?: Array<{ required: string[] }>;
    oneOf?: Array<{ required: string[] }>;
    allOf?: Array<{ required: string[] }>;
  };
  outputSchema?: Record<string, unknown>;
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * HTTP Cat MCP — wraps http.cat (free, no auth)
 *
 * Tools:
 * - get_status_cat: Get the http.cat image URL for an HTTP status code
 * - list_codes: List common HTTP status codes with descriptions
 */


const BASE_URL = 'https://http.cat';

const COMMON_CODES: Array<{ code: number; description: string }> = [
  { code: 100, description: 'Continue' },
  { code: 101, description: 'Switching Protocols' },
  { code: 200, description: 'OK' },
  { code: 201, description: 'Created' },
  { code: 202, description: 'Accepted' },
  { code: 204, description: 'No Content' },
  { code: 206, description: 'Partial Content' },
  { code: 301, description: 'Moved Permanently' },
  { code: 302, description: 'Found' },
  { code: 304, description: 'Not Modified' },
  { code: 307, description: 'Temporary Redirect' },
  { code: 308, description: 'Permanent Redirect' },
  { code: 400, description: 'Bad Request' },
  { code: 401, description: 'Unauthorized' },
  { code: 403, description: 'Forbidden' },
  { code: 404, description: 'Not Found' },
  { code: 405, description: 'Method Not Allowed' },
  { code: 408, description: 'Request Timeout' },
  { code: 409, description: 'Conflict' },
  { code: 410, description: 'Gone' },
  { code: 413, description: 'Payload Too Large' },
  { code: 414, description: 'URI Too Long' },
  { code: 418, description: "I'm a Teapot" },
  { code: 422, description: 'Unprocessable Entity' },
  { code: 425, description: 'Too Early' },
  { code: 429, description: 'Too Many Requests' },
  { code: 500, description: 'Internal Server Error' },
  { code: 501, description: 'Not Implemented' },
  { code: 502, description: 'Bad Gateway' },
  { code: 503, description: 'Service Unavailable' },
  { code: 504, description: 'Gateway Timeout' },
  { code: 508, description: 'Loop Detected' },
];

const tools: McpToolExport['tools'] = [
  {
    name: 'get_status_cat',
    description:
      'Get a cat image representing an HTTP status code. Provide the code (e.g., 200, 404, 500). Returns the image URL.',
    inputSchema: {
      type: 'object',
      properties: {
        status_code: {
          type: 'number',
          description: 'HTTP status code (e.g., 200, 404, 500)',
        },
      },
      required: ['status_code'],
    },
  },
  {
    name: 'list_codes',
    description:
      'Browse all available HTTP status codes with descriptions and cat image URLs. Use to find the right code for your status or explore available options.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'get_status_cat':
      return getStatusCat(args.status_code as number);
    case 'list_codes':
      return listCodes();
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function getStatusCat(statusCode: number) {
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    throw new Error(`Invalid HTTP status code: ${statusCode}. Must be an integer between 100 and 599.`);
  }
  const known = COMMON_CODES.find((c) => c.code === statusCode);
  return {
    status_code: statusCode,
    description: known?.description ?? 'Unknown',
    image_url: `${BASE_URL}/${statusCode}`,
  };
}

function listCodes() {
  return {
    count: COMMON_CODES.length,
    codes: COMMON_CODES.map((c) => ({
      code: c.code,
      description: c.description,
      image_url: `${BASE_URL}/${c.code}`,
    })),
  };
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
