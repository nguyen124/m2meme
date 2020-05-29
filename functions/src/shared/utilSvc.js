(function () {
    function getPageNo(page, defaultValue) {
        if (page && !isNaN(page)) {
            if (page <= 100) {
                return Number(page);
            }
        }
        return defaultValue;
    }

    module.exports = {
        getPageNo: getPageNo
    };
}());