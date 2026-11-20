// The chithii.com Worker. Everything is a static file from dist/ (served by the ASSETS binding, with
// public/_headers and public/_redirects applied). The only code: www.chithii.com redirects to the apex,
// keeping the path and query, so the site needs no Redirect Rule in the Cloudflare dashboard.
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // The Host header is the name the visitor typed (the same as url.hostname on Cloudflare).
    const host = (request.headers.get('host') || url.hostname).toLowerCase().split(':')[0];
    if (host === 'www.chithii.com') {
      url.hostname = 'chithii.com';
      url.protocol = 'https:';
      url.port = '';
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
