/*
* @Author: andrea.jonus
* @Date:   2018-01-24 10:57:19
* @Last Modified by:   Jei
* @Last Modified time: 2018-02-19 11:33:35
*/

const TAG = 'tiapp-composer';
console.log(`Running ${TAG}...`);

exports.cliVersion = '>=3.X';
exports.version = '1.0.1';

const fs = require('fs');

const projectDir = process.cwd();
const TIAPP_TEMPLATE = projectDir + '/tiapp.tpl';
const TIAPP_FILE = 'tiapp.xml';
const OUTFILE = projectDir + '/' + TIAPP_FILE;
const GIT = projectDir + '/.git';
const GITIGNORE = projectDir + '/.gitignore';
let tiappEnv = null;

function checkTiappTpl(lg) {
  const logger = lg != null ? lg : console;

  return new Promise((resolve, reject) => {
    const exists = fs.existsSync(TIAPP_TEMPLATE);
    if (exists) return resolve();
    reject();
  });
}

function checkGit(lg) {
  const logger = lg != null ? lg : console;

  return new Promise((resolve, reject) => {
    fs.stat(GIT, (err, stats) => {
      if (err) {
        if (err.code != "ENOENT") {
          logger.warn(`${TAG}: Couldn't access .git directory:`, err);
        }

        reject();
        return;
      }

      if (stats.isDirectory()) {
        resolve(logger);
      } else {
        reject();
      }
    });
  });
}

function checkGitIgnore(lg) {
  const logger = lg != null ? lg : console;
  const readline = require('readline');

  let found = false;

  const lineReader = require('readline').createInterface({
    input: fs.createReadStream(GITIGNORE),
  });

  lineReader.on('line', (line) => {
    const trimmed = line.trim();
    if (trimmed == TIAPP_FILE || trimmed == ('/' + TIAPP_FILE)) {
      found = true;

      lineReader.close();
    }
  });

  lineReader.on('close', () => {
    if (!found) {
      logger.warn(`${TAG}: This plugin will overwrite your tiapp. You should add "${TIAPP_FILE}" to your .gitignore`);
    }
  });
}

function compose(env, tplfile, outfile) {
  const { app } = env;

  return new Promise((resolve, reject) => {
    fs.readFile(tplfile, (err, tpl) => {
      if (err) {
        reject(err);
        return;
      }

      const composed = eval('`' + tpl + '`');

      fs.writeFile(outfile, composed, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      })
    });
  });
}

function checkAndCompose(cli, logger, finished) {
  let { tiappenv } = cli.globalContext.argv;

  if (tiappenv == null) {
    logger.warn(`${TAG}: --tiappenv flag not set, defaulting to "development"`);
    tiappenv = "development";
  }

  let tiappCfg = null;

  try {
    tiappCfg = require(projectDir + '/tiapp-cfg');
  } catch(err) {
    logger.warn(`${TAG}: Couldn't find a tiapp-cfg.json file:`, err);
    logger.warn(`${TAG}: Skipping tiapp.xml composing.`);
    finished();
    return;
  }

  if (tiappCfg[tiappenv] == null) {
    logger.warn(`${TAG}: Couldn't find the environment "${tiappenv}" in the tiapp-cfg.json file.`);
    logger.warn(`${TAG} Skipping tiapp.xml composing.`);
    finished();
    return;
  }

  compose(tiappCfg[tiappenv], TIAPP_TEMPLATE, OUTFILE)
  .then(() => {
    logger.info(`${TAG}: Successfully wrote tiapp.xml`);
  })
  .catch((err) => {
    logger.warn(`${TAG}: Couldn't write the new tiapp.xml file:`, err);
    logger.warn(`${TAG}: Skipping tiapp.xml composing.`);
  })
  .then(() => {
    finished();
  });
}

function runHook(cli, logger, finished) {
  checkTiappTpl(logger)
  .then(() => {
    checkGit(logger)
    .then(checkGitIgnore)
    .catch(() => {
      logger.log(`${TAG}: Git not detected.`);
    });

    checkAndCompose(cli, logger, finished);
  })
  .catch(() => {
      logger.warn(`${TAG}: Template file not found. This should be fine only if you don't want to use tiappp-composer in this project.`);
  });
}

exports.init = function (logger, config, cli, appc) {
  cli.on("build.config", (build, finished) => runHook(cli, logger, finished));
  cli.on("clean.config", (build, finished) => runHook(cli, logger, finished));
};
