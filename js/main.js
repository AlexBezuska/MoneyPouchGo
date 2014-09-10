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