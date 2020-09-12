var t=['Electronics','Fashion','Personal Care','Sports and Outdoors','Household','Others'];
assign();
function assign(){
	var x=$('#option').text();
	for(var a of t){
		if(a==x){
			continue;
		}
		else{
			$('#select').append(`<option value='${a}'>${a}</option>`);
		}
	}
}