var sitekey = '6Lf8FTIUAAAAAEH7vOdPzp19f0klLdJJkx0K4_CU';

var widgets = [
	'g-recaptcha-widget1',
	'g-recaptcha-widget2',
	'g-recaptcha-widget3',
	'g-recaptcha-widget4',
	'g-recaptcha-widget5',
	'g-recaptcha-widget6',
	'g-recaptcha-widget7'
];

var onloadCallback = function () {
	$.each(widgets, function (index, value) {
		if ($('#' + value).length) {
			var grecap_id = grecaptcha.render(value, {
				'sitekey': sitekey
			});

			$('#' + value).attr('data-grecapid', grecap_id);
		}
	});
};
