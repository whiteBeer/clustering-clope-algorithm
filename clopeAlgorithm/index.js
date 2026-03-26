const ClopeClustersCollection = require('./clopeClustersCollection');
const FileSystem = require("../dao/fileSystem");

class ClopePhases {
    constructor(_r, _dao) {
        this.dao = _dao;
        this.clope = new ClopeClustersCollection(_r);
    }

    async phase1 () {
        await this.dao.processTransactions((transaction) => {
            const bestCluster = this.clope.getTransactionBestCluster(transaction);
            bestCluster.addTransaction(transaction);
            return bestCluster.getClusterId();
        });

        console.log(`Phase 1 finished. Clusters created: ${this.clope.clusters.size}`);
    }

    async phase2 () {
        // TODO:
    }
}

module.exports = ClopePhases;