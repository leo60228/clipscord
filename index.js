const robotjs = require('robotjs');
const iohook = require('iohook');
const clipboardy = require('clipboardy');
const sleep = require('sleep-promise');
const util = require('util');
const child_process = require('child_process');
const exists = require('file-exists-promise');
const fs = require('fs');

const spawn = (cmd, args) => new Promise((resolve, reject) => {
  const proc = child_process.spawn(cmd, args, {stdio: 'inherit'});

  proc.on('close', code => {
    if (code > 0) {reject(code)} else resolve();
  });
});

let typing = false;
let useScissors = true;
let scissors = '\u2702'

async function notify(notification) {
  await spawn('notify-send', ['-t', '2000', '-i', 'error', '-c', 'error', '--', notification]);
}

async function copyFile(file, type) {
  const args = ['-i', '-selection', 'clipboard', '-target', type || 'application/octet-stream', file];
  console.log(`copying file using args ${args.map(e => `'${e}'`).join(' ')}`);
  await spawn('xclip', args);
  console.log(`copied file: ${file}`);
}

async function printString(str, enter) {
  const old = await clipboardy.read();
  if (typeof str !== 'string') return false;
  await clipboardy.write(str);
  await sleep(150); // clipboard takes a moment to update
  robotjs.keyTap('v', 'control');
  await clipboardy.write(old);
  if (enter) robotjs.keyTap('enter');
}

async function printScissors() {
  if (useScissors) {
    console.log(`Printing ${scissors}`);
    await printString(scissors);
  }
}

async function startTyping() {
  if (!typing) {
    console.log('Starting...');
    robotjs.keyTap('a', 'control');
    robotjs.keyTap('backspace');

    typing = true;

    await printScissors();
  } else {
    typing = false;
    console.log('Reading...');
    const old = await clipboardy.read();
    robotjs.keyTap('a', 'control');
    robotjs.keyTap('x', 'control');
    let str = await clipboardy.read();
    str = useScissors ? str.replace(scissors, '') : str;
    let png = `${__dirname}/cmds/${str}.png`;
    try {
      await exists(png);
    } catch (e) {
      png = false;
    }
    let txt = `${__dirname}/cmds/${str}.txt`;
    try {
      await exists(txt);
    } catch (e) {
      txt = false;
    }
    if (!(png || txt)) {
      await notify('Invalid command.');
      return;
    }
    if (png) {
      await copyFile(png, 'image/png');
      await sleep(100);
      robotjs.keyTap('v', 'control');
      await sleep(500);
    }
    if (txt) {
      let text = await util.promisify(fs.readFile)(txt, 'utf8');
      await printString(text);
    }
    robotjs.keyTap('enter');
    await clipboardy.write(old);
  }
}

iohook.registerShortcut([0x58], startTyping);

iohook.start();
