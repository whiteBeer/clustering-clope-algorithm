const Cluster = require('./cluster');

class ClopeClustersCollection {
    constructor(r = 2.6) {
        this.clusters = new Map();
        this.nextId = 1;
        this.r = r;
    }

    addCluster () {
        const id = (this.nextId++).toString();
        const cluster = new Cluster(id);
        this.clusters.set(id, cluster);
        return cluster;
    }

    deleteCluster (clusterId) {
        this.clusters.delete(clusterId);
    }

    getTransactionBestCluster(transaction) {
        let bestDelta = -Infinity;
        let bestCluster = null;

        for (const [id, cluster] of this.clusters) {
            const delta = cluster.deltaAddTransaction(transaction, this.r);
            if (delta > bestDelta) {
                bestDelta = delta;
                bestCluster = cluster;
            }
        }

        const transactionLength = transaction.filter(it => it !== '?').length;
        const deltaNew = transactionLength / Math.pow(transactionLength, this.r);

        if (deltaNew > bestDelta) {
            bestCluster = this.addCluster();
        }

        return bestCluster;
    }
}

module.exports = ClopeClustersCollection;