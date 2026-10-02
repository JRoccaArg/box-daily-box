import assert from 'node:assert/strict';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import { apiCorsOptions } from '../src/api/cors';

const origin = 'https://frontend.test';
const app = Fastify();
await app.register(cors, apiCorsOptions([origin]));
app.get('/user/test/summary', async () => ({won: 12}));
try {
 const response = await app.inject({method: 'OPTIONS', url: '/user/test/summary', headers: {
  origin, 'access-control-request-method': 'GET',
  'access-control-request-headers': 'x-identity-token,x-debug-date',
 }});
 assert.equal(response.statusCode, 204);
 assert.equal(response.headers['access-control-allow-origin'], origin);
 const allowed = String(response.headers['access-control-allow-headers']).toLowerCase().split(',').map(h=>h.trim());
 assert.ok(allowed.includes('x-debug-date'));
 assert.ok(allowed.includes('x-identity-token'));
 assert.equal(response.headers['access-control-allow-credentials'], undefined);
 const untrusted = await app.inject({method:'OPTIONS', url:'/user/test/summary', headers:{origin:'https://untrusted.test','access-control-request-method':'GET','access-control-request-headers':'x-debug-date'}});
 assert.equal(untrusted.headers['access-control-allow-origin'], undefined);
 const actual = await app.inject({method:'GET', url:'/user/test/summary', headers:{origin,'x-debug-date':'2026-01-15','x-identity-token':'test'}});
 assert.equal(actual.headers['access-control-allow-origin'], origin);
 assert.equal(actual.json().won,12);
 console.log('API CORS: authenticated requests with the staging date header are allowed; unknown origins remain blocked.');
} finally {await app.close();}
