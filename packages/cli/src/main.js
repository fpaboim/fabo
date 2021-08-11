import chalk from 'chalk';
import fs from 'fs';
import ncp from 'ncp';
import path from 'path';
import { promisify } from 'util';
import execa from 'execa';
import Listr from 'listr';
import compile from '../../server-templates/compile.js'

const access = promisify(fs.access);
const copy = promisify(ncp);

const TEMPLATES = {
  Svelte: 'svelte-starter',
  'Barebones w/ admin': 'barebones-admin',
  Barebones: 'barebones'
}

function filterfunc(source) {
  if (source.includes('.git')
   || source.includes('.webpack')
   || source.includes('.svelte-kit')
   || source.includes('.fabo')
   || source.includes('.log')
   || source.includes('node_modules')) {
    return false
  }
  return true
}

async function copyTemplateFiles(options) {
  let res = await copy(options.templateDirectory, options.targetDirectory, {
    clobber: false,
    filter: filterfunc,
    dereference: true,
  });

  return res
}

async function initPackages(options) {
  const result = await execa('pnpm', ['i'], {
    cwd: options.targetDirectory,
  });
  if (result.failed) {
    return Promise.reject(new Error('Failed to initialize packages'));
  }
  return;
}

async function initGit(options) {
  const result = await execa('git', ['init'], {
    cwd: options.targetDirectory,
  });
  if (result.failed) {
    return Promise.reject(new Error('Failed to initialize git'));
  }
  return;
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd()
  };


  if (options.compile) {
    compile()
    return
  }

  const templateDir = path.resolve(
    new URL(import.meta.url).pathname,
    '../../../../templates',
    TEMPLATES[options.template]
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error('%s Invalid template name: %s', chalk.red.bold('ERROR'), templateDir);
    process.exit(1);
  }

  const tasks = new Listr([
    {
      title: 'Copy project files',
      task: () => copyTemplateFiles(options),
    },
    {
      title: 'Initialize git',
      task: () => initGit(options),
      enabled: () => options.git,
    },
    {
      title: 'Install dependencies',
      task: () =>
        initPackages(options),
      skip: () =>
        !options.runInstall
          ? 'Pass --install to automatically install dependencies'
          : undefined,
    },
  ]);

  await tasks.run();
  console.log('%s Project ready', chalk.green.bold('DONE'));
  return true;
}
