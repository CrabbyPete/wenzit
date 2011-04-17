var Calendar = {
        monthNames: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        dayNames:['S','M','T','W','T','F','S'],
        currentDate: new Date(),
		currentTime:'',
        mouseState:{'key':false,'x':0,'y':0},

        initialize: function (year,month,day,time)
        {
            var cWindow = window.content;

            var link = window.content.document.createElement("link");
            link.rel = "stylesheet";
            link.type = "text/css";
            link.href = "chrome://wenzit/skin/calendar.css";

            var head = window.content.document.getElementsByTagName('head')[0];
            head.appendChild(link);

            Calendar.currentDate = new Date();
            if ( year != null )
                Calendar.currentDate.setFullYear(year);
            else
                year = Calendar.currentDate.getFullYear();

            if ( month != null )
                Calendar.currentDate.setMonth(month);
            else
                month = Calendar.currentDate.getMonth();

            if ( day != null )
                Calendar.currentDate.setDate(day);
            else
                day = Calendar.currentDate.getDate();
			
			Calendar.currentTime = time;

            var table = cWindow.document.createElement('table');
            table.className ="calendar";
			table.id = "CALENDARTABLE";
			
			// Create Month and Year caption
            var caption = cWindow.document.createElement("caption");
            caption.appendChild(cWindow.document.createTextNode(Calendar.monthNames[month]+" "+ year));
			
			Calendar.mouseState.key = false;
			Calendar.mouseState.x   = 0;
			Calendar.mouseState.y   = 0;
            
			caption.addEventListener('mousedown', Calendar.moveMonth, false);
            caption.addEventListener('mousemove', Calendar.moveMonth, false);
			caption.addEventListener('mousein',   Calendar.moveMonth, false);
			caption.addEventListener('mouseout',  Calendar.moveMonth, false);
			
            table.appendChild(caption);

            // Create the days of the week header
            var td,tr;
            var thead = cWindow.document.createElement ("thead");

            tr = cWindow.document.createElement("tr");
            for (var i = 0; i<7; i++ )
            {
                td = cWindow.document.createElement ("td");
                td.appendChild(cWindow.document.createTextNode(Calendar.dayNames[i]));
                tr.appendChild(td);
            }
            thead.appendChild(tr);
            table.appendChild(thead);

           // Create the foot navigator
            var tfoot = cWindow.document.createElement ("tfoot");
            tr = cWindow.document.createElement("tr");

            // Create the previous month icon
            td = cWindow.document.createElement ("td");
			var img = cWindow.document.createElement ("img");
			img.src = "chrome:\/\/wenzit\/skin\/prev.gif";
			img.alt = " ";

            img.addEventListener('click',     Calendar.lastMonth, false);
            td.appendChild(img);
			tr.appendChild(td);

            // Create a close window button
            td = cWindow.document.createElement ("td");
            td.appendChild(cWindow.document.createTextNode("Close"));
            td.colSpan = "5";
            td.addEventListener( 'click', Calendar.closeMonth, false );
            tr.appendChild(td);

            // Create a next month icon
            td = cWindow.document.createElement ("td");
			var img = cWindow.document.createElement ("img");
			img.src = "chrome:\/\/wenzit\/skin\/next.gif";
			img.alt = " ";
            img.addEventListener('click',    Calendar.nextMonth, false);
            td.appendChild(img);
			tr.appendChild(td);

            tfoot.appendChild(tr);
            table.appendChild(tfoot);

            // Create the body of the calendar
            var tbody = table.appendChild(cWindow.document.createElement("tbody"));

            var dayOfMonth = 1;
            var daysInMonth = [31,((!(year % 4 ) && ( (year % 100 ) || !( year % 400 ) ))?29:28),31,30,31,30,31,31,30,31,30,31][month];

            var dayOne = new Date(year, month, 1);
            startDay = dayOne.getDay();

            var validDay = false;
            for(var week = 0; week < 6; week++)
		    {
                // Create a row for each week
                var row = tbody.appendChild(cWindow.document.createElement("tr"));
			    for(var weekDay = 0; weekDay < 7; weekDay++)
			    {
                    if(week == 0 && startDay == weekDay)
                        validDay = true;
                    else if (validDay && dayOfMonth > daysInMonth)
                        validDay = false;
                    var cell = row.appendChild(cWindow.document.createElement("td"));

                    if(validDay)
                    {
                        if ( dayOfMonth == day )
                            cell.style['backgroundColor']= "#cc9999";
                        else
                            cell.style['backgroundColor'] = "#f0e68c";

                        cell.addEventListener('mouseover',this.toggleBackground, false);
                        cell.addEventListener('mouseout', this.toggleBackground, false);
						cell.addEventListener('click', Calendar.markDate, false);
                        cell.innerHTML = " "+dayOfMonth++;
                    }
                    else
                        cell.style['backgroundColor'] = "#eeeeee";
			    }
		    }
            return table;
        },

        // This date was clicked
        markDate: function(event)
		{
			var date 	= Calendar.currentDate;
			var time    = Calendar.guessTime;
			var dayStr 	= date.toDateString();
			
			// Encode the url or you get in trouble passing it over if its got a url= in it
			var URI  	= encodeURIComponent(this.baseURI);

			Calendar.closeMonth(event);

            // Set the browser window's location to the incoming URL
            window.open('http://localhost:8000/base/add/?url='+URI+'&day='+dayStr +'&time=' + Calendar.currentTime,'Wenzit','width=850,height=400,resizable=yes,left=0,top=100,screenX=0,screenY=100')

            // For a full window use this code. Helps with Firebug.
			//window._content.document.location = 'http://wenzit.net/base/add/?url='+URI+'&day='+dayStr;
            //window.content.focus();
		},

        closeMonth: function(event)
        {
            var cal =  window.content.document.getElementById("CALENDARTABLE");
            cal.parentNode.removeChild(cal);
        },

        moveMonth: function(event)
        {
            var type = event.type;
			switch ( type )
            {
                case 'mousemove':
					if (Calendar.mouseState.key == true )
                    {
                        var cal  = event.target.parentNode;
						
						var x = event.pageX-Calendar.mouseState.x;
                        var y = event.pageY-Calendar.mouseState.y;

                        var top =  parseInt(cal.style['top']);
                        var left = parseInt(cal.style['left']);
	
                        cal.style['left'] = left +  x  + "px";
                        cal.style['top']  = top  +  y  + "px";
						
						Calendar.mouseState.x = event.pageX;
						Calendar.mouseState.y = event.pageY;
					}
					break;
					
                case 'mousedown':
					Calendar.mouseState.x = event.pageX;
					Calendar.mouseState.y = event.pageY;
					Calendar.mouseState.key = true;
					break;
					
                default:
					Calendar.mouseState.key = false;
            }
			
			return;
        },

        lastMonth: function(event)
        {
            var date = Calendar.currentDate;
            if ( !date )
				return;
            var year  = date.getFullYear();
            var month = date.getMonth();
            var day   = date.getDate();
            if ( --month  < 0 )
            {
                month = 11;
                year--;
            }
            Calendar.drawMonth( year,month,day);
        },

        nextMonth: function(event)
        {
            var date = Calendar.currentDate;
            if ( !date )
				return;
            var year  = date.getFullYear();
            var month = date.getMonth();
            var day   = date.getDate();
            if ( ++month  > 11 )
            {
                month = 0;
                year++;
            }
            Calendar.drawMonth( year,month,day);
        },

        drawMonth: function(year,month,day)
        {
            var cal =  window.content.document.getElementById("CALENDARTABLE");
            var left = cal.style['left'];
            var top  = cal.style['top'];
            cal.parentNode.removeChild(cal);

            var table = this.initialize(year,month,day);
            table.style['left']= left;
            table.style['top'] = top;

            var body = window.content.document.getElementsByTagName('body')[0];
            body.appendChild(table);
			return;
        },

        toggleBackground: function( event )
        {
            var td = event.target;
            var color = td.style['backgroundColor'];

            var rgb = color.match(/\d{1,3}/g);
		    if (rgb && rgb.length == 3)
            {
      			var hex = new Array();
		        for (var i = 0; i < 3; i++)
                {
			        var bit = (rgb[i]-0).toString(16);
			        hex.push((bit.length == 1) ? '0'+bit : bit);
		        }
		        color = '#'+hex.join('');
            }
            switch( color )
            {
                case "transparent":
                    color = '#eee8aa';
                    break;
                case "#eee8aa":
                    color = 'transparent';
                    break;

                case "#f0e68c":     // Regular day
                    color = "#ff00ff";
                    break;

                case "#ff00ff":     // Pink for regular day
                    color = "#f0e68c";
                    break;

                case "#cc9999":     // Selected day
                    color = "#ff69B4";
                    break;

                case "#ff69b4":     // Pink for selected day
                    color = "#cc9999";
                    break;
            }
            td.style['backgroundColor'] = color;
            return;
        }
};


