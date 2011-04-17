/* 'Magic' date parsing, by Simon Willison (6th October 2003)
   http://simon.incutio.com/archive/2003/10/06/betterDateInput
*/

/* Finds the index of the first occurence of item in the array, or -1 if not found */
Array.prototype.indexOf = function(item) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] == item) {
            return i;
        }
    }
    return -1;
};
/* Returns an array of items judged 'true' by the passed in test function */
Array.prototype.filter = function(test) {
    var matches = [];
    for (var i = 0; i < this.length; i++) {
        if (test(this[i])) {
            matches[matches.length] = this[i];
        }
    }
    return matches;
};

var monthNames = "January February March April May June July August September October November December".split(" ");

/* Takes a string, returns the index of the month matching that string, throws
   an error if 0 or more than 1 matches
*/
function parseMonth(month) {
    var matches = monthNames.filter(function(item) { 
        return new RegExp("^" + month, "i").test(item);
    });
    if (matches.length == 0) {
        throw new Error("Invalid month string");
    }
    if (matches.length > 1) {
        throw new Error("Ambiguous month");
    }
    return monthNames.indexOf(matches[0]);
}

/* Array of objects, each has 're', a regular expression and 'handler', a 
   function for creating a date from something that matches the regular 
   expression. Handlers may throw errors if string is unparseable. 
*/
var dateParsePatterns = [
    // January 2004
    {   re: /^([a-z]+) (\d{4})$/i, 
        handler: function(bits) {
            var d = new Date();
			d.setMonth(parseMonth(bits[1]));
            d.setYear(parseInt(bits[2], 10));
            return d;
        }
    },
    // Jan 4th 2003
    {   re: /^([a-z]+)(\.?)(\s)(\d{1,2})(th|rd|nd|\,?)\s(\d{2,4})/i,
        handler: function(bits) {
            var d = new Date();
			d.setMonth(parseMonth(bits[1]));
			d.setDate(parseInt(bits[4],10));
			var y = parseInt(bits[6]);
			if ( y < 100 )
				y = Math.floor(d.getFullYear()/100) * 100 + y;
			d.setYear(y);
            return d;
        }
	},
    // Jan 24th Default year this year
    {   re: /^([a-z]+)(\.?)(\s)(\d{1,2})(th|rd|nd|\,?)/i,
        handler: function(bits) {
            var d = new Date();
			d.setMonth(parseMonth(bits[1]));
			d.setDate(parseInt(bits[4],10));
            return d;
        }
	},
	// Jan-4-2003
    {   re: /^([a-z]+)\-(\d{1,2})\-(\d{2,4})/i,
        handler: function(bits) {
            var d = new Date();
			d.setMonth(parseMonth(bits[1]));
			d.setDate(parseInt(bits[2],10));
			var y = parseInt(bits[3],10);
			if ( y < 100 ) 
				y = Math.floor(d.getFullYear()/100) * 100 + y;
			d.setYear(y);
			return d;
        }
    },
    // mm/dd/yyyy mm.dd.yyyy mm-dd-yyyy (American style)
    {   re: /(\d{1,2})(\/|\.|\-)(\d{1,2})(\/|\.|\-)(\d{2,4})/,
        handler: function(bits) {
            var d = new Date();
			var y = parseInt( bits[5],10);
			if ( y < 100 ) 
				y = Math.floor(d.getFullYear()/100) * 100 + y;
            d.setYear(y);
            d.setDate(parseInt(bits[3],10));
            d.setMonth(parseInt(bits[1],10) - 1); // Because months indexed from 0
            return d;
        }
    },
    // yyyy-mm-dd (ISO style)
    {   re: /(\d{4})-(\d{1,2})-(\d{1,2})/,
        handler: function(bits) {
            var d = new Date();
            d.setYear(parseInt(bits[1],10));
            d.setDate(parseInt(bits[3], 10));
            d.setMonth(parseInt(bits[2], 10) - 1);
            return d;
        }
    },

];

function parseDateString(s) {
    for (var i = 0; i < dateParsePatterns.length; i++)
    {
        var re = dateParsePatterns[i].re;
        var handler = dateParsePatterns[i].handler;
        var bits = re.exec(s);
        if (bits)
        {
            return handler(bits);
        }
    }
    return null;
}

