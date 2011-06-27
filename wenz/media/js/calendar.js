monthNames =  ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var dayz = new Date();

function drawBoxes(data)
{
    var el = $( "<div id = 'boxes'>");
    el.html(data);

    $('#boxes').replaceWith(el);
};

function newBoxes()
{
    var m = dayz.getMonth();
    var y = dayz.getFullYear();
    var $url = '/base/ajax?month='+ m +';year='+ y;
    $.ajax({
            url: $url,
            success: drawBoxes
           });
};

function prevMonth() {
    var m = dayz.getMonth();
    var y = dayz.getFullYear();
    if ( --m < 0 ) {
        m = 11;
       	y--;
        dayz.setYear (y);
    }
    dayz.setMonth(m);

    $('#month').empty();
    $('#month').text( ' '+ monthNames[m]+' '+ y +' ');

    var $width = $('#boxes').width()+ 100;
    $('#boxes').animate({left:$width}, 1000, newBoxes);
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

    $('#month').empty();
    $('#month').text( ' '+ monthNames[m]+' '+ y +' ');

    var $width = $('#boxes').width()+ 100;
    $('#boxes').animate({right:$width}, 1000, newBoxes);

};

$(document).ready( function()
{
    $(".details").colorbox({iframe:true, innerWidth:850, innerHeight:400});
} );

