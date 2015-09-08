require('global');
var can = require('can');
var WindowCtrl = require('WindowCtrl');

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
		debugger;

		WindowCtrl.prototype.init.apply(this, arguments);
		var self = this;
		this.element.html(can.view(this.options.feedbackTmpl));
	},
	'{formSubmit} click': function ($el, ev) {
		var self = this;
		debugger;
		$.post(FEEDBACK_URL, {
			'mail': $(self.options.formMail).val(),
			'message': $(self.options.formMessage).get(0).value
		}).success(function(){
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
module.exports = FeedbackCtrl;