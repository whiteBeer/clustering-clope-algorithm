class BaseDao {
    constructor () {

    }

    processTransactions (onProcessTransaction) {
        const clusterId = onProcessTransaction();
    }
}

module.exports = BaseDao;