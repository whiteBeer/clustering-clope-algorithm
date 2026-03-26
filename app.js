const FileDao = require('./dao/fileDao');
const Clope = require('./clopeAlgorithm');

let r = 2.6;
let fileInput = './agaricus-lepiota.data';
let fileLineLength = 46;
const fileClusterIdHolder = 'XXXXX';

const args = process.argv.slice(2);
if (args[0]) fileInput = args[0];
if (args[1]) fileLineLength = parseInt(args[1], 10);
if (args[2]) r = parseFloat(args[2]);

async function main () {
    const dao = new FileDao(fileInput, fileLineLength, fileClusterIdHolder);
    await dao.init();
    const clope = new Clope(r, dao);

    await clope.phase1();
    await clope.phase2();
}

main().catch(error => {
    console.error('Error:', error);
});
