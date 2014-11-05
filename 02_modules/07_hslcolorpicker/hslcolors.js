//http://hslpicker.com/#f00

function rainbow(n) {
    return 'hsl(' + n + ',100%,50%)';
}
for (var i = 0; i <= 67; i+=1) {
    $('<b>/</b>').css({
        color: rainbow(i)
    }).appendTo('#colors');
}
}