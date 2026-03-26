const FileDao = require('./dao/fileDao');
const Clope = require('./clopeAlgorithm');

const r = 2.6;
const inputFile = './agaricus-lepiota.data';
const clusterIdHolder = 'XXXXX';

async function main () {
    const dao = new FileDao(inputFile, clusterIdHolder);
    await dao.init();
    const clope = new Clope(r, dao);

    await clope.phase1();
    await clope.phase2();
}

main().catch(error => {
    console.error('Fatal Error:', error);
});
