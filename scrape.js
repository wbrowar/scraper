const request = require('sync-request');
const fs = require('fs-extra');
const argv = parseArgv().argv;
const options = parseArgv().options;
const verbose = options.verbose || false;

// Load a list of pages in a JSON file in `./content/`,
// scrape the source code and put each page in `./results/`
// Args:
// name (required) – file name of JSON file
// ext – change extension of output files
// verbose – display logging info in the console
// Usage: npm run scrape -- --name=test --ext=json --verbose

async function run() {
  log('Running scraper with options:');
  log(options);

  if (options.name) {
    if (fs.existsSync(`./content/${options.name}.json`)) {
      const pages = require(`./content/${options.name}.json`);
      log(`OUTPUT ----------------------------------------------------------`);

      pages.forEach((page) => {
        if (page.dest && page.url) {
          log(`Getting: ${page.url}`);
          const results = request('GET', page.url);
          if (results.statusCode === 200) {
            const dest = `results/${page.dest}.${options.ext || 'html'}`;
            fs.outputFileSync(dest, results.getBody());
            log(`Wrote file: ${dest}`);
          }
        }
      });
    }
  }
}

// UTILITIES
function log(text) {
  if (verbose) {
    console.log(text);
  }
}

function parseArgv() {
  let args = [];
  let options = {};

  process.argv.forEach(function(arg, i) {
    if (i > 1) {
      if (arg.substr(0, 2) === '--') {
        // remove leading dashes
        const str = arg.substr(2);

        // split out to key/value pairs
        if (str.indexOf('=') !== -1) {
          const strSplit = str.split('=');
          options[strSplit[0]] = strSplit[1];
        } else {
          options[str] = true;
        }
      } else {
        args.push(arg);
      }
    }
  });

  return {
    args: args,
    options: options,
  };
};

// INIT
run();