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
const COMPOSABLE_FILES = ["tiapp.xml", "app/config.json"];
const GIT = projectDir + "/.git";
const GITIGNORE = projectDir + "/.gitignore";

let tiappEnv = null;

function checkTemplate(tplname) {
  const exists = fs.existsSync(`${projectDir}/${tplname}`);
  if (exists) return Promise.resolve();

  return Promise.reject();
}

function checkGit(lg) {
  const logger = lg != null ? lg : console;

  return new Promise((resolve, reject) => {
    fs.stat(GIT, (err, stats) => {
      if (err) {
        if (err.code != "ENOENT") {
          logger.trace(`${TAG}: Couldn't access .git directory:`, err);
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

function checkGitIgnore(filename, lg) {
  const logger = lg != null ? lg : console;
  const readline = require("readline");

  let found = false;

  const lineReader = require("readline").createInterface({
    input: fs.createReadStream(GITIGNORE)
  });

  lineReader.on("line", line => {
    const trimmed = line.trim();
    if (trimmed == filename || trimmed == "/" + filename) {
      found = true;

      lineReader.close();
    }
  });

  lineReader.on("close", () => {
    if (!found) {
      logger.warn(
        `${TAG}: This plugin will overwrite your tiapp. You should add "${filename}" or "/${filename}" to your .gitignore`
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

function checkAndCompose(filename, argv = {}, logger) {
  const name = filename.replace(/\.[^\/.]+$/, "");
  const { tiappenv, tiappenvcopyto } = argv;
  let config = null;

  if (tiappenv == null) {
    logger.warn(`${TAG}: --tiappenv flag not set, defaulting to "development"`);
    tiappenv = "development";
  }

  try {
    config = require(`${projectDir}/${name}-cfg.json`);
  } catch (err) {
    logger.warn(`${TAG}: Couldn't find a ${name}-cfg.json file:`, err);
    logger.warn(`${TAG}: Skipping ${filename} composing.`);
    return Promise.resolve();
  }

  if (config[tiappenv] == null) {
    logger.warn(
      `${TAG}: Couldn't find the environment "${tiappenv}" in the ${name}-cfg.json file.`
    );
    logger.warn(`${TAG} Skipping ${filename} composing.`);
    return Promise.resolve();
  }

  return compose(
    config[tiappenv],
    `${projectDir}/${name}.tpl`,
    `${projectDir}/${filename}`
  )
    .then(() => {
      logger.info(`${TAG}: Successfully wrote ${filename}`);
      if (tiappenvcopyto) copyConfigToDir(name, tiappenvcopyto, logger);
    })
    .catch(err => {
      logger.warn(`${TAG}: Couldn't write the new ${filename} file:`, err);
      logger.warn(`${TAG}: Skipping ${filename} composing.`);
    });
}

function copyConfigToDir(name, tiappenvcopyto, logger) {
  const copyPath = tiappenvcopyto.replace(/^\/|\/$/g, '');

  fs.exists(copyPath, exists => {
    if (!exists) return logger.warn(`${TAG}: Copying file to directory "${tiappenvcopyto}", failed. Directory doesn't exists`);
    const namePathParts = name.split(/\//);
    const clearName = namePathParts[namePathParts.length - 1];

    const directoryCopyTo = `${projectDir}/${copyPath}/${clearName}-cfg.json`;
    fs.copyFile(`${projectDir}/${name}-cfg.json`, directoryCopyTo, err => {
      if (err) return logger.warn(`${TAG}: Copying file "${name}-cfg.json", failed: ${err}`);
      logger.warn(`${TAG}: Copying file "${name}-cfg.json", was successful. Directory of file "${directoryCopyTo}"`);
    });
  });
}

function runHook(cli, logger, finished) {
  const { tiappenv, tiappenvcopyto } = cli.globalContext.argv;

  Promise.all(
    COMPOSABLE_FILES.map(filename => {
      const name = filename.replace(/\.[^\/.]+$/, "");

      return checkTemplate(name + ".tpl")
        .then(() => {
          checkGit(logger)
            .then(() => checkGitIgnore(filename, logger))
            .catch(() => {
              logger.trace(`${TAG}: Git not detected.`);
            });

          return checkAndCompose(filename, {tiappenv, tiappenvcopyto}, logger);
        })
        .catch(() => {
          logger.trace(
            `${TAG}: ${name}.tpl file not found. This should be fine only if you don't want to use tiapp-composer in this project.`
          );
        });
    })
  )
    .then(() => {
      finished();
    })
    .catch(() => {
      finished();
    });
}

exports.init = function(logger, config, cli, appc) {
  cli.on("build.config", (build, finished) => runHook(cli, logger, finished));
  cli.on("clean.config", (build, finished) => runHook(cli, logger, finished));
};
