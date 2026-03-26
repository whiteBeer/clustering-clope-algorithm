const fs = require('fs');
const readline = require('readline');
const BaseDao = require('./baseDao');

class FileDao extends BaseDao {
    constructor(_fileName, _fileLineLength, _clusterIdHolder) {
        super();
        this.fileName = _fileName;
        this.clusterIdHolder = _clusterIdHolder;
        this.clusteredLineLength = _fileLineLength + this.clusterIdHolder.length + 1;
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

    async processTransactions(onProcessTransactionCallback) {
        let movedCount = 0;
        const fileWRDescriptor = await fs.promises.open(this.clusteredFileName, 'r+');
        const buffer = Buffer.alloc(this.clusteredLineLength);

        let lineIndex = 0;

        try {
            while (true) {
                const { bytesRead } = await fileWRDescriptor.read(buffer, 0, this.clusteredLineLength);

                if (bytesRead !== this.clusteredLineLength) {
                    break;
                }

                const line = buffer.toString('utf8');

                if (line.at(-1) !== '\n') {
                    throw 'Incorrect input file';
                }

                const transaction = line.trim().split(',');
                const currentClusterInFileId = transaction.pop();
                const edibleSign = transaction.shift();
                const currentClusterId = this.deformatClusterId(currentClusterInFileId);

                const newId = onProcessTransactionCallback(transaction, currentClusterId, edibleSign);
                const newClusterInFileId = this.formatClusterId(newId);

                if (newClusterInFileId !== currentClusterInFileId) {
                    movedCount++;
                    const idWriteOffset = (lineIndex * this.clusteredLineLength) +
                        (this.clusteredLineLength - 1 - this.clusterIdHolder.length);
                    await fileWRDescriptor.write(newClusterInFileId, idWriteOffset, 'utf8');
                }

                lineIndex++;
            }
        } finally {
            await fileWRDescriptor.close();
        }

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