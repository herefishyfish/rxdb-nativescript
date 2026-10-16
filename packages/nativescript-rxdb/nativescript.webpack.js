import { createRequire } from 'module';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));

function hook(webpack) {
  webpack.chainWebpack((config) => {
    const projectRoot = webpack.Utils.project.getProjectRootPath();
    const pkgDir = (name, from) => dirname(require.resolve(`${name}/package.json`, { paths: [from] }));
    const rxdbDir = pkgDir('rxdb', projectRoot);

    // NativeScript builds with target "node", so these would otherwise resolve to their Node builds.
    config.resolve.alias.set('broadcast-channel$', join(pkgDir('broadcast-channel', rxdbDir), 'dist/esbrowser/index.js'));
    config.resolve.alias.set('ws$', join(here, 'ws.js'));
    config.resolve.alias.set('unload$', join(here, 'unload.js'));
  });
}

// @nativescript/webpack loads hooks with require(); this makes require(esm) return the function.
export { hook as 'module.exports' };
