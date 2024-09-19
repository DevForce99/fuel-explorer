import { createServer } from 'http';
import { env } from './config';
import { logger } from './core/Logger';
import { GraphQLServer } from './graphql/GraphQLServer';
import { DatabaseConnection } from './infra/database/DatabaseConnection';
import { Server } from './infra/server/App';
import { WebSocketService } from './infra/server/WebSocket';

(async () => {
  const port = Number(env.get('SERVER_PORT'));
  const graphQLServer = new GraphQLServer();
  const schema = graphQLServer.schema();
  const yoga = graphQLServer.setup(schema);
  const httpServer = new Server();
  const app = httpServer.setup();
  DatabaseConnection.getInstance();

  app.use(yoga.graphqlEndpoint, yoga);

  const server = createServer(app);
  new WebSocketService(server);

  server.listen(port, () => {
    logger.info(
      `📟 GraphQL server is running on http://localhost:${port}${yoga.graphqlEndpoint}`,
    );
    logger.info(`📡 WebSocket server is running on ws://localhost:${port}`);

    const others = ['SIGINT', 'SIGUSR1', 'SIGUSR2', 'SIGTERM'];
    //biome-ignore lint/complexity/noForEach: <explanation>
    others.forEach((eventType) => {
      process.on(eventType, async (err) => {
        logger.error('❌ GraphQL shutdown error', err);
        process.exit(1);
      });
    });
  });
})();
