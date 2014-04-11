// utils.js

/*
 * Worthless words to eliminate during 
 * the process of generation of keywords
 * TODO: improve this list
 */
exports.worthlesswords = [
    'le', 'la', 'au', 'du', 'un', 'une', 'de', 'les', 'aux', 'des',
    'et', 'ou', 'où', 'donc', 'mais', 'ni', 'car', 'parceque', 'comme',
    'or', 'ni', 'quand', 'si', 'lorsque', 'quoique', 'puisque',
    'que', 'quel', 'quelle', 'auquelle', 'auxquelles', 'duquelle', 'desquelles',
    'alors', 'afin', 'tandis', 'sans', 'avec', 'autant', 'aussi', 'tel', 'autre',
    'moins', 'plus', 'à', 'selon', 'suivant', 'ici', 'depuis', 'chaque',
    'ses', 'leur', 'son', 'sa', 'ma', 'mon', 'mes', 'leurs',
    'quelque', 'quelques', 'certain', 'certains',
    'suis', 'est', 'somme', 'etes',
    'je', 'me', 'tu', 'te', 'il', 'lui', 'elle', 'vous', 'nous',
    'c\'est',
    'the', 'be', 'of', 'and', 'a', 'to', 'in', 'he', 'have', 'it', 'that', 'for', 'they', 'I', 'with', 'as', 'not', 'on', 'she', 'at', 'by', 'this', 'we', 'you', 'do', 'but', 'from', 'or', 'which', 'one', 'would', 'all', 'will', 'there', 'say', 'who', 'make', 'when', 'can', 'more', 'if', 'no', 'man', 'out', 'other', 'so', 'what', 'up', 'go', 'about', 'than', 'into', 'could', 'state', 'only', 'new', 'year', 'some', 'take', 'come', 'these', 'use', 'get', 'like', 'then', 'first', 'any', 'work', 'now', 'may', 'such', 'give', 'over', 'think', 'most', 'even', 'find', 'day', 'also', 'after', 'way', 'many', 'must', 'look', 'before', 'great', 'through', 'long', 'where', 'much', 'should', 'well', 'people', 'down', 'own', 'just', 'because', 'good', 'each', 'those', 'feel', 'seem', 'how', 'high', 'too', 'little', 'world', 'very', 'still', 'old', 'tell', 'become', 'here', 'show', 'both', 'between', 'need', 'under', 'last', 'right', 'move', 'thing', 'general', 'never', 'same', 'another', 'begin', 'while', 'number', 'part', 'turn', 'real', 'leave', 'might', 'want', 'point', 'form', 'off', 'few', 'small', 'since', 'against', 'ask', 'late', 'large', 'end', 'open', 'follow', 'during', 'present', 'without', 'again', 'hold', 'around', 'however', 'keep', 'early', 'once', 'upon', 'every', 'let', 'side', 'try', 'until', 'far', 'always', 'away', 'toward', 'though', 'less', 'enough', 'almost', 'nothing', 'yet', 'better', 'near', 'per', 'often', 'within', 'along', 'best'
]

/*
 * Recursively merge properties of two objects 
 * This function will merge the CurrentObj to ParentObj
 * And overwrite the properties if exist in ParentObj
 * Then return the new tmpObjet to CurrentObj
 * Finish the job of inheritances
 */
exports.mergeObjects = function mergeObjects(CurrentObj, parentObj) {
    var tmpObj = this.clone(parentObj);
    for (var p in CurrentObj) {
        try {
          // Property in destination object set; update its value.
          if ( CurrentObj[p].constructor==Object ) {
              tmpObj[p] = mergeObjects(tmpObj[p], CurrentObj[p]);
          }
          else {
              tmpObj[p] = CurrentObj[p];
          }
        } catch(e) {
          // Property in destination object not set; create it and set its value.
          tmpObj[p] = CurrentObj[p];
        }
    }
    return tmpObj;
}


/*
 * Deep Clone function
 */
exports.clone = function clone(obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        var copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        var copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

/*
 * concatenation two array with unique elements
 * array3 = array2.concat(array1).distinct
 */
exports.union_arrays = function union_arrays(x, y) {
    var obj = {};
    for (var i = x.length-1; i >= 0; -- i) {
        obj[x[i]] = x[i];
    }
    for (var i = y.length-1; i >= 0; -- i) {
        obj[y[i]] = y[i];
    }
    var res = []
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            res.push(obj[k]);
        }
    }
    return res;
}


// BubbleSort
exports.sortMatchingResults = function sortMatchingResults(results) {
    var i = results.length;
    var j;
    var tmp = {};
    while (i>0) {
        for (j=0; j<i-1; j++) {
            if (results[j].score < results[j+1].score) {
                tmp = results[j];
                results[j] = results[j+1];
                results[j+1] = tmp;
            }
        }
        i--;
    }
    return results;
}


exports.findObjectById = function findObjectById(value, arr) {
    for (var index=0; index<arr.length; index++) {
        var obj = arr[index];
        if (obj._id.toString() === value.toString()) {
            return obj;
        }
    }
    return null;
}


/*
 * Formats mongoose errors into new array
 */
exports.errors = function(errors) {
    var keys = Object.keys(errors)
    var errs = [];
    if (!keys) {
        return ['Oops! There was an error'];
    }
    keys.forEach(function(key) {
        errs.push(errors[key].message);
    });
    return errs;
}


exports.betweenDates = function(start, end, origin) {
    return (origin.valueOf() >= start.valueOf() && origin.valueOf() <= end.valueOf);
}


exports.makeRef = function() {
    var ref = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for( var i=0; i < 5; i++ )
        ref += possible.charAt(Math.floor(Math.random() * possible.length));

    return ref;
}


exports.getTicketType = function(ticket) {
    if (ticket.__t === 'NeedModel') {
        tmp_type = ticket.__t.substr(0,4).toLowerCase()
    } else {
        tmp_type = ticket.__t.substr(0,5).toLowerCase()
    }
    return tmp_type;
}


exports.generateKeywords = function(text) {
    var keywords = [];
    var text_tmp = text.toLowerCase();
    var arr = text_tmp.split(' ');
    for (var index=0; index<arr.length; index++) {
        if (this.worthlesswords.indexOf(arr[index]) < 0) {
            keywords.push(arr[index]);
        }
    }
    return keywords
}

/*
 * Equal to 'for in' statement in python
 */
Array.prototype.contains = function(item){
    return RegExp(item).test(this);
};
