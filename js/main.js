"use strict";

$(document).ready(function() {
	$(document).on("mousedown touchstart", ".type div", function() {
		deactivateAllCategories();
		activateCategory(this);
		setFocus(".amount");
	});
});

function deactivateAllCategories() {
	$(".type .active").removeClass("active");
}

function activateCategory(element) {
	$(element).addClass("active");
}

function setFocus(element) {
	$(element).focus();
}