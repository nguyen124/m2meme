(function () {
    const DOWNVOTED = -1;
    const NO_VOTE = 0;
    const UPVOTED = 1;

    const COMMENTED = 2;

    const REPORTED = 3;
    const UNREPORTED = -3;

    module.exports = {
        DOWNVOTED: DOWNVOTED,
        NO_VOTE: NO_VOTE,
        UPVOTED: UPVOTED,
        COMMENTED: COMMENTED,
        REPORTED: REPORTED,
        UNREPORTED: UNREPORTED
    };
}());