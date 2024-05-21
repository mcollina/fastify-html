import fastifyHtml from '..';
import { expectType } from 'tsd';
import * as fastifyHtmlStar from '..';
import fastify, { FastifyInstance, FastifyReply } from 'fastify';

const app: FastifyInstance = fastify();
app.register(fastifyHtml);

const server = fastify();

server.register(fastifyHtml, { async: false });

server.after(() => {
  // Testing the 'html' method on Fastify instance
  expectType<(strings: TemplateStringsArray, ...values: any[]) => string>(server.html);

  // Testing the 'addLayout' method on Fastify instance
  expectType<(
    render: (htmlString: string, context: FastifyReply) => string,
    options?: { skipOnHeader?: string }
  ) => void>(server.addLayout);

  // Testing the 'html' method on Fastify reply
  server.get('/', (request, reply) => {
    expectType<(strings: TemplateStringsArray, ...values: any[]) => FastifyReply>(
      reply.html
    );

    reply.html`<p>Hello World</p>`;
  });
});

const serverWithPlugin = fastify();

serverWithPlugin.register(fastifyHtml);

serverWithPlugin.after(() => {
  serverWithPlugin.get('/', (request, reply) => {
    reply.html`<p>Hello World</p>`;
  });
});
