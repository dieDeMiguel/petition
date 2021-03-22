let tempRows = [];
module.exports = function () {
    return {
        query: () => Promise.resolve({ rows: tempRows }),
    };
};
module.exports.mockRowsOnce = (rows) => (tempRows = rows);
