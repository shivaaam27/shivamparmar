import { defineCloudflareConfig } from '@opennextjs/cloudflare';

// Default setup: no cache bindings. Pages are built ahead of time; /insights and the API run live.
export default defineCloudflareConfig();
