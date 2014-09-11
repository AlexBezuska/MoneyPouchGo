(function() {

	'use strict';

	var ENTER_KEY = 13;
	var newItemTextBox = document.getElementById('amount');
	var addButton = document.getElementById('add');
	var syncDom = document.getElementById('sync-wrapper');

	var db = new PouchDB('history');
	var remoteCouch = 'http://yourdatabase.iriscouch.com/history';



	db.info(function(err, info) {
		db.changes({
			since: info.update_seq,
			live: true
		}).on('change', showHistoryItems);
	});

	// We have to create a new history document and enter it in the database
	function addHistoryItem(amount, date, category) {
		var history = {
			_id: new Date().toISOString(),
			amount: amount,
			date: date,
			category: category
		};
		db.put(history).then(function(result) {
			console.log("everything is A-OK");
			console.log(result);
		}).catch(function(err) {
			console.log("everything is terrible");
			console.log(err);
		});
	}

	// Show the current list of historys by reading them from the database
	function showHistoryItems() {
		db.allDocs({
			include_docs: true,
			descending: true
		}).then(function(doc) {
			redrawHistoryUI(doc.rows);
		}).catch(function(err) {
			console.log(err);
		});
	}

	// function checkboxChanged(history, event) {
	// 	history.completed = event.target.checked;
	// 	console.log(history);
	// 	db.put(history);
	// }

	// User pressed the delete button for a history, delete it
	function deleteButtonPressed(history) {
		var answer = confirm("Are you sure you want to perminantley delete this record?")
		if (answer) {
			db.remove(history);
		} else {

		}
	}

	// The input box when editing a history has blurred, we should save
	// the new amount or delete the history if the amount is empty
	function historyBlurred(history, event) {
		var trimmedText = event.target.value.trim();
		if (!trimmedText) {
			db.remove(history);
		} else {
			history.amount = trimmedText;
			db.put(history);
		}
	}
	// Initialise a sync with the remote server
	function sync() {
		syncDom.setAttribute('data-sync-state', 'syncing');
		var opts = {
			live: true
		};
		db.sync(remoteCouch, opts, syncError);
	}

	// EDITING STARTS HERE (you dont need to edit anything below this line)

	// There was some form or error syncing
	function syncError() {
		syncDom.setAttribute('data-sync-state', 'error');
	}

	// User has double clicked a history, display an input so they can edit the amount
	function historyDblClicked(history) {
		var div = document.getElementById('li_' + history._id);
		var inputEdithistory = document.getElementById('input_' + history._id);
		div.className = 'editing';
		inputEdithistory.focus();
	}

	// If they press enter while editing an entry, blur it to trigger save
	// (or delete)
	function historyKeyPressed(history, event) {
		if (event.keyCode === ENTER_KEY) {
			var inputEdithistory = document.getElementById('input_' + history._id);
			inputEdithistory.blur();
		}
	}

	// Given an object representing a history, this will create a list item
	// to display it.
	function createhistoryListItem(history) {
		// var checkbox = document.createElement('input');
		// checkbox.className = 'toggle';
		// checkbox.type = 'checkbox';
		// checkbox.addEventListener('change', checkboxChanged.bind(this, history));


		var date = document.createElement('date');
		date.appendChild(document.createTextNode(history.date));
		date.className = 'date';

		var label = document.createElement('label');
		label.appendChild(document.createTextNode(history.category));
		label.className = 'label';

		var deleteLink = document.createElement('button');
		deleteLink.className = 'remove';
		deleteLink.appendChild(document.createTextNode("-"));
		deleteLink.addEventListener('click', deleteButtonPressed.bind(this, history));

		var divDisplay = document.createElement('div');
		divDisplay.className = 'view';
		//divDisplay.appendChild(checkbox);
		divDisplay.appendChild(date);
		divDisplay.appendChild(label);
		divDisplay.appendChild(deleteLink);

		var inputEdithistory = document.createElement('input');
		inputEdithistory.id = 'input_' + history._id;
		inputEdithistory.className = 'edit';
		inputEdithistory.value = history.amount;
		inputEdithistory.addEventListener('keypress', historyKeyPressed.bind(this, history));
		inputEdithistory.addEventListener('blur', historyBlurred.bind(this, history));

		var li = document.createElement('li');
		li.id = 'li_' + history._id;
		li.appendChild(divDisplay);
		li.appendChild(inputEdithistory);

		// if (history.completed) {
		// 	li.className += 'complete';
		// 	checkbox.checked = true;
		// }

		return li;
	}

	function redrawHistoryUI(historys) {
		var ul = document.getElementById('history-list');
		ul.innerHTML = '';
		historys.forEach(function(history) {
			ul.appendChild(createhistoryListItem(history.doc));
		});
	}


	addButton.onclick = function() {
		addHistoryItem(toMoney(newItemTextBox.value), createDate(), getSelectedCategory());
		newItemTextBox.value = '';
	}
	// function newItemKeyPressHandler(event) {
	// 	if (event.keyCode === ENTER_KEY) {
	// 		addHistoryItem(toMoney(newItemTextBox.value), createDate(), getSelectedCategory());
	// 		newItemTextBox.value = '';
	// 	}
	// }

	// function addEventListeners() {
	// 	newItemTextBox.addEventListener('keypress', newItemKeyPressHandler, false);
	// }

	//addEventListeners();
	showHistoryItems();

	if (remoteCouch) {
		sync();
	}



	$(document).ready(function() {

		$(document).on("mousedown touchstart", ".type div", function() {
			deactivateAllCategories();
			activateCategory(this);
		});

		$('input[type="text"]').click(function() {
			$(this).select();
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

		// $(document).on("mousedown touchstart", "#add", function() {
		// 	createLogItem($('.amount').val(), getSelectedCategory());
		// 	$(".amount").val("$0.00");
		// });

		// $(document).on("mousedown touchstart", ".remove", function() {
		// 	console.log(event);
		// 	('*[data-guid="' + thisGuid + '"]').remove();
		// });

	});


	/*
	 * Takes in a dollar amount and category
	 * creates html elements for a log item in the transaction history.
	 */
	// function createLogItem(amount, category) {
	// 	$('.history').prepend('<div class="entry" data-guid="' + makeGuid() + '"><div class="date">' + createDate() + '</div><div class="label" ><span>' + category + '</span></div><input type="text" data-mask="money" value="' + toMoney(amount) + '"></input><button class="remove" data-guid="' + makeGuid() + '">-</button></div>');
	// }



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
		return;
	}

	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
			.toString(16)
			.substring(1);
	}

	function makeGuid() {
		return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
			s4() + '-' + s4() + s4() + s4();
	}

})();