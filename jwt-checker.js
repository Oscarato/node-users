exports.payload = (token) => {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace('-', '+').replace('_', '/');
    var converted = Buffer.from(base64, 'base64').toString();
    return JSON.parse(converted);
}