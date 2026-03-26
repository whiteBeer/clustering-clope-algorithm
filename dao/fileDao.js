const fs = require('fs');
const readline = require('readline');
const BaseDao = require('./baseDao');

class FileDao extends BaseDao {
    constructor(_fileName, _clusterIdHolder) {
        super();
        this.fileName = _fileName;
        this.clusterIdHolder = _clusterIdHolder;
    }

    async init() {
        this.clusteredFileName = await this.prepareData();
    }

    formatClusterId(id) {
        return id.toString().padStart(this.clusterIdHolder.length, '0');
    }

    deformatClusterId(formatedId) {
        return formatedId === this.clusterIdHolder ? null : parseInt(formatedId, 10).toString();
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
            const currentClusterInFileId = transaction.pop();
            const currentClusterId = this.deformatClusterId(currentClusterInFileId);
            // do not use edible sign in transaction
            const edibleSign = transaction.shift();
            const newClusterInFileId = this.formatClusterId(
                onProcessTransactionCallback(transaction, currentClusterId, edibleSign)
            );

            if (newClusterInFileId !== currentClusterInFileId) {
                movedCount++;
            }

            writeStream.write(`${edibleSign},${transaction.join(',')},${newClusterInFileId}\n`);
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
            writeStream.write(`${transaction.join(',')},${this.clusterIdHolder}\n`);
        }
        return clusteredDataFileName;
    }
}

module.exports = FileDao;