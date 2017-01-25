var commonfun ={};

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
    $("[validate='']").each(function () {
        $(this).siblings("label").remove("span").append("<span class='require'>*</span>");

    });
}

commonfun.validate = function validate() {
    var valisValid = true;
    var result = [];
    var msglist = "";
    $("[validate='']").each(function () {
        if ($(this).val().trim() === "") {
            valisValid = false;
            msglist += $(this).siblings("label").text() + "  "
            result.push({ "input": $(this), "lable": $(this).siblings("label").text() });
        }
    });
    return { "status": valisValid, "data": result, "msglist":  msglist  };
}