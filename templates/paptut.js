paper.install(window)

// idea: instead of only being able to move your character
// after their position has been updated in the database,
// you could move your character as often as the next frame, updating
// your position as often as possible.  This would make your movement
// look much smoother.  Of course, you would only be able to get
// other players' positions after ajaxing that info from the server,
// so their movement may still look stilted to you.


function Character(x, y, id, color){
    this.color = color;
    this.new_pt = new Point(x, y);
    this.current_pt = this.new_pt.clone();
    this.id = id;
    this.path;
    this.draw();
    this.inc = 0;
    this.rast;
    this.dir;
}

Character.prototype.move = function(dx, dy){
    var xdist = this.new_pt.x - this.current_pt.x;
    var ydist = this.new_pt.y - this.current_pt.y;
    // Obviously needs some refactoring to get rid of
    // repetition
    if (Math.abs(xdist) > dx){
	var face = xdist/Math.abs(xdist);
	this.current_pt.x += dx * face;
	if (face>0)
	    this.dir="right";
	else
	    this.dir="left";
    }
    if (Math.abs(ydist) > dy){
	var face = ydist/Math.abs(ydist);
	this.current_pt.y += dy * face;
	if (face>0)
	    this.dir="down";
	else
	    this.dir="up";
    }
    this.draw();
}

Character.prototype.draw = function(){
    if (this.rast)
	this.rast.remove();
    if(!this.dir){
	this.dir = "down"
    }
    var img = this.dir+(parseInt(this.inc%4)).toString();
    this.rast = new Raster(img, this.current_pt);
    this.rast.scale(4);
    this.inc+=0.125;
    
}

$(function(){
    var dx = 3;
    var dy = 3;
    paper.setup("mycanvas");
    var me;
    var first_time = true;
    var other_chars = {}
    var other_char_ids = new Array();
    other_chars.length = 0;
    var tool = new Tool();
    var keysdown = {}
    tool.onKeyDown = function(event){
	keysdown[event.key] = true;
	$.ajax({
	    url:"keydown",
	    data:keysdown
	});
    }
    tool.onKeyUp = function(event){
	keysdown[event.key] = false;
    }
    view.onFrame = function (event){
	if (me)
	    me.move(dx, dy);
	$.ajax({
	    url:"myposition"
	}).done(function(data){
	    if (!me){
		me = new Character(data.x, data.y, data.id, "red")
	    }else{
		me.new_pt.x = data.x;
		me.new_pt.y = data.y;
		
	    }
	    
	});
	$.ajax({
	    url:"other_chars"
	}).done(function(data){
	    for (i=0; i<data.length; i++){
		var pp = other_chars[data[i].index];
		
		if (pp){
		    pp.new_pt.x = data[i].x;
		    pp.new_pt.y = data[i].y;
		    // pp.move(dx, dy);
		}else{
		    other_chars[data[i].index] =
			new Character(data[i].x,
				      data[i].y,
				      data[i].index,
				      "blue");
		    other_chars.length++;
		    other_char_ids.push(data[i].index);
		}
	    }
	});
	for(j=0; j<other_char_ids.length; j++){
	    other_chars[other_char_ids[j]].move(dx, dy);
	}
    }
    tool.activate();
});
