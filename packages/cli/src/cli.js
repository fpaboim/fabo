import arg from 'arg';
import inquirer from 'inquirer';
import { createProject } from './main';


function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--compile': Boolean,
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      '-c': '--compile',
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install',
    },
    {
      argv: rawArgs.slice(2),
    }
  );
  return {
    compile: args['--compile'] || false,
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false,
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'Svelte';
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
      choices: ['Svelte', 'Custom'],
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