import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main.js';


function parseArgumentsIntoOptions(rawArgs) {
  const args = arg({
    '--compile': Boolean,
    '--git': Boolean,
    '--yes': Boolean,
    '--install': Boolean,
    '--init':    String,
    '--template':    String,
    '-c': '--compile',
    '-g': '--git',
    '-y': '--yes',
    '-tpl': '--template',
    '-i': '--install'
  });

  return {
    compile: args['--compile'] || false,
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    init: args['--init'] || false,
    template: args['--template'] || false,
    targetDirectory: args._[1] || false,
    runInstall: args['--install'] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'Barebones';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
    };
  }

  const questions = [];
  if (!options.template && !options.compile) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which project template to use',
      choices: ['Barebones', 'Svelte'],
      default: defaultTemplate,
    });
  }

  if (!options.git && !options.compile) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Initialize a git repository?',
      default: false,
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createProject(options);
}
