u.require('effects');

(function () {

new u.Module("form_validation", { version: .2, hasCSS: !0 },
// core
{ FormValidation: u.Class({
	__init__: function (form, rules, messages, options) {
		this.form = form;
		this.fields = u(":input:not(:submit,[type=hidden])");
		this.rules = {};
		this.messages = {};
		for (var i = -1, name; this.fields[++i];) {
			name = this.fields[i].name || this.fields[i].id;
			this.rules[name] = [];
			this.messages[name] = [];
			if (rules['*']) for (var j = -1, p; rules['*'][++j];)
				if (!(rules[name] && indexOf(rules[name], rules['*'][j]) !== -1)) {
					this.rules[name].push(rules['*'][j]);
					this.messages[name].push(messages['*'][j]); }
			if (rules[name]) {
				Array.prototype.push.apply(this.rules[name], rules[name]);
				Array.prototype.push.apply(this.messages[name], messages[name]); }}
		var this_ = this;
		u(form).on('submit', function (e) {
			!this_.run() && e.preventDefault(); }); },

	run: function () {
		for (var i = -1, valid = !0, errors = {}, name; this.fields[++i];) {
			name = this.fields[i].name || this.fields[i].id;
			for (var j = -1, pass; this.rules[name][++j];) {
				pass = this.rules[name][j].test
					? this.rules[name][j].test(this.fields[i].value)
					: this.rules[name][j].call(this.fields[i]);
				if (pass !== !0) {
					(errors[name] = errors[name] || []).push(message(this.messages[name][j], pass));
					valid = !1; }}}
		return valid; },

	$rules: {
		REQUIRED: /./,
		EMAIL: /^[\w\d\.-]+@(?:[\w\d-]+\.)+[\w\d-]{2,3}$/,
		DIGITS: /^(?:\d+)?$/,
		LETTERS: /^(?:[\D_]+)$/,
		MATCH: function (field) {
			return function () {
				var ref = u("#"+field)[0] || u(":input[name="+field+"]", this.form)[0];
				return this.value === ref.value
					|| { value: this.value, expected: ref.value }; }},
		FORMAT: function (str) {
			return function () {
				return !this.value || new RegExp(str.replace(/([#Aa\*])/g, function (a, m) {
					return ({ '#': "\\d", '*': ".", 'a': "[a-z]", 'A': "[A-Z]" })[m]; }), 'g').test(this.value)
						|| { value: this.value, expected: str }; }},
		LENGTH: function (n) {
			return function () {
				return this.value.length == n
					|| { n: this.value.length, expected: n }; }},
		MIN: function (n) {
			return function () {
				return this.value.length >= n
					|| { n: this.value.length, expected: n }; }},
		MAX: function (n) {
			return function () {
				return this.value.length <= n
					|| { n: this.value.length, expected: n }; }}}
})},

// methods for elements
{
	validation: function (rules, options) {
		for (var i = -1, forms = this.filter("form"); forms[++i];)
			new u.FormValidation(forms[i], rules, options); }
});

function indexOf(col, item) {
	for (var i = 0, l = col.length; i < l; i++)
		if (col[i] === item)
			return i;
	return -1; }

function message(str, info) {
	return str.replace(/%{(\w+)}/g, function (a, m) {
		return info[m]; }); }

})()
