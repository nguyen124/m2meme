(function () {
    function getPageNo(page, defaultValue) {
        if (page && !isNaN(page)) {
            return Number(page);
        }
        return defaultValue;
    }

    module.exports = {
        getPageNo: getPageNo
    };
}());