var classes = [
    "opt-image-render",
    "img-mmax-100",
    "sej-widget-box"
]


var ids = [
    "[id*='SEJ_300x250_Sidebar0-cont']",
    "[id*='SEJ_300x250_UnderPost_4_i']",
    "[id*='SEJ_300x250_Sidebar1-cont']",
    "[id*='LB-MULTI_ATF']",
    "[id*='RR-MULTI_ATF']",
]


function detectAds() {
    var objects = []
    var curObjects, parent, parentDiv;
    for (i = 0; i < classes.length; i++) {
        curObjects = document.getElementsByClassName(classes[i]);
        for (j = 0; j < curObjects.length; j++) {
            if (curObjects[j] == null) {
                continue
            }
            if (classes[i] == "opt-image-render") {
                if (curObjects[j].alt == "Join Now") {
                    parent = curObjects[j].parentElement;
                    if (parent != null) {
                        parent.removeAttribute("href")
                    }
                    objects.push(curObjects[j])
                }
            } else {
                objects.push(curObjects[j])
            }
        }
    }

    for (i = 0; i < ids.length; i++) {
        curObjects = document.querySelector(ids[i]);
        console.log(curObjects)
        if (curObjects != null) {
            if (ids[i] == "[id*='LB-MULTI_ATF']" || ids[i] == "[id*='RR-MULTI_ATF']") {
                objects.push(curObjects.children[0])
            } else {
                objects.push(curObjects)
            }
           
        }
    }
    return objects;
}
var loaded = false
/*
var objects = detectAds();
console.log("Following objects were found:");
console.log(objects);


for (i = 0; i < objects.length; i++) {
    console.log(objects[i])
    if (objects[i] instanceof HTMLImageElement) {
        objects[i].srcset = ""
        objects[i].src = "https://pbs.twimg.com/profile_images/1088495204712079360/XxY6ikRT_400x400.jpg"
    } else if (objects[i] instanceof HTMLDivElement) {
        objects[i].innerHTML = "ADVERTISEMENT"
    }
}
*/