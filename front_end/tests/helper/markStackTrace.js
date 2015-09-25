$(document).ready(function(){
// jQuery methods go here...
	console.log('läuft');
	$('.stack-trace').each(function () {
		var text = $(this).text().replace(/(.*tests\/spec.*)/,'<strong style="color:blue;">$1</strong>');
		$(this).html(text);
	});
});