'use strict';
/*----------------------------------------------------------------
Promises Workshop: build the pledge.js deferral-style promise library
----------------------------------------------------------------*/
// YOUR CODE HERE:
function $Promise () {
	this.state = 'pending';
	this.handlerGroups = [];

}

$Promise.prototype.then = function(success, error) {
	if (typeof success != 'function' && typeof error != 'function') {
		this.handlerGroups.push({
			successCb: false,
			errorCb: false
		});
	}

	else if (this.state === 'pending') {
		
		var forw = new Deferral();
		this.handlerGroups.push({
			successCb: success,
			errorCb: error,
			forwarder: forw
		});
		console.log("forw: ", forw);
		console.log("this.handlerGroups[0]: ", this.handlerGroups[0]);
		console.log("instanceof Deferral? ", this.handlerGroups[0].forwarder instanceof Deferral);
	}

	else if (this.state === 'resolved' && typeof success == 'function') {
		return this.callHandlers(success);
	}

	else if (this.state === 'rejected' && typeof error == 'function') {
		return this.callHandlers(error);
	}

};

$Promise.prototype.callHandlers = function(func) {
	return func(this.value);
};

$Promise.prototype.catch = function(func) {
	this.then(null, func);
}

function Deferral () {
	this.$promise = new $Promise();
}

Deferral.prototype.resolve = function(resolvedData){
	if (this.$promise.state === 'pending') {
		this.$promise.value = resolvedData;
		this.$promise.state = 'resolved';

		if (this.$promise.handlerGroups[0] !== undefined) {
			for(var i = 0; i < this.$promise.handlerGroups.length; i++) {
				if (typeof this.$promise.handlerGroups[i].successCb === 'function') {
					this.$promise.handlerGroups[i].successCb(this.$promise.value);
				}
			}
			this.$promise.handlerGroups = [];
		}
	}
};

Deferral.prototype.reject = function(rejectedData){
	if (this.$promise.state === 'pending') {
		this.$promise.value = rejectedData;
		this.$promise.state = 'rejected';

		if (this.$promise.handlerGroups[0] !== undefined) {
			for(var i = 0; i < this.$promise.handlerGroups.length; i++) {
				if (typeof this.$promise.handlerGroups[i].errorCb === 'function') {
					this.$promise.handlerGroups[i].errorCb(this.$promise.value);
				}
			}
		}
	}
};

function defer() {
	return new Deferral();
}

// myDeferral = { $promise: { state: 'pending' }}

/*-------------------------------------------------------
The spec was designed to work with Test'Em, so we don't
actually use module.exports. But here it is for reference:

module.exports = {
  defer: defer,
};

So in a Node-based project we could write things like this:

var pledge = require('pledge');
…
var myDeferral = pledge.defer();
var myPromise1 = myDeferral.$promise;
--------------------------------------------------------*/
