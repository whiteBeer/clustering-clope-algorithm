const fs = require('fs');
const readline = require('readline');
const BaseDao = require('./baseDao');

class FileSystem extends BaseDao {
    constructor(_fileName) {
        super();
        this.fileName = _fileName;
    }

    async init() {
        this.clusteredFileName = await this.prepareData();
    }

    formatClusterId(id) {
        return id.toString().padStart(5, '0');
    }

    async processTransactions (onProcessTransactionCallback) {
        let movedCount = 0;
        const tmpFile = this.clusteredFileName + '.tmp';
        const readStream = fs.createReadStream(this.clusteredFileName);
        const writeStream = fs.createWriteStream(tmpFile);
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });

        for await (const line of rl) {
            const transaction = line.trim().split(',');
            const currentClusterId = transaction.pop();
            const edibleSign = transaction.shift();
            const newClusterId = this.formatClusterId(
                onProcessTransactionCallback(transaction, parseInt(currentClusterId, 10).toString(), edibleSign)
            );

            if (newClusterId !== currentClusterId) {
                movedCount++;
            }

            writeStream.write(`${edibleSign},${transaction.join(',')},${newClusterId}\n`);
        }

        await fs.promises.unlink(this.clusteredFileName);
        await fs.promises.rename(tmpFile, this.clusteredFileName);

        return movedCount;
    }

    async prepareData () {
        const readStream = fs.createReadStream(this.fileName);
        const clusteredDataFileName = this.fileName + '.cluster';
        const writeStream = fs.createWriteStream(clusteredDataFileName);
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        });
        for await (const line of rl) {
            const trimmed = line.trim();
            if (trimmed === '') {
                continue;
            }
            const transaction = trimmed.split(',');
            // with cluster id holder - XXXXX
            writeStream.write(`${transaction.join(',')},XXXXX\n`);
        }
        return clusteredDataFileName;
    }
}

module.exports = FileSystem;