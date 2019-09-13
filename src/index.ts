import { Command, flags } from '@oclif/command';
import chalk from 'chalk';
import * as fs from 'fs';
import { prompt } from 'inquirer';
import * as path from 'path';

import { CliOptions, generateProject } from './generate-project';

interface IOption {
  title: string;
  description: string;
  value: any;
}

function buildOptions(options: IOption[]): string[] {
  let choices: string[] = []; // strictNullChecks is not working! 😡

  options.forEach(option => {
    const choice = `${chalk.red.bold(option.title + ':')} ${chalk.bold(option.description)}`;
    choices.push(choice);
  });

  return choices;
}

function findOption(options: IOption[], optionStr: string): IOption | undefined {
  return options.find(option => {
    const choice = `${chalk.red.bold(option.title + ':')} ${chalk.bold(option.description)}`;
    return choice === optionStr;
  });
}

function validateFolderName(name: string): boolean {
  return /^([A-Za-z\-\_\d])+$/.test(name);
}

class GreetMe extends Command {
  static description = 'generate project from predefined list of starters';

  static examples = [`gree-me`, `gree-me -p=aaaa -t=node-ts-bare`];

  static flags = {
    // add --version flag to show CLI version
    version: flags.version({ char: 'v' }),
    help: flags.help({ char: 'h' }),
    // flag with a value (-t, --template=VALUE)
    template: flags.string({ char: 't', description: 'tamplate name' }),
    // flag with a value (-p, --project=VALUE)
    project: flags.string({ char: 'p', description: 'project name' }),
    // flag with no value (-f, --force)
    force: flags.boolean({ char: 'f' }),
  };

  static args = [{ name: 'file' }];

  async run() {
    const { flags } = this.parse(GreetMe);

    const options: IOption[] = fs
      .readdirSync(path.join(__dirname, '../templates'))
      .map(name => ({ title: name, description: name, value: name }));

    const choices = [
      {
        type: 'list',
        name: 'temeplate',
        message: 'Choose your starter 🎰',
        when: () => !options.find(o => o.value === flags.template),
        choices: () => buildOptions(options),
      },
      {
        type: 'input',
        name: 'projectName',
        message: 'Enter your project name',
        when: () => !flags.project || !validateFolderName(flags.project),
        validate: (input: string) => {
          if (validateFolderName(input)) return true;
          else return 'Project name may only include letters, numbers, underscores and hashes.';
        },
      },
    ];

    const answers = await prompt(choices);
    const optionStr: string = answers.temeplate as any;
    const projectName: string = answers.projectName ? (answers.projectName as any) : flags.project;
    let option = findOption(options, optionStr);
    if (!option) {
      option = options.find(o => o.value === flags.template);
    }
    const templateName = option ? option.value : null;
    if (templateName && validateFolderName(projectName)) {
      this.log(chalk.bold(`\nDownloading ${templateName} under ${projectName}...\n`));
      this.log(chalk.bold('\nYour Gatsby Starter was downloaded successfully ✨'));
      this.log(chalk.bold('Happy Gatsbying! 😄'));

      const CURR_DIR = process.cwd();
      const templatePath = path.join(__dirname, '../templates', templateName);
      const tartgetPath = path.join(CURR_DIR, projectName);

      const options: CliOptions = {
        projectName,
        templatePath,
        tartgetPath,
      };
      return generateProject(options);
    } else {
      this.warn(chalk.bold('templateName:') + templateName);
      this.warn(chalk.bold('projectName:') + projectName);
      this.log(chalk.red.bold('\n🚨 Error! ') + chalk.bold('The project name should be at least 1 character long!'));
    }
  }
}

export = GreetMe;
