function findJSON(obj, key, val, brek) {
    var objects = [];
    for (var i in obj) {
        if (!obj.hasOwnProperty(i)) continue;
        if (typeof obj[i] == 'object') {
            objects = objects.concat(findJSON(obj[i], key, val));
        } else if (i == key && obj[key] == val) {

            objects.push(obj);
            if (brek !== undefined) {
                break;
            }

        }
    }
    return objects;
}