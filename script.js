"use strict";
const TREE_WIDTH = 10;
const TREE_HEIGHT = 50;
const WAVE_SPEED = 0.01;
const LEAF_SIZE = 50;
const TIME_PER_FRAME = 0.0002;
const SPEED_PER_FRAME= 0.2;
var wood = document.createElement("img");
wood.src = "wood.jpg";
var leaf = document.createElement("img");
leaf.src = "leaf.png";

function Leaf(sz){
    this.size = sz;
}
function Tree(sz, depth, parent = null, idx = null, selected = false)
{
	// these are it's properties
	this.size = sz;
    
	// this is its state
	this.depth = depth;
	this.child = [];
	this.childPhase = [];
	this.childUpdate = [];
	this.parent = parent;
	this.idx = idx;
	this.selected = selected;

	if (this.depth>1){
		var a = Math.floor(Math.random() * 2) + 2;
		for(var i = 1; i<=a; i++){
			var tree_new = new Tree(sz, this.depth-1, this, i-1);
			this.child.push(tree_new);
			this.childPhase.push(0);
			this.childUpdate.push(2*(i%2)-1);
		}
	} else {
		var end = new Leaf(1);
		this.child.push(end);
		this.childPhase.push(0);
		this.childUpdate.push(1);
	}
}

Leaf.prototype.draw = function(context) {
	context.save();
	context.scale(this.size, this.size);
	context.translate(-0.5*LEAF_SIZE,0);
	context.beginPath();
	context.drawImage(leaf, 0, 0, LEAF_SIZE, -1*LEAF_SIZE);
	context.fill();
	context.restore();
}

Tree.prototype.draw = function(context) {
	if (this.depth>=1){
		context.save();

		context.scale(this.size, this.size);

		context.beginPath();
		context.translate(-1*TREE_WIDTH,0);
		context.drawImage(wood, 0, 0, TREE_WIDTH, -1*TREE_HEIGHT);

		context.fill();

		if (this.selected){
			context.beginPath();
			context.strokeStyle = "#fdd017";
			context.lineWidth = 4;
			context.rect(0, 0, TREE_WIDTH, -1*TREE_HEIGHT);
			context.stroke();
		}


		context.translate(TREE_WIDTH, -1*TREE_HEIGHT);
		context.rotate(Math.PI/2);
		for(var i = 0; i<this.child.length; i++) {
			context.rotate(-1*(Math.PI/(this.child.length+ 1)));
			context.save();
			context.rotate(3*this.childPhase[i]*Math.PI/180);
			this.child[i].draw(context);
			context.restore();
		}

		context.restore();
	}
	else {
		this.child[0].draw(context);
	}
}

Tree.prototype.update = function(delta) {
	for (var i = 0; i<this.child.length; i++) {
		this.childPhase[i] += SPEED_PER_FRAME*delta*WAVE_SPEED * this.childUpdate[i];
		if (this.childPhase[i] >=1){
			var scenario = Math.floor(this.childPhase[i]%4);
			if (scenario===0){
				this.childPhase[i] = this.childPhase[i]%1
			}
			if (scenario===1){
				this.childPhase[i] = 1-this.childPhase[i]%1
				this.childUpdate[i] = -1 * this.childUpdate[i];
			}
			if (scenario===2){
				this.childPhase[i] = -1*this.childPhase[i]%1
				this.childUpdate[i] = -1 * this.childUpdate[i];
			}
			if (scenario===3){
				this.childPhase[i] = this.childPhase[i]%1 -1
			}
		} else if (this.childPhase[i] <= -1){
			var scenario = Math.floor((-1*this.childPhase[i])%4);
			if (scenario===0){
				this.childPhase[i] = this.childPhase[i]%1;
			}
			if (scenario===1){
				this.childPhase[i] = -1*(1+this.childPhase[i]%1);
				this.childUpdate[i] = -1 * this.childUpdate[i];
			}
			if (scenario===2){
				this.childPhase[i] = -1*this.childPhase[i]%1;
				this.childUpdate[i] = -1 * this.childUpdate[i];
			}
			if (scenario===3){
				this.childPhase[i] = 1+this.childPhase[i]%1;
			}
		}
		this.child[i].update()
	}
}

Tree.prototype.isAddable = function() {
	// define if a branch can be added at a node
	return this.child.length<3
}

Tree.prototype.add = function() {
	// add a branch to the node
	var tree_new = new Tree(this.size, 1, this, this.child.length);
	if (this.child[0] instanceof Leaf){
		tree_new.idx = 0;
		this.child = [tree_new]
	}
	else {
		this.child.push(tree_new);
		this.childPhase.push(0);
		this.childUpdate.push(2*(this.child.length%2)-1);
	}
}

Tree.prototype.delete = function() {
	// delete object from it's parent
	this.parent.child.splice(this.idx,1);
	this.parent.childPhase.splice(-1,1);
	this.parent.childUpdate.splice(-1,1);
	// update sibling indexes
	for (let i = 0; i < this.parent.child.length; i++) {
		this.parent.child[i].idx = i;
	}
	if (this.parent.child.length === 0){
		var end = new Leaf(1);
		this.parent.child.push(end);
		this.parent.childPhase.push(0);
		this.parent.childUpdate.push(1);
	}
}


Leaf.prototype.update = function() {

}

function Timer(){
	this.time = 1.0
}

Timer.prototype.draw = function(context){
	context.beginPath();
	context.rect(10,10, 150*this.time,20);
	context.fillStyle = '#77dd77';
	context.fill();
}
Timer.prototype.update = function(delta, isWin){
	if (!isWin && this.time >0){
		this.time -= SPEED_PER_FRAME*delta*TIME_PER_FRAME;
	}
}
Timer.prototype.over = function(){
	if (this.time<0){
		return true
	}
}