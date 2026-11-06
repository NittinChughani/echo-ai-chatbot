# ECHO AI — Public chatbot website

A responsive, browser-first AI chat interface. Visitors need no signup, subscription, Node.js or local server. Code is plain HTML/CSS/JavaScript for GitHub Pages.

Website source is in [`docs/`](./docs). GitHub Pages will serve this folder once publishing is enabled.

## Publishing a *new* repository (leave the old `ECHO-AI` unchanged)

> **Name restriction:** GitHub treats `ECHO-AI` and `echo-ai` as the same repository, so a separate repository needs a different name, named `echo-ai-chatbot`.

1. Create a **new public** repository, named `echo-ai-chatbot`, using <https://github.com/new>. Add an initial README if you want to upload via GitHub connectors.
2. Upload the `docs/` directory and this README **to the new repository**, not `ECHO-AI`. Include the optional `cloudflare/` folder only if desired.
3. In the new repository, open **Settings → Pages**. Under **Build and deployment**, select **Deploy from a branch**, branch **main** and folder **/docs**, then **Save**.
4. Expected GitHub Pages URL after enabling publishing: `https://nittinchughani.github.io/echo-ai-chatbot/` if the repository is named `echo-ai-chatbot` and owned by `NittinChughani`.
5. Send an actual chat prompt on the published site to verify the AI provider responds. This live call was *not* verified when this package was assembled.

### Features

- No visitor account and no payment required
- Polished dark/light theme with responsive mobile layout
- Local chat history and search, custom instructions, copy, regenerate, stop, Markdown export
- JavaScript runs entirely in the browser; model inference is hosted remotely
- AI provider configuration in `docs/config.js`

### AI provider and limitations

The default attempts anonymous direct browser requests to OVHcloud AI Endpoints, with an advertised rate limit of **2 requests/minute per IP per model**. It is free to visitors but **not unlimited or guaranteed**. Messages are sent to OVHcloud for processing. Browser CORS rules, provider uptime and model availability can change. If this integration stops working, `cloudflare/worker.js` is an optional alternative that requires owner setup; see `OPTIONAL_CLOUDFLARE_BACKUP.md`.

Never put secret API keys in public JavaScript or GitHub files.

### Testing

JavaScript syntax was validated. The interface can be tested in a browser with mocked AI responses, but live hosted AI calls and GitHub Pages publishing must be checked on the deployed site. A passing static-code test alone does not certify that free remote inference works.

### Credits

AI inference is provided by third parties, not GitHub Pages. ECHO is an independent open-source interface, not an official OVHcloud product.

## Reference

- [GitHub Pages publishing](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [OVHcloud AI Endpoints limits](https://docs.ovhcloud.com/en/guides/public-cloud/ai-machine-learning/ai-endpoints-capabilities)