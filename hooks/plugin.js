/*
* @Author: andrea.jonus
* @Date:   2018-01-24 10:57:19
* @Last Modified by:   andrea.jonus
* @Last Modified time: 2018-01-24 11:37:07
*/

console.log("Running tiapp-composer-plugin...");

exports.cliVersion = '>=3.X';

let projectDir = null;
const TIAPP_TEMPLATE = 'tiapp.tpl';
const OUTFILE = 'tiapp.xml';

async function compose(env, tplfile, outfile) {
  if (!env) throw new Error('Missing environment');
  const { app } = env;

  const tpl = await fs.readFile(tplfile);
  const composed = eval('`' + tpl + '`');

  return fs.writeFile(outfile, composed);
}

exports.init = function (logger, config, cli, appc) {
  const fs = require('fs');
  const tiappCfg = require('tiapp-cfg');

  cli.on("build.pre.construct", function (build, finished) {
    projectDir = build.projectDir;

    // TODO

    finished();
  });
};

