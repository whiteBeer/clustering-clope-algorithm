class Cluster {
    constructor(_clusterId) {
        this.clusterId = _clusterId;
        this.transactionCount = 0;
        this.area = 0;
        this.occ = new Map();
    }

    addTransaction (transaction) {
        this.transactionCount++;
        for (let i = 0; i < transaction.length; i++) {
            const key = transaction[i] + i;
            this.occ.set(key, (this.occ.get(key) || 0) + 1);
            this.area++;
        }
    }

    removeTransaction (transaction) {
        this.transactionCount--;
        for (let i = 0; i < transaction.length; i++) {
            const key = transaction[i] + i;
            const count = this.occ.get(key);
            if (count === 1) {
                this.occ.delete(key);
            } else {
                this.occ.set(key, count - 1);
            }
            this.area--;
        }
    }

    deltaAddTransaction (transaction, r) {
        let areaNew = this.area + transaction.length;
        let widthNew = this.getWidth();

        for (let i = 0; i < transaction.length; i++) {
            const key = transaction[i] + i;
            if (!this.occ.has(key)) {
                widthNew++;
            }
        }

        const newProfit = (areaNew * (this.transactionCount + 1)) / Math.pow(widthNew, r);
        const oldProfit = this.transactionCount === 0 ? 0 : (this.area * this.transactionCount) / Math.pow(this.occ.size, r);

        return newProfit - oldProfit;
    }

    getWidth () {
        return this.occ.size;
    }

    getArea () {
        return this.area;
    }

    getTransactionCount () {
        return this.transactionCount;
    }

    getClusterId () {
        return this.clusterId;
    }
}

module.exports = Cluster;