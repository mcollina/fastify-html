import { FastifyPluginCallback, FastifyInstance, FastifyReply } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    /**
     * Function to render HTML.
     * @param strings Template strings.
     * @param values Values to be injected into the template.
     */
    html(strings: TemplateStringsArray, ...values: any[]): string;

    /**
     * Adds a layout to the Fastify instance.
     * @param render The function that renders the layout.
     * @param options Options for the layout.
     */
    addLayout(
      render: (inner: string, context: FastifyReply) => string,
      options?: { skipOnHeader?: string }
    ): void;
  }

  interface FastifyReply {
    /**
     * Function to render and send HTML with layouts.
     * @param strings Template strings.
     * @param values Values to be injected into the template.
     */
    html(strings: TemplateStringsArray, ...values: any[]): FastifyReply;
  }
}

interface FastifyHtmlPluginOptions {
  async?: boolean;
}

type FastifyHtmlPlugin = FastifyPluginCallback<FastifyHtmlPluginOptions>;

declare const fastifyHtml: FastifyHtmlPlugin;
export = fastifyHtml;
