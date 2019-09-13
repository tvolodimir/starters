import chalk from 'chalk';
import {render as ejsRender} from 'ejs';
import * as fs from 'fs';
import * as path from 'path';

interface ITemplateData {
  projectName: string
}

function render(content: string, data: ITemplateData) {
  return ejsRender(content, data)
}

export interface CliOptions {
  projectName: string;
  templatePath: string;
  tartgetPath: string;
}

export function generateProject(options: CliOptions) {
  if (!createProject(options.tartgetPath)) {
    return;
  }

  createDirectoryContents(options.templatePath, options.tartgetPath, {
    projectName: options.projectName
  });

  console.log('');
  console.log(chalk.green('Done.'));
  console.log(chalk.green(`Go into the project: cd ${options.projectName}`));
}

const SKIP_FILES = ['node_modules', '.template.json'];

function createProject(projectPath: string) {
  if (fs.existsSync(projectPath)) {
    console.log(
      chalk.red(`Folder ${projectPath} exists. Delete or use another name.`)
    );
    return false;
  }

  fs.mkdirSync(projectPath);
  return true;
}

function createDirectoryContents(
  templatePath: string,
  targetPath: string,
  data: ITemplateData
) {
  const filesToCreate = fs.readdirSync(templatePath);

  filesToCreate.forEach(file => {
    const origFilePath = path.join(templatePath, file);

    // get stats about the current file
    const stats = fs.statSync(origFilePath);

    if (SKIP_FILES.indexOf(file) > -1) return;

    if (stats.isFile()) {
      let contents = fs.readFileSync(origFilePath, 'utf8');

      contents = render(contents, data);

      const writePath = path.join(targetPath, file);
      fs.writeFileSync(writePath, contents, 'utf8');
    } else if (stats.isDirectory()) {
      fs.mkdirSync(path.join(targetPath, file));

      // recursive call
      createDirectoryContents(
        path.join(templatePath, file),
        path.join(targetPath, file),
        data
      );
    }
  });
}
