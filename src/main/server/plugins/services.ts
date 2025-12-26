import fp from 'fastify-plugin'
import type { FastifyPluginAsync } from 'fastify'
import type { ServerServices } from '../types'

export const servicesPlugin: FastifyPluginAsync<{ services: ServerServices }> = fp(
  async (server, opts) => {
    server.decorate('services', opts.services)
  }
)
