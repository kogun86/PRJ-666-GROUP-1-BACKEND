# PRJ-666-GROUP-1-BACKEND

In development mode (`NODE_ENV=development` inside `.env.development`), the backend will accept  
`Authorization: Bearer mock-id-token` as a valid token for testing.

To test locally:
1. Ensure your `.env.development` file contains `NODE_ENV=development`
2. Start the backend server.
3. Call:
   ```sh
   curl -H "Authorization: Bearer mock-id-token" http://localhost:8080/api/v1/events/upcoming