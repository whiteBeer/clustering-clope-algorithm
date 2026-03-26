const Cluster = require('./cluster');

class ClopeClustersCollection {
    constructor(r = 2.6) {
        this.clusters = new Map();
        this.nextId = 1;
        this.r = r;
    }

    addCluster() {
        const id = (this.nextId++).toString();
        const cluster = new Cluster(id);
        this.clusters.set(id, cluster);
        return cluster;
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

        const deltaNew = transaction.length / Math.pow(transaction.length, this.r);

        if (deltaNew > bestDelta) {
            const result = this.addCluster();
            bestCluster = result;
        }

        return bestCluster;
    }
}

module.exports = ClopeClustersCollection;