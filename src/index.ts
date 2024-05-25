import { Elysia } from 'elysia';
import { getCityByIp, getCityBySearch } from './utils/city';
import { getTextResponse } from './utils/text-response';
import { html } from '@elysiajs/html';
import { responseView } from './utils/view-response';
import staticPlugin from '@elysiajs/static';

const app = new Elysia()
  .use(staticPlugin())
  .use(html())
  .use(app =>
    // provide isCurl to each endpoint handler
    app.derive({ as: 'global' }, ({ request }) => ({
      isCurl: !!request.headers.get('user-agent')?.includes('curl')
    }))
  )
  .use(app =>
    // provide isCurl to each endpoint handler
    app.derive({ as: 'global' }, ({ request }) => ({
      ip:
        request.headers.get('x-forwarded-for') ??
        request.headers.get('x-envoy-external-address')
    }))
  )
  .get('/', async ({ isCurl, ip }) => {
    const city = await getCityByIp(ip);
    const textResponse = await getTextResponse(city, isCurl);
    if (isCurl) return textResponse;
    return responseView(textResponse, city.name);
  })
  .get('/:query', async ({ params, isCurl }) => {
    console.log('Search for city:', params.query);
    const city = await getCityBySearch(params.query);
    const textResponse = await getTextResponse(city, isCurl);
    if (isCurl) return textResponse;
    return responseView(textResponse, city.name);
  })
  .listen(process.env['PORT'] ?? 3000);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`
);