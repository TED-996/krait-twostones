var AuthUtils = (function () {
    function AuthUtils() {
    }
    AuthUtils.getUsername = function () {
        var cookies = document.cookie.split(';').map(function (c) { return c.trim(); });
        var start = "username=";
        for (var _i = 0, cookies_1 = cookies; _i < cookies_1.length; _i++) {
            var cookie = cookies_1[_i];
            if (cookie.substring(0, start.length) == start) {
                return decodeURIComponent(cookie.substring(start.length));
            }
        }
        return null;
    };
    return AuthUtils;
}());
