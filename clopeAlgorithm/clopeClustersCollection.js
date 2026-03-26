const Cluster = require('./cluster');

class ClopeClustersCollection {
    constructor(r = 2.6) {
        this.clusters = [];
        this.r = r;
    }

    addCluster() {
        const cluster = new Cluster();
        this.clusters.push(cluster);
        return cluster;
    }

    getTransactionCluster(transaction) {
        let bestDelta = -Infinity;
        let bestCluster = null;

        for (const cluster of this.clusters) {
            const delta = cluster.deltaAddTransaction(transaction, this.r);
            if (delta > bestDelta) {
                bestDelta = delta;
                bestCluster = cluster;
            }
        }

        const deltaNew = transaction.length / Math.pow(transaction.length, this.r);
        if (deltaNew > bestDelta) {
            bestCluster = this.addCluster();
        }

        return bestCluster;
    }
}

module.exports = ClopeClustersCollection;