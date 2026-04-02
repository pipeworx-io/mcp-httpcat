# mcp-httpcat

MCP server for HTTP status code cat images via [http.cat](https://http.cat/). No authentication required.

## Tools

| Tool | Description |
|------|-------------|
| `get_status_cat` | Get the http.cat image URL for an HTTP status code |
| `list_codes` | List common HTTP status codes with descriptions and image URLs |

## Quickstart (Pipeworx Gateway)

```bash
curl -X POST https://gateway.pipeworx.io/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "httpcat_get_status_cat",
      "arguments": { "status_code": 404 }
    },
    "id": 1
  }'
```

## License

MIT
