// TODO: maybe overthink this file / placement of hotkeys

//	overwolf.settings.registerHotKey( // TODO: remove again if not used
//				"hide_match_window",
//				function (arg) {
//					if (arg.status == "success") {
//						// TODO: hide window during Tab is pressed
//						WindowController.minimizeWindow();
//						window.setTimeout(
//								WindowController.restoreMatch,
//						1000)
//					}
//				}
//		);
//	jQuery(window).on('keydown', keydownhandler);

//	function keyuphandler (e){
//		if (e.which == 9) {
//			alert('tab up');
//			jQuery(window).off('keyup', keyuphandler);
//			jQuery(window).on('keydown', keydownhandler);
//		}
//	}
//	function keydownhandler(e){
//		if (e.which == 9) {
//			alert('tab down');
//			jQuery(window).off('keydown', keydownhandler);
//			jQuery(window).on('keyup', keyuphandler);
//		}
//	}