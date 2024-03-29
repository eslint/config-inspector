#!/usr/bin/env node

import process from 'node:process'
import open from 'open'
import { getPort } from 'get-port-please'

process.env.HOST = process.env.HOST || '127.0.0.1'
process.env.PORT = process.env.PORT || await getPort({ port: 7777 })

await Promise.all([
  import('./dist/server/index.mjs'),
  process.env.NO_OPEN
    ? undefined
    : open(`http://localhost:${process.env.PORT}`),
])
