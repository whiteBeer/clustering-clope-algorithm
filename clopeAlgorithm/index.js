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

        console.log(`Phase 1 finished. Clusters count: ${this.clope.clusters.size}`);
        for (const [id, cluster] of this.clope.clusters) {
            console.log(`Cluster ${id}: ${cluster.getTransactionCount()} transactions`);
        }
    }

    async phase2 () {
        let movedCount = 0;
        let iteration = 0;
        do {
            iteration++;
            movedCount = await this.dao.processTransactions((transaction, currentClusterId) => {
                const currentCluster = this.clope.clusters.get(currentClusterId);
                if (currentCluster) {
                    currentCluster.removeTransaction(transaction);
                }
                const bestCluster = this.clope.getTransactionBestCluster(transaction);
                bestCluster.addTransaction(transaction);

                return bestCluster.getClusterId();
            });
            console.log(`Phase 2. Iteration ${iteration} finished. Moved count: ${movedCount}`);
        } while (movedCount > 0);

        let removedCount = 0;
        for (const [id, cluster] of this.clope.clusters) {
            if (cluster.getTransactionCount() === 0) {
                removedCount++;
                this.clope.deleteCluster(id);
            }
        }

        console.log(`Phase 2. Empty clusters removed: ${removedCount}`);
        console.log(`Phase 2 finished. Clusters count: ${this.clope.clusters.size}`);

        for (const [id, cluster] of this.clope.clusters) {
            console.log(`Cluster ${id}: ${cluster.getTransactionCount()} transactions`);
        }
    }
}

module.exports = ClopePhases;