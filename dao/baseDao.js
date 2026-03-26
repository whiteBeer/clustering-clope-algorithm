class BaseDao {
    constructor () {

    }

    // extended classes should override this method
    processTransactions (onProcessTransaction) {
        const clusterId = onProcessTransaction();
    }
}

module.exports = BaseDao;