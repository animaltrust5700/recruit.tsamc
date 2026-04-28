// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

const PRODUCTION_SITE = 'https://www.recruit.tsamc.jp';
const PREVIEW_SITE = 'https://web7100.sakura.ne.jp';
const PREVIEW_BASE = '/recruit.tsamc/dev';

const normalizePath = (path) => {
  if (!path || path === '/') return '/';
  return `/${path.replace(/\\/g, '/').replace(/^\/+|\/+$/g, '')}`;
};

const sshTargetDir = process.env.SSH_TARGET_DIR?.replace(/\\/g, '/').replace(/\/+$/g, '') ?? '';
const isPreviewTarget = sshTargetDir.endsWith('/recruit.tsamc/dev');
const site = process.env.SITE_URL ?? (isPreviewTarget ? PREVIEW_SITE : PRODUCTION_SITE);
const base = normalizePath(process.env.BASE_PATH ?? (isPreviewTarget ? PREVIEW_BASE : '/'));

export default defineConfig({
  integrations: [react()],
  output: 'static',
  site,
  base,
});
