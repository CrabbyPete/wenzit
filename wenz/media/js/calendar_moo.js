
		monthNames =  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
		var dayz = new Date();

		function newBoxes(event)
		{
			var e = window.event || event;

			m = dayz.getMonth();
			y = dayz.getFullYear();

			var url = '/base/ajax?month='+ m +';year='+ y;
			var xhr = new Request ( { url: url,
									  method: 'GET',
									  onComplete: ajaxComplete
									}
			);
			xhr.send(null);
		};


		function ajaxComplete( reply, XML ) {
			var el = new Element('div',{'id':'boxes'});
			el.innerHTML = reply;
            el.replaces($('boxes'))
			slideCal();
		}

		function deleteBoxes() {
			$('boxes').dispose();
			el = new Element('div',{'id':'boxes'});
			$('calendar').adopt();
		};

		function slideCal(){
			this.slideLeft = new Fx.Tween('boxes', { property:'left',
											duration: 1000,
											transition: Fx.Transitions.Linear,
											onComplete: newBoxes,
											wait: true
										}
			);

			this.slideRight = new Fx.Tween('boxes', { property:'right',
											duration: 1000,
											transition: Fx.Transitions.Linear,
											onComplete: newBoxes,
											wait: true
										}
			);
		};

		function nextMonth() {
			m = dayz.getMonth();
			y = dayz.getFullYear();
			if ( ++m >= 12 ) {
				m = 0;
				y++;
				dayz.setYear (y);
			}
             dayz.setMonth(m);

            var el = $("month")
            $('month').empty();
			$('month').appendText( ' '+ monthNames[m]+' '+ y +' ');

			var width = $('boxes').getSize();
			this.slideLeft.start(0,width.x);
		};

		function prevMonth() {
			m = dayz.getMonth();
			y = dayz.getFullYear();
			if ( --m < 0 ) {
				m = 11;
            	y--;
				dayz.setYear (y);
			}
            dayz.setMonth(m);

			$('month').empty();
			$('month').appendText( ' '+ monthNames[m]+' '+ y +' ');

			var width = $('boxes').getSize();
			this.slideRight.start(0,width.x);
		};

		function showEvents(y,m,d)
		{
			var url = '/base/show?year='+y+';month='+m+';day='+d;
			var xhr = new Request ( { url: url,
									  method: 'GET',
									  onComplete: ajaxComplete
									}
			);
			xhr.send(null);
		};

        function signOn( url )
        {
            /* LightModal.js */
            var modal = new LightFace.Request({
	                                            width: 400,
                                                height: 300,
	                                            url: url,
	                                            request: { method: 'get' }
                                                } );

            modal.addButton('Quit',function(){modal.close()});
            modal.open();
        }

		window.addEvent('domready', slideCal );