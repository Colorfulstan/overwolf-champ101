"use strict";
steal(
	'can'
	, 'WindowCtrl.js'
	, 'global.js'
	, function (can
		, /**WindowCtrl*/ WindowCtrl
		) {


		/**
		 * Controller for the "Feedback" view (feedback.html / feedback.js)
		 * @inheritDoc WindowCtrl
		 */
		var FeedbackCtrl = WindowCtrl.extend('FeedbackCtrl', {
			defaults: {
				name: 'Feedback'
				, 'form': '#feedback-form'
				, 'formSubmit': '#submit-feedback'
				, 'formMail': '#mail'
				, 'formMessage': '#message'
				, 'formResponseDiv': '#response',
				feedbackTmpl: 'templates/feedback.mustache'
			}
		}, {
			init: function () {
				WindowCtrl.prototype.init.apply(this, arguments);
				this.element.html(can.view(this.options.feedbackTmpl));
			},
			'{formSubmit} click': function ($el, ev) {
				var self = this;
				debugger;
				$.post(FEEDBACK_URL, {
					'mail': $(self.options.formMail).val(),
					'message': $(self.options.formMessage).get(0).value
				}).success(function () {
					steal.dev.log(arguments);
					var $responseDiv = $(self.options.formResponseDiv);
					$responseDiv.text('Your Feedback has been received');
					$responseDiv.addClass('success');
				}).fail(function () {
					steal.dev.log(arguments);
					var $responseDiv = $(self.options.formResponseDiv);
					$responseDiv.text('Something went wrong.');
					$responseDiv.addClass('error');
				})
			}

		});
		return FeedbackCtrl;
	});
