(function (u) {
/*
	Form validation module for the mandoo JavaScript library
	Copyright (c) 2009 E. Myller (emyller.net)
*/
var
C = 'u-form_validation-',
RE = [
	/^([\w-]+)(?:\((.+)\))?$/,
	/([#Aa\*])/g
],
FRAGMENTS = {
	'#': '\\d', '*': '.', 'a': '[a-z]', 'A': '[A-Z]'
},
PARSE_REPLACE = function (a, m) {
	return FRAGMENTS[m];
},

SUBMIT = function (e) {
	!u(this).validate() && e.preventDefault();
};

u.mod(
/* info */{
	name: 'form_validation',
	version: .1
},

/* dependencies */
[
	// none
],

/* core */ {

FormValidation: u.Class({
	__rules: {
		// simple rules
		required: /./,
		email: /^[\w\d\.-]+@(?:[\w\d-]+\.)+[\w\d-]{2,3}$/,
		digits: /^(?:\d+)?$/,
		letters: /^(?:[a-zA-Z\s-]+)?$/,

		// dynamic rules
		match: function (field) {
			return this.val() === u('#'+field).val();
		},
		format: function (str) {
			return !this.val() || new RegExp(str.replace(RE[1], PARSE_REPLACE)).test(this.val());
		},
		length: function (n) {
			return !this.val().length || this.val().length == n;
		},
		min: function (n) {
			return this.val().length >= n;
		},
		max: function (n) {
			return this.val().length <= n;
		}
	},

	errors: {},
	rules: [],
	filters: [],

	__construct: function (form, rules, options) {
		this.form = u(u(form)[0]);
		this.fields = u(':input[type!=submit]', form);
		this.fieldsIndex = this.form[0].elements;

		this.options = options = u.extend({
			callbacks: [
				u.FormValidation.HIGHLIGHT_FIELDS,
				u.FormValidation.FOCUS_FIRST
			],
			filters: {},
			errorMessages: {}
		}, options || {});

		this.errors['*'] = {};

		for (var i = -1, id; this.fields[++i];) {
			id = u(this.fields[i]).attr('id');

			this.rules[id] = [];

			if (rules['*'])
				this.rules[id] = rules['*'].split(',');
			if (rules[id])
				this.rules[id] = this.rules[id].concat(rules[id].split(','));

			options.filters[id] = (options.filters['*'] || []).concat(options.filters[id] || []);
		}

		this.form[0].validation = this;

		this.form.submit(SUBMIT);
	},

	// check the form fields
	validate: function () {
		for (var i = -1, id, field, allValid = 1; this.fields[++i];) {
			field = u(this.fields[i]);
			id = field.attr('id');

			this.errors[id] = [];

			// apply the filters
			for (var j = -1; this.options.filters[id][++j];)
				field.val(this.options.filters[id][j](field.val()));

			// check the fields agains the rules
			for (var j = -1, m, r, valid = 1; this.rules[id][++j];) {
				m = this.rules[id][j].match(RE[0]);
				r = u.FormValidation.rules[m[1]];

				// abort if there's not such rule
				!r && u.error('No such validation rule (' + m[1] + ').');

				valid = m[2] ?
				// rule with parameter
					r.call(field, m[2]) :
				// predefined rule
					r.test(field.val());

				if (!valid) {
					allValid = 0;
					this.errors[id].push(m[1]);
				}
			}
		}

		for (var i = -1; this.options.callbacks[++i];)
			this.options.callbacks[i].call(this);

		return !!allValid;
	},

	/* error feedback predefined functions */
	__HIGHLIGHT_FIELDS: function () {
		for (var id in this.errors) u(this.fieldsIndex[id])
			[this.errors[id].length ? 'addClass' : 'rmClass'](C+'field_error');
	},
	__FOCUS_FIRST: function () {
		for (var id in this.errors) if (this.errors[id].length) {
			u(this.fieldsIndex[id]).highlight()[0].focus();
			break;
		}
	},
	__SHOW_ERROR_LIST: function () {
		// clean any error message
		this.form.first('.'+C+'error_list').remove();

		var c = u.create('ul.'+C+'error_list'), e, msgs;

		for (var id in this.errors)
		for (var i in this.errors[id]) {
			msgs = this.options.errorMessages;
			e = this.errors[id][i];

			c.append('li')
				.add('strong', u('label[for='+id+']').text())
				.add('', ' '+(msgs[id] && msgs[id][e] || msgs['*'] && msgs['*'][e] || e));
			break;
		}

		e && this.form.prepend(c).slideDown({ speed: 'faster' }).fadeIn();
	}
})

},

/* elements methods */ {
	validation: function (rules, options) {
		return new u.FormValidation(this.filter('form')[0], rules, options);
	},
	validate: function () {
		return this[0].validation && this[0].validation.validate();
	}
}
);
})(mandoo);