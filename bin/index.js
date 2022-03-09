#!/usr/bin/env node
// const { createRequire } = require('module');
const path = require('path');
const fs = require('fs');
const createDebug = require('debug');
const { lilconfig } = require('lilconfig');
const { slice, map, forEach } = require('lodash');

const debug = createDebug('x-seolint');
const jsonParse = (path, content) => {
  return JSON.parse(content);
};
const explorer = lilconfig(
  'x-seolint',
  {
    searchPlaces: ['package.json'],
    loaders: { '.json': jsonParse },
  },
);
// const require = createRequire(import.meta.url);
const resolveConfig = (configPath) => {
  try {
    return require.resolve(configPath);
  } catch {
    return configPath;
  }
};
const loadConfig = async ({ configPath, cwd }) => {
  try {
    if (configPath) {
      debug('Loading configuration from `%s`...', configPath);
    } else {
      debug('Searching for configuration from `%s`...', cwd);
    }
    const path = resolveConfig(configPath);
    debug('path: %s', path);
    const result = await (
      configPath
      ? explorer.load(path)
      : explorer.search(cwd)
    );
    debug('result: %O', result);
    if (!result) {
      throw new Error('no config');
    }
    const config = await result.config;
    const filepath = result.filepath;
    debug('Successfully loaded config from `%s`:\n%O', filepath, config);
    return { config, filepath };
  } catch (e) {
    debug('Failed to load configuration!');
    throw e;
  }
};
(async () => {
  try {
    const { argv } = process;
    debug('argv: %O', argv);
    let files = slice(argv, 2);
    if (!files.length) {
      process.exit(0);
    }
    const { config, filepath } = await loadConfig({ configPath: 'package.json' });
    const pathArr = filepath.split(path.sep);
    pathArr.pop();
    const projectPath = pathArr.join(path.sep);
    debug('projectPath: %s', projectPath);
    files = map(files, (file) => {
      return file.substr(projectPath.length);
    });
    debug('files: %O', files);
    let result = true;
    forEach(files, (file) => {
      const fileConfig = config[file];
      debug('fileConfig: %O', fileConfig);
      const text = fs.readFileSync(`${projectPath}${file}`, 'utf-8');
      forEach(fileConfig, (count, keyword) => {
        const $_count = text.match(new RegExp(keyword, 'g'))?.length ?? 0;
        debug('$_count: %s', $_count);
        if ($_count !== count) {
          console.error(`关键字个数不匹配: ${file}, ${keyword}, ${$_count} !== ${count}`);
          result = false;
        }
      });
    });
    if (!result) {
      process.exit(1);
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
