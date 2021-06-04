require('isomorphic-fetch');
const dotenv = require('dotenv');
const Koa = require('koa');
const next = require('next');
const {default: createShopifyAuth} = require('@shopify/koa-shopify-auth');
const {verifyRequest} = require('@shopify/koa-shopify-auth');
const {default: Shopify, ApiVersion} = require('@shopify/shopify-api');
const Router = require('koa-router');
const {receiveWebhook, registerWebhook}  =  require('@shopify/koa-shopify-webhooks');


dotenv.config();
let sp;
Shopify.Context.initialize({
  API_KEY: process.env.SHOPIFY_API_KEY,
  API_SECRET_KEY: process.env.SHOPIFY_API_SECRET,
  SCOPES: process.env.SHOPIFY_API_SCOPES.split(","),
  HOST_NAME: process.env.SHOPIFY_APP_URL.replace(/https:\/\//, ""),
  API_VERSION: ApiVersion.October20,
  IS_EMBEDDED_APP: true,
  SESSION_STORAGE: new Shopify.Session.MemorySessionStorage(),
});

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({dev: dev});
const handle = app.getRequestHandler();

const ACTIVE_SHOPIFY_SHOPS = {};

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.keys = [Shopify.Context.API_SECRET_KEY];

  server.use(
    createShopifyAuth({
      //  accessMode: 'offline',
        async afterAuth(ctx) {
           const {shop, scope, accessToken} = ctx.state.shopify;
           ACTIVE_SHOPIFY_SHOPS[shop] = scope;
           ctx.cookies.set('shopOrigin', shop, {
            httpOnly: false,
            secure: true,
            sameSite: 'none'
            });
            ctx.cookies.set('accessToken', accessToken, {
              httpOnly: false,
              secure: true,
              sameSite: 'none'
          });
          //  const registration = await registerWebhook({
          //    shop,
          //    accessToken,
          //    address: 'https://37844cbd12c4.ngrok.io/webhooks',
          //    topic: 'ORDERS_CREATE',
          //    apiVersion: ApiVersion.October20,
          //    webhookHandler: (_topic, shop, _body) => {
          //      console.log('ORDERS_CREATE');
          //    },
          //  });
   
          //  if (registration.success) {
          //    console.log('Successfully registered webhook!');
          //  } else {
          //    console.log('Failed to register webhook', registration.result.data.webhookSubscriptionCreate.userErrors);
          //  }
           ctx.redirect(`/?shop=${shop}`);
         },
      

    }),
  )
 

  router.post("/graphql", verifyRequest({returnHeader: true}), async (ctx, next) => {
    
    await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  });
  router.get('/api/:object', async (ctx) => {
    try {
      console.log(ctx)
      const results = await fetch("https://" +"sandeshbagade.myshopify.com" + "/admin/api/2020-10/" + ctx.params.object + ".json", {
        headers: {
          "X-Shopify-Access-Token": ctx.cookies.get('accessToken'),
        },
      })
      .then(response => response.json())
      .then(json => {
        return json;
      });
      return ctx.body = {
        status: 'success',
        data: results
      };
    } catch (err) {
      console.log(err)
    }
  })
  router.post('/api/:object', async (ctx) => {
    try {
      console.log(ctx)
      const results = await fetch("https://" +"sandeshbagade.myshopify.com" + "/admin/api/2020-10/" + ctx.params.object + ".json", {
        headers: {
          "X-Shopify-Access-Token": ctx.cookies.get('accessToken'),
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method:'POST',
        body:JSON.stringify({
          "report": {
            "name": "A UTM Campaign Source app report",
            "shopify_ql": "SHOW total_visitors, total_sessions OVER day FROM visits WHERE utm_campaign_source == 'opaEmail' SINCE -7d UNTIL today ORDER BY 'day' ASC LIMIT 1000"
            }
        })
      })
      .then(response => response.json())
      .then(json => {
        return json;
      });
      console.log('Post')
      console.log(results)
      return ctx.body = {
        status: 'success',
        body: JSON.stringify(results)
      };
    } catch (err) {
      console.log(err)
    }
  })
  server.use(
    // receive webhooks
    receiveWebhook({
      path: '/webhooks',
      secret: Shopify.Context.API_SECRET_KEY,
      // called when a valid webhook is received
      onReceived(ctx) {
        async function s(){  
          const client = new Shopify.Clients.Graphql(ctx.state.webhook.domain,'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');
          const response = await client.query({
            data: `mutation tagsAdd {
              tagsAdd(id: ${JSON.stringify(ctx.state.webhook.payload.admin_graphql_api_id.toString())}, tags: [
                "Sandesh"
              ]) {
                node {
                  id
                }
                userErrors {
                  field
                  message
                }
              }
            }`,  
          })
          console.log(response.body.errors)
        }
        s();
      },
    }))

  const handleRequest = async (ctx) => {
    await handle(ctx.req, ctx.res);
    ctx.respond = false;
    ctx.res.statusCode = 200;
  };

  router.get("/", async (ctx) => {
    const shop = ctx.query.shop;

    if (ACTIVE_SHOPIFY_SHOPS[shop] === undefined) {
      ctx.redirect(`/auth?shop=${shop}`);
    } else {
      await handleRequest(ctx);
    }
  });

  router.get("(/_next/static/.*)", handleRequest);
  router.get("/_next/webpack-hmr", handleRequest);
  router.get("(.*)", verifyRequest(), handleRequest);

  server.use(router.allowedMethods());
  server.use(router.routes());

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
