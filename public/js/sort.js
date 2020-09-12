var arr=[];
var final=[];

$('#sortselect').change(()=>{
	var choice=$('#sortselect').val();
	sort1();
	if(choice=='Ascending'){
		ascending();
	}
	if(choice=='Descending'){
		descending();
	}
})

function sort1(){
	arr=[];
	final=[];
	$('.name1').each(function (){
		arr.push($(this).text().trim());
	})
	arr.sort();
	console.log(arr);
	$('.card').each(function(){
		console.log(this);
		var t=$(this).find('h2').text().trim();;
		console.log(t);
		for(i=0;i<arr.length;i++){
			if(t==arr[i]){
				final[i]=`<div class='card'>${$(this).html()}</div>`;
			}
		}
	})
	$('#qwe').empty();
}

function ascending(){
	for(var i=0;i<final.length;i++){
		$('#qwe').append(final[i]);
	}
} 

function descending(){
	for(var i=final.length-1;i>=0;i--){
		$('#qwe').append(final[i]);
	}
}