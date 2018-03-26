/*
* @Author: andrea.jonus
* @Date:   2018-01-24 10:57:19
* @Last Modified by:   Andrea Jonus
* @Last Modified time: 2018-02-22 10:17:01
*/

const TAG = "tiapp-composer";
console.log(`Running ${TAG}...`);

exports.cliVersion = ">=3.X";
exports.version = "1.0.1";

const fs = require("fs");

const projectDir = process.cwd();
const TIAPP_TEMPLATE = projectDir + "/tiapp.tpl";
const CONFIG_TEMPLATE = projectDir + "/config.tpl";
const TIAPP_FILE = "tiapp.xml";
const CONFIG_FILE = "config.json";
const TIAPP_OUTFILE = projectDir + "/" + TIAPP_FILE;
const CONFIG_OUTFILE = projectDir + "/" + CONFIG_FILE;
const GIT = projectDir + "/.git";
const GITIGNORE = projectDir + "/.gitignore";
let tiappEnv = null;

function checkTiappTpl(lg) {
  const logger = lg != null ? lg : console;

  return new Promise((resolve, reject) => {
    const exists = fs.existsSync(TIAPP_TEMPLATE);
    if (exists) return resolve();
    reject();
  });
}

function checkConfigTpl(lg) {
  const logger = lg != null ? lg : console;

  return new Promise((resolve, reject) => {
    const exists = fs.existsSync(CONFIG_TEMPLATE);
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
  const readline = require("readline");

  let found = false;

  const lineReader = require("readline").createInterface({
    input: fs.createReadStream(GITIGNORE)
  });

  lineReader.on("line", line => {
    const trimmed = line.trim();
    if (trimmed == TIAPP_FILE || trimmed == "/" + TIAPP_FILE) {
      found = true;

      lineReader.close();
    }
  });

  lineReader.on("close", () => {
    if (!found) {
      logger.warn(
        `${TAG}: This plugin will overwrite your tiapp. You should add "${TIAPP_FILE}" to your .gitignore`
      );
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

      const composed = eval("`" + tpl + "`");

      fs.writeFile(outfile, composed, err => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  });
}

function checkAndComposeTiapp(cli, logger) {
  let { tiappenv } = cli.globalContext.argv;

  if (tiappenv == null) {
    logger.warn(`${TAG}: --tiappenv flag not set, defaulting to "development"`);
    tiappenv = "development";
  }

  let tiappCfg = null;

  try {
    tiappCfg = require(projectDir + "/tiapp-cfg");
  } catch (err) {
    logger.warn(`${TAG}: Couldn't find a tiapp-cfg.json file:`, err);
    logger.warn(`${TAG}: Skipping tiapp.xml composing.`);
    return Promise.resolve();
  }

  if (tiappCfg[tiappenv] == null) {
    logger.warn(
      `${TAG}: Couldn't find the environment "${tiappenv}" in the tiapp-cfg.json file.`
    );
    logger.warn(`${TAG} Skipping tiapp.xml composing.`);
    return Promise.resolve();
  }

  compose(tiappCfg[tiappenv], TIAPP_TEMPLATE, TIAPP_OUTFILE)
    .then(() => {
      logger.info(`${TAG}: Successfully wrote tiapp.xml`);
    })
    .catch(err => {
      logger.warn(`${TAG}: Couldn't write the new tiapp.xml file:`, err);
      logger.warn(`${TAG}: Skipping tiapp.xml composing.`);
    });
}

function checkAndComposeConfig(cli, logger) {
  let { tiappenv } = cli.globalContext.argv;

  if (tiappenv == null) {
    logger.warn(`${TAG}: --tiappenv flag not set, defaulting to "development"`);
    tiappenv = "development";
  }

  let configCfg = null;

  try {
    configCfg = require(projectDir + "/config-cfg");
  } catch (err) {
    logger.warn(`${TAG}: Couldn't find a config-cfg.json file:`, err);
    logger.warn(`${TAG}: Skipping config.json composing.`);
    return Promise.resolve();
  }

  if (configCfg[tiappenv] == null) {
    logger.warn(
      `${TAG}: Couldn't find the environment "${tiappenv}" in the config-cfg.json file.`
    );
    logger.warn(`${TAG} Skipping config.json composing.`);
    return Promise.resolve();
  }

  return compose(configCfg[tiappenv], CONFIG_TEMPLATE, CONFIG_OUTFILE)
    .then(() => {
      logger.info(`${TAG}: Successfully wrote config.json`);
    })
    .catch(err => {
      logger.warn(`${TAG}: Couldn't write the new config.json file:`, err);
      logger.warn(`${TAG}: Skipping config.json composing.`);
    });
}

function runHook(cli, logger, finished) {
  Promise.all([
    checkTiappTpl(logger)
      .then(() => {
        checkGit(logger)
          .then(checkGitIgnore)
          .catch(() => {
            logger.log(`${TAG}: Git not detected.`);
          });

        return checkAndComposeTiapp(cli, logger);
      })
      .catch(() => {
        logger.warn(
          `${TAG}: tiapp.tpl file not found. This should be fine only if you don't want to use tiapp-composer in this project.`
        );
      }),
    checkConfigTpl(logger)
      .then(() => {
        checkGit(logger)
          .then(checkGitIgnore)
          .catch(() => {
            logger.log(`${TAG}: Git not detected.`);
          });

        return checkAndComposeConfig(cli, logger);
      })
      .catch(() => {
        logger.warn(
          `${TAG}: config.tpl file not found. This should be fine only if you don't want to use tiapp-composer in this project.`
        );
      })
  ]).finally(() => {
    finished();
  });
}

exports.init = function(logger, config, cli, appc) {
  cli.on("build.config", (build, finished) => runHook(cli, logger, finished));
  cli.on("clean.config", (build, finished) => runHook(cli, logger, finished));
};
