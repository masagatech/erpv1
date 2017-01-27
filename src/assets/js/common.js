var commonfun = {};

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

commonfun.addrequire = function addrequire() {
    $("[validate]").each(function () {
        $(this).siblings("label").remove("span").append("&nbsp;<span class='require'>*</span>");
    });
}

commonfun.validate = function validate() {
    var valisValid = true;
    var result = [];
    var msglist = "";
    $("[validate]").each(function () {
        if ($(this).is("input") || $(this).is("textarea")) {
            if ($(this).val().trim() === "") {
                valisValid = false;
                msglist += $(this).siblings("label").text() + " is required. ";
                result.push({ "input": $(this), "label": $(this).siblings("label").text() });
            }
        } else if ($(this).is("select")) {
            if ($(this).val().trim() === $(this).attr("validate")) {
                valisValid = false;
                msglist += $(this).siblings("label").text() + " is required. ";
                result.push({ "input": $(this), "label": $(this).siblings("label").text() });
            }
        }
    });

    return { "status": valisValid, "data": result, "msglist": msglist };
}