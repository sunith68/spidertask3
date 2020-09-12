var dates=[];
var today=new Date();
var day=1000*60*60*24;
var arr=[0,0,0,0,0,0,0];

var canvas = document.getElementById('canvas');
var c=canvas.getContext('2d');
canvas.width=0.7*window.innerWidth;
canvas.height=0.6*window.innerHeight;
// addEventListener('resize', event => {
// 	canvas.width=0.7*window.innerWidth;
// 	canvas.height=0.6*window.innerHeight;
// 	// execute();
// 	// arr=[0,0,0,0,0,0,0];
// })

//origin
var o={
	x:0.2*canvas.width,
	y:0.8*canvas.height
};
var shift=0.07*canvas.width;

execute();

function execute(){
	$.ajax({
	    type: "POST",
	    contentType: "application/json; charset=utf-8",
	    success: function(data){
	       	dates=data;
	       	makedate();
	       	group();
			axis();
			scale();
			plot();
			write1();
	    },
	    error: ()=> {
	    	c.font='25px,Arial';
	        c.fillText("OOPS Something went wrong",canvas.width/4,canvas.height/2);
	    },   
	});	
}

function makedate(){
	dates.forEach((dt)=>{
		dt.date=new Date(dt.date);
	})
}

function group(){
	var k;
	for(var i=0; i<dates.length;i++){
		k=(today.getTime() - dates[i].date.getTime())/day;
		k=Math.floor(k);
		if(k<7){
			arr[k]+=parseInt(dates[i].quantity);
		}
	}
}

function axis(){
	c.fillRect(o.x,o.y,canvas.width-400,2);
	c.fillRect(o.x,0,2,o.y);
}
function scale(){
	var max=Math.max(...arr);
	let s= 0.6*canvas.height/max;
	return s;
}
// to change order of dates loop i from 6 to 0 
function plot(){
	let s=scale();
	var x;
	var y;
	for(i=0;i<7;i++){
		x=shift+o.x+i*70;
		y=o.y-(arr[i]*s);
		c.fillRect(x,y,40,arr[i]*s);
		write2(i);
		write3(i,x,y);
	}
}

function write1(){
	c.font = "18px Arial";
	c.fillText("Quantity Sold",o.x-150,o.y/2);
	c.fillText("Date",canvas.width/2+10,o.y+75);
}
function write2(i){
	let x= shift+o.x+i*70;
	let y=o.y+20;
	let temp=new Date(today.getTime()-i*day);
	let d=temp.getDate()+'/'+(temp.getMonth()+1);
	c.font = "16px Arial";
	c.fillText(d,x+4,o.y+30);
}
function write3(i,x,y){
	c.font = "15px Arial";
	c.fillText(arr[i],x+8,y-8);
}

//test dates
// var dates=[
// 	{
// 		date:new Date('2020-09-8'),
// 		quantity:"8"
// 	},	
// 	{
// 		date:new Date('2020-09-9'),
// 		quantity:"12"
// 	},
// 	{
// 		date:new Date('2020-09-9'),
// 		quantity:"8"
// 	},
// 	{
// 		date:new Date('2020-09-7'),
// 		quantity:"4"
// 	},
// 	{
// 		date:new Date('2020-09-10'),
// 		quantity:"8"
// 	},		
// 	{
// 		date:new Date('2020-09-6'),
// 		quantity:"5"
// 	},
// 	{
// 		date:new Date('2020-09-8'),
// 		quantity:"18"
// 	},
// 	{
// 		date:new Date('2020-09-5'),
// 		quantity:"40"
// 	},
// 	{
// 		date:new Date('2020-09-4'),
// 		quantity:"9"
// 	}
// ]