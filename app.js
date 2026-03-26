const fs = require('fs');
const readline = require('readline');
const FileSystem = require('./dao/fileSystem');
const Clope = require('./clopeAlgorithm');

const r = 2.6;
const inputFile = 'agaricus-lepiota.data';

async function main () {
    const dao = new FileSystem(inputFile);
    await dao.init();
    const clope = new Clope(r, dao);

    await clope.phase1();
    // await clope.phase2();
}

main().catch(error => {
    console.error('Fatal Error:', error);
});