var wenzit = {
    skippedElements :
    {
        a:        true,
        noscript: true,
        head:     true,
        script:   true,
        style:    true,
        textarea: true,
        label:    true,
        select:   true,
        button:   true
    },

    filters:    [
/((0?[13578]|10|12)(-|\/)((0[0-9])|([12])([0-9]?)|(3[01]?))(-|\/)((\d{4})|(\d{2}))|(0?[2469]|11)(-|\/)((0[0-9])|([12])([0-9]?)|(3[0]?))(-|\/)((\d{4}|\d{2})))/g,
/(Jan(-|\.|\s|uary)|Feb(-|\.|\s|ruary)|Mar(-|\.|\s|ch)|Apr(-|\.|\s|il)|May(-|\s)|Jun(-|\.|\s|e)|Jul(-|\.|\s|y)|Aug(-|\.|\s|ust)|Sep(-|\.|\s|tember)|Oct(-|\.|\s|ober)|Nov(-|\.|\s|ember)|Dec(-|\.|\s|ember))(\s?)(\-?)(\d{1,2})(st|nd|rd|th)?(\,?\s?\-?(\d{2,4})?)/g,
                ],

    // Original string:^((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))$
    timeFilter: /((([0]?[1-9]|1[0-2])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?( )?(AM|am|aM|Am|PM|pm|pM|Pm))|(([0]?[0-9]|1[0-9]|2[0-3])(:|\.)[0-5][0-9]((:|\.)[0-5][0-9])?))/g,



	findDates: function(event)
    {
        var body = window.content.document.getElementsByTagName("body");

		for ( var i=0; i < body.length; i++ )
			this.traverseDom(body[i])
    },

    traverseDom: function (node)
    {
        if (node.nodeType == 3)
            node = this.filterText(node);

        if (node.nodeType == 1)
        {
            if ( this.skippedElements[node.tagName.toLowerCase()])
            {
                if ( node.nextSibling )
                    node = node.nextSibling;
                else
                    return;
            }
        }
        for (var i=0; i< node.childNodes.length; i++)
				this.traverseDom(node.childNodes.item(i));
    },

	filterText: function(node)
	{
		var source  = node.data.replace(/[\n\r\t]/g,'');      // Get rid of special characters.
        var parent  = node.parentNode;
        var sibling = node.nextSibling;

  		for (var j = 0; this.filters[j]; ++j)
  		{
    		var regexp = this.filters[j];
			var match = regexp.exec(source)
    		if ( !match )
                continue;
				
            node.data = source.substring(0, match.index);

            var a = window.content.document.createElement('a');
            a.appendChild(window.content.document.createTextNode(match[0]));
            a.style['color'] ='red';
            a.addEventListener('mouseover',this.dateRollOver,false);

            node = window.content.document.createTextNode( source.substring(match.index+match[0].length,source.length) );

            if (sibling)
            {
                parent.insertBefore(a,sibling);
                parent.insertBefore(node,sibling);
            }
            else
            {
                parent.appendChild(a);
                parent.appendChild(node);
            }
            return (node);
		}
        return (node);
	},

    findTime: function(node)
	{
        var regexp = this.timeFilter;
		
		for ( var i=0; i < node.childNodes.length; i++)
		{
			if ( node.childNodes[i].nodeType == 3 )
			{
				var source = node.childNodes[i].data;
				var match = regexp.exec( source );
				if ( match )
					return match[0];
			}
		}
        return null;
    },

    dateRollOver: function(event)
    {
        var cell = event.originalTarget;

		var date = parseDateString(cell.firstChild.data);
        if ( date == null )
            return;

		var node =  window.content.document.getElementById("CALENDARTABLE");
        if (node)
            node.parentNode.removeChild(node);

        var time = wenzit.findTime(event.target.parentNode);
		var calendar = Calendar.initialize(date.getFullYear(), date.getMonth(), date.getDate(), time );
		
        calendar.style['left'] = event.pageX+"px";
        calendar.style['top']  = event.pageY+"px";

        var body = window.content.document.getElementsByTagName('body')[0];
        //body.appendChild(calendar);
        body.insertBefore(calendar, body.childNodes[0])
   },
   
    onLoad: function()
    {
        // initialization code
        this.initialized = true;
        this.strings = document.getElementById("wenzit-strings");
    },

    onMenuItemCommand: function(e)
    {
        var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                  .getService(Components.interfaces.nsIPromptService);
        promptService.alert(window, this.strings.getString("helloMessageTitle"),
                                this.strings.getString("helloMessage"));
    },
};
window.addEventListener("load", function(e) { wenzit.onLoad(e); }, false);
