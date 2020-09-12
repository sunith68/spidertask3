$("#error1").hide();
$("#quantity").keyup((e)=>{
	if(isNumeric(e.target.value)){
		$("#submitbtn").prop('disabled',false);
		$("#error1").hide();
	}
	else{
		$("#submitbtn").prop('disabled',true);
		$("#error1").show();
	}
})
function isNumeric(value) {
    return /^\d+$/.test(value);     //regex pattern matching(checks if only digits)
}
