var image=true;
var price=true;
var quantity=true;
$("#error").hide();
$("#image").change(()=>{
	var ext = $("#image").val().split('.').pop().toLowerCase();
	console.log(ext);
	if(ext=='jpeg'||ext=='jpg'||ext=='png'){
		image=true;
	}
	else{
		image=false;
	}
	check();
})
$("#price").keyup((e)=>{
	let x= parseInt(e.target.value);
	if(x<0){
		price=false;
	}
	else{
		price=true;
	}
	check();
})
$("#quantity").keyup((e)=>{
	if(isNumeric(e.target.value)){
		quantity=true;
	}
	else{
		quantity=false;
	}
	check();
})
function check(){
	if(image==true&&price==true&&quantity==true){
		$("#submitbtn").prop('disabled',false);
		$("#error").hide();
	}
	else{
		$("#submitbtn").prop('disabled',true);
		$("#error").show();	
	}
	finalError();
}
function finalError(){
	let temp="";
	if(image==false){
		temp+=`Upload a jpg, png or jpeg file <br>`
	}
	if(price==false){
		temp+=`Price cannot be negative <br>`
	}
	if(quantity==false){
		temp+=`Invalid value of quantity <br>`
	}
	$("#error").html(temp);
}
function isNumeric(value) {
    return /^\d+$/.test(value);
}