class AuthUtils {
    static getUsername() {
        let cookies = document.cookie.split(';').map(c => c.trim());
        let start = "username=";
        for (let cookie of cookies) {
            if (cookie.substring(0, start.length) == start){
                return decodeURIComponent(cookie.substring(start.length));
            }
        }
        return null;
    }
}