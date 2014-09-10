"use strict";

$(document).ready(function() {

	$(document).on("mousedown touchstart", ".type div", function() {
		deactivateAllCategories();
		activateCategory(this);
		setFocus(".amount");
	});

	$('*[data-mask="money"]').each(function() {
		var value = $(this).val().replace("$", "").replace(",", "");
		if (isNaN(value) || value == "") {
			value = "0.00";
		}
		value = toMoney(value);
		$(this).val(value);
	});

	$("*[data-mask='money']").click(function() {
		$(this).select();
	});

	$('*[data-mask="money"]').focus(function() {}).blur(function() {
		var value = $(this).val().replace("$", "").replace(",", "");
		value = toMoney(value);
		$(this).val(value);
	});

	$(document).on("mousedown touchstart", ".add", function() {
		createLogItem($('.amount').val(), getSelectedCategory());
	});

});


/*
 * Takes in a dollar amount and category
 * creates html elements for a log item in the transaction history.
 */
function createLogItem(amount, category) {
	$('.history').append('<div class="entry"><div class="date">' + createDate() + '</div><div class="label" >' + category + '</div><input type="text" data-mask="money" value="' + amount + '"></input><button class="remove">-</button></div>');
}

/*
 * Returns string of text of the current selected category name.
 */
function getSelectedCategory() {
	return $(".type .active").text();
}

function deactivateAllCategories() {
	$(".type .active").removeClass("active");
}

function activateCategory(element) {
	$(element).addClass("active");
}

function setFocus(element) {
	$(element).focus();
}

function addCommas(str) {
	str += '';
	var x = str.split('.');
	var x1 = x[0];
	var x2 = x.length > 1 ? '.' + x[1] : '';
	var rgx = /(\d+)(\d{3})/;
	while (rgx.test(x1)) {
		x1 = x1.replace(rgx, '$1' + ',' + '$2');
	}
	return x1 + x2;
}

function toMoney(value) {
	var value = value.replace(/[^0-9.-]/g, "");
	var valueLength = value.length - 1;
	if (value.indexOf(".") !== -1) {
		if (value.substring(value.indexOf("."), valueLength).length == 0) {
			value = "$" + value + "00";
			return addCommas(value);
		}
		if (value.substring(value.indexOf("."), valueLength).length == 1) {
			value = "$" + value + "0";
			return addCommas(value);
		}
		if (value.substring(value.indexOf("."), valueLength).length == 2) {
			value = "$" + value;
			return addCommas(value);
		} else {
			var value = value.replace(/[^0-9.-]/g, "");
			value = preciseRound(value);
			value = "$" + value.toString();
			return addCommas(value);
		}
	} else {
		value = "$" + value + ".00";
		return addCommas(value);
	}
}

function preciseRound(num, decimals) {
	var rounded = Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
	return rounded;
}


function createDate() {
	var d = new Date();
	var curr_date = d.getDate();
	var curr_month = d.getMonth() + 1; //Months are zero based
	var curr_year = d.getFullYear();
	return curr_date + "." + curr_month + "." + curr_year;
}

function createTime() {
	var d = new Date(); // for now
	d.getHours(); // => 9
	d.getMinutes(); // =>  30
	d.getSeconds(); // => 51
}