/*
* @Author: andrea.jonus
* @Date:   2018-01-24 10:57:19
* @Last Modified by:   Jei
* @Last Modified time: 2018-01-25 12:30:25
*/

console.log("Running tiapp-composer-plugin...");

exports.cliVersion = '>=3.X';
exports.version = '1.0.0';

const projectDir = process.cwd();
const TIAPP_TEMPLATE = projectDir + '/tiapp.tpl';
const OUTFILE = projectDir + '/tiapp.xml';
let tiappEnv = null;

function compose(env, tplfile, outfile) {
  const fs = require('fs');
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
    logger.warn('--tiappenv flag not set, defaulting to "development"');
    tiappenv = "development";
  }

  let tiappCfg = null;

  try {
    tiappCfg = require(projectDir + '/tiapp-cfg');
  } catch(err) {
    logger.warn("Couldn't find a tiapp-cfg.json file:", err);
    logger.warn('Skipping tiapp.xml composing.');
    finished();
    return;
  }

  if (tiappCfg[tiappenv] == null) {
    logger.warn(`Couldn't find the environment "${tiappenv}" in the tiapp-cfg.json file.`);
    logger.warn('Skipping tiapp.xml composing.');
    finished();
    return;
  }

  compose(tiappCfg[tiappenv], TIAPP_TEMPLATE, OUTFILE)
  .then(() => {
    logger.info('Successfully wrote tiapp.xml');
  })
  .catch((err) => {
    logger.warn("Couldn't write the new tiapp.xml file:", err);
    logger.warn('Skipping tiapp.xml composing.');
  })
  .then(() => {
    finished();
  });
}

exports.init = function (logger, config, cli, appc) {
  cli.on("build.config", (build, finished) => checkAndCompose(cli, logger, finished));
  cli.on("clean.config", (build, finished) => checkAndCompose(cli, logger, finished));
};

