module.exports = {
  message: 'NativeScript Plugins ~ made with ❤️  Choose a command to start...',
  pageSize: 32,
  scripts: {
    default: 'nps-i',
    nx: {
      script: 'nx',
      description: 'Execute any command with the @nrwl/cli',
    },
    format: {
      script: 'nx format:write',
      description: 'Format source code of the entire workspace (auto-run on precommit hook)',
    },
    '🔧': {
      script: `npx cowsay "NativeScript plugin demos make developers 😊"`,
      description: '_____________  Apps to demo plugins with  _____________',
    },
    // demos
    apps: {
      '...Vanilla...': {
        script: `npx cowsay "Nothing wrong with vanilla 🍦"`,
        description: ` 🔻 Vanilla`,
      },
      demo: {
        clean: {
          script: 'nx run demo:clean',
          description: '⚆  Clean  🧹',
        },
        ios: {
          script: 'nx run demo:ios',
          description: '⚆  Run iOS  ',
        },
        android: {
          script: 'nx run demo:android',
          description: '⚆  Run Android  🤖',
        },
      },
      '...Angular...': {
        script: `npx cowsay "Test all the Angles!"`,
        description: ` 🔻 Angular`,
      },
      'demo-angular': {
        clean: {
          script: 'nx run demo-angular:clean',
          description: '⚆  Clean  🧹',
        },
        ios: {
          script: 'nx run demo-angular:ios',
          description: '⚆  Run iOS  ',
        },
        android: {
          script: 'nx run demo-angular:android',
          description: '⚆  Run Android  🤖',
        },
      },
    },
    '⚙️': {
      script: `npx cowsay "@rxdb/* packages will keep your ⚙️ cranking"`,
      description: '_____________  @rxdb/*  _____________',
    },
    // packages
    // build output is always in dist/packages
    '@rxdb': {
      // nativescript-rxstorage-sqlite-adapter
      'nativescript-rxstorage-sqlite-adapter': {
        build: {
          script: 'nx run nativescript-rxstorage-sqlite-adapter:build.all',
          description: 'nativescript-rxstorage-sqlite-adapter: Build',
        },
      },
      // @rxdb/nativescript-md5
      'nativescript-md5': {
        build: {
          script: 'nx run nativescript-md5:build.all',
          description: '@rxdb/nativescript-md5: Build',
        },
      },
      // @@herefishyfish/rxdb
      rxdb: {
        build: {
          script: 'nx run rxdb:build.all',
          description: '@@herefishyfish/rxdb: Build',
        },
      },
      // @herefishyfish/nativescript-sqlite-rxstorage-adapter
      'nativescript-sqlite-rxstorage-adapter': {
        build: {
          script: 'nx run nativescript-sqlite-rxstorage-adapter:build.all',
          description: '@herefishyfish/nativescript-sqlite-rxstorage-adapter: Build',
        },
      },
      // @herefishyfish/nativescript-pouchdb-sqlite-adapter
      'nativescript-pouchdb-sqlite-adapter': {
        build: {
          script: 'nx run nativescript-pouchdb-sqlite-adapter:build.all',
          description: '@herefishyfish/nativescript-pouchdb-sqlite-adapter: Build',
        },
      },
      // @herefishyfish/nativescript-lokijs
      'nativescript-lokijs': {
        build: {
          script: 'nx run nativescript-lokijs:build.all',
          description: '@herefishyfish/nativescript-lokijs: Build',
        },
      },
      // @herefishyfish/nativescript-opfs
      'nativescript-opfs': {
        build: {
          script: 'nx run nativescript-opfs:build.all',
          description: '@herefishyfish/nativescript-opfs: Build',
        },
      },
      'build-all': {
        script: 'nx run-many --target=build.all --all',
        description: 'Build all packages',
      },
    },
    '⚡': {
      script: `npx cowsay "Focus only on source you care about for efficiency ⚡"`,
      description: '_____________  Focus (VS Code supported)  _____________',
    },
    focus: {
      'nativescript-rxstorage-sqlite-adapter': {
        script: 'nx run nativescript-rxstorage-sqlite-adapter:focus',
        description: 'Focus on nativescript-rxstorage-sqlite-adapter',
      },
      'nativescript-md5': {
        script: 'nx run nativescript-md5:focus',
        description: 'Focus on @rxdb/nativescript-md5',
      },
      rxdb: {
        script: 'nx run rxdb:focus',
        description: 'Focus on @@herefishyfish/rxdb',
      },
      'nativescript-sqlite-rxstorage-adapter': {
        script: 'nx run nativescript-sqlite-rxstorage-adapter:focus',
        description: 'Focus on @herefishyfish/nativescript-sqlite-rxstorage-adapter',
      },
      'nativescript-pouchdb-sqlite-adapter': {
        script: 'nx run nativescript-pouchdb-sqlite-adapter:focus',
        description: 'Focus on @herefishyfish/nativescript-pouchdb-sqlite-adapter',
      },
      'nativescript-lokijs': {
        script: 'nx run nativescript-lokijs:focus',
        description: 'Focus on @herefishyfish/nativescript-lokijs',
      },
      'nativescript-opfs': {
        script: 'nx run nativescript-opfs:focus',
        description: 'Focus on @herefishyfish/nativescript-opfs',
      },
      reset: {
        script: 'nx g @rxdb/plugin-tools:focus-packages',
        description: 'Reset Focus',
      },
    },
    '.....................': {
      script: `npx cowsay "That's all for now folks ~"`,
      description: '.....................',
    },
  },
};
