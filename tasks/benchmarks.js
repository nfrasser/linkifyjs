var ITERATIONS = 500;

function bench1(linkify) {
	// eslint-disable-next-line no-debugger
	debugger; // prevents V8 optimization
	delete require.cache[require.resolve('linkifyjs')];
	linkify = require('linkifyjs');
	// linkify.init();
	linkify.find('');
	// delete require.cache[require.resolve('moment')];
	// var moment = require('moment');
}

function bench2(linkify) {
	// eslint-disable-next-line no-debugger
	debugger; // prevents V8 optimization
	// linkify.tokenize('The URL is http://google.com The URL is http://google.com');
	// linkify.tokenize('google.com');
	// linkify.tokenize('I like google.com the most I like google.com the most');
	// linkify.tokenize('I like Google.com the most');
	// linkify.tokenize('there are two tests, brennan.com and nick.ca -- do they work?');
	// linkify.tokenize('there are two tests!brennan.com. and nick.ca? -- do they work?');
	// linkify.tokenize('This [i.imgur.com/ckSj2Ba.jpg)] should also work');
	// linkify.tokenize('A link is http://nick.is.awesome/?q=nick+amazing&nick=yo%29%30hellp another is http://nick.con/?q=look');
	// linkify.tokenize('SOme URLS http://google.com https://google1.com google2.com google.com/search?q=potatoes+oven goo.gl/0192n1 google.com?q=asda test bit.ly/0912j www.bob.com indigo.dev.soapbox.co/mobile google.com?q=.exe flickr.com/linktoimage.jpg');
	// linkify.tokenize('None.of these.should be.Links okay.please?');
	// linkify.tokenize('Here are some random emails: nick@soapbox.com, nick@soapbox.soda (invalid), Nick@dev.dev.soapbox.co, random nick.frasser_hitsend@http://facebook.com');
	// linkify.tokenize('t.c.com/sadqad is a great domain, so is ftp://i.am.a.b.ca/ okay?');
	// linkify.tokenize('This port is too short someport.com: this port is too long http://googgle.com:789023/myQuery this port is just right https://github.com:8080/SoapBox/jQuery-linkify/');
	//
	// Examples taken from https://markdown-it.github.io/linkify-it/
	linkify.tokenize(`\
%
% Regular links
%
My http://example.com site
My http://example.com/ site
http://example.com/foo_bar/
http://user:pass@example.com:8080
http://user@example.com
http://user@example.com:8080
http://user:pass@example.com
[https](https://www.ibm.com)[mailto](mailto:someone@ibm.com) % should not catch as auth (before @ in big link)
http://example.com:8080
http://example.com/?foo=bar
http://example.com?foo=bar
http://example.com/#foo=bar
http://example.com#foo=bar
http://a.in
HTTP://GOOGLE.COM
http://example.invalid % don't restrict root domain when schema exists
http://inrgess2 % Allow local domains to end with digit
http://999 % ..and start with digit, and have digits only
http://host-name % local domain with dash
>>example.com % markdown blockquote
>>http://example.com % markdown blockquote
http://lyricstranslate.com/en/someone-you-നിന്നെ-പോലൊരാള്‍.html % With control character

%
% localhost (only with protocol allowed)
%
//localhost
//test.123
http://localhost:8000?

%
% Other protocols
%
My ssl https://example.com site
My ftp://example.com site

%
% Neutral proto
%
My ssl //example.com site

%
% IPs
%
4.4.4.4
192.168.1.1/abc

%
% Fuzzy
%
test.example@http://vk.com
text:http://example.com/
google.com
google.com: // no port
s.l.o.w.io
a-b.com
GOOGLE.COM.
google.xxx // known tld

%
% Correct termination for . , ! ? [] {} () "" ''
%
(Scoped http://example.com/foo_bar)
http://example.com/foo_bar_(wiki)
http://foo.com/blah_blah_[other]
http://foo.com/blah_blah_{I'm_king}
http://foo.com/blah_blah_I'm_king
http://www.kmart.com/bestway-10'-x-30inch-steel-pro-frame-pool/p-004W007538417001P
http://foo.com/blah_blah_"doublequoted"
http://foo.com/blah_blah_'singlequoted'
(Scoped like http://example.com/foo_bar)
[Scoped like http://example.com/foo_bar]
{Scoped like http://example.com/foo_bar}
"Quoted like http://example.com/foo_bar"
'Quoted like http://example.com/foo_bar'
[example.com/foo_bar.jpg)]
http://example.com/foo_bar.jpg.
http://example.com/foo_bar/.
http://example.com/foo_bar,
https://github.com/markdown-it/linkify-it/compare/360b13a733f521a8d4903d3a5e1e46c357e9d3ce...f580766349525150a80a32987bb47c2d592efc33
https://www.google.com/search?sxsrf=ACYBGNTJFmX-GjNJ8fM-2LCkqyNyxGU1Ng%3A1575534146332&ei=Qr7oXf7rE4rRrgSEgrmoAw&q=clover&oq=clover&gs_l=psy-ab.3..0i67j0l9.2986.3947..4187...0.2..0.281.1366.1j0j5......0....1..gws-wiz.......0i71j35i39j0i131.qWp1nz4IJVA&ved=0ahUKEwj-lP6Iip7mAhWKqIsKHQRBDjUQ4dUDCAs&uact=5
https://ourworldindata.org/grapher/covid-deaths-days-since-per-million?zoomToSelection=true&time=9..&country=FRA+DEU+ITA+ESP+GBR+USA+CAN
http://example.com/foo_bar...
http://172.26.142.48/viewerjs/#../0529/slides.pdf
http://example.com/foo_bar..
http://example.com/foo_bar?p=10.
https://www.google.ru/maps/@59.9393895,30.3165389,15z?hl=ru
https://www.google.com/maps/place/New+York,+NY,+USA/@40.702271,-73.9968471,11z/data=!4m2!3m1!1s0x89c24fa5d33f083b:0xc80b8f06e177fe62?hl=en
https://www.google.com/analytics/web/?hl=ru&pli=1#report/visitors-overview/a26895874w20458057p96934174/
http://business.timesonline.co.uk/article/0,,9065-2473189,00.html
https://google.com/mail/u/0/#label/!!!Today/15c9b8193da01e65
http://example.com/123!
http://example.com/123!!!
http://example.com/foo--bar

% some sites have links with trailing dashes
http://www.bloomberg.com/news/articles/2015-06-26/from-deutsche-bank-to-siemens-what-s-troubling-germany-inc-
http://example.com/foo-with-trailing-dash-dot-.
<http://domain.com>
<http://domain.com>.
<http://domain.com/foo>
<http://domain.com/foo>.
<domain.com>
<domain.com>.
<domain.com/foo>
<user@domain.com>
<user@domain.com>.
<mailto:user@domain.com>

%
% Emails
%
test."foo".bar@gmail.co.uk!
"test@example.com"
name@example.com
>>name@example.com % markdown blockquote
mailto:name@example.com
MAILTO:NAME@EXAMPLE.COM
mailto:foo_bar@example.com
foo+bar@gmail.com
192.168.1.1@gmail.com
mailto:foo@bar % explicit protocol make it valid
(foobar email@example.com)
(email@example.com foobar)
(email@example.com)

%
% International
%
http://✪df.ws/123
http://xn--df-oiy.ws/123
a.ws
➡.ws/䨹
example.com/䨹
президент.рф

% Links below provided by diaspora* guys, to make sure regressions will not happen.
% Those left here for historic reasons.
http://www.bürgerentscheid-krankenhäuser.de
http://www.xn--brgerentscheid-krankenhuser-xkc78d.de
http://bündnis-für-krankenhäuser.de/wp-content/uploads/2011/11/cropped-logohp.jpg
http://xn--bndnis-fr-krankenhuser-i5b27cha.de/wp-content/uploads/2011/11/cropped-logohp.jpg
http://ﻡﻮﻘﻋ.ﻭﺯﺍﺭﺓ-ﺍﻼﺘﺻﺍﻼﺗ.ﻢﺻﺭ/
http://xn--4gbrim.xn----ymcbaaajlc6dj7bxne2c.xn--wgbh1c/

%
% Others...
%
｜www.google.com/www.google.com/foo｜bar % #46, asian vertical pipes
｜test@google.com｜bar
｜http://google.com｜bar

%
% Domains with multiple dashes
%
https://5b0ee223b312746c1659db3f--thelounge-chat.netlify.com/docs/
www.a--b.com
www.c--u.com
http://a---b.com/


%
% Not links
%
example.invalid
example.invalid/
http://.example.com
http://-example.com
hppt://example.com
example.coma
-example.coma
foo.123
localhost % only with protocol allowed
localhost/
///localhost % 3 '/' not allowed
///test.com
//test % Don't allow single level protocol-less domains to avoid false positives

_http://example.com
_//example.com
_example.com
http://example.com_
@example.com

node.js and io.js

http://
http://.
http://..
http://#
http://##
http://?
http://??
google.com:500000 // invalid port
show image.jpg
path:to:file.pm
/path/to/file.pl

%
% Not IPv4
%
1.2.3.4.5
1.2.3
1.2.3.400
1000.2.3.4
a1.2.3.4
1.2.3.4a

%
% Not email
%
foo@bar % Should be at second level domain & with correct tld
mailto:bar`);
}

[bench1, bench2].forEach((bench) => {
	// eslint-disable-next-line no-debugger
	debugger;
	// var usageInitial = process.memoryUsage();
	var linkify = require('linkifyjs');
	linkify.init();
	// var usageLinkify = process.memoryUsage();

	console.log('Doing ' + ITERATIONS + ' iterations...');

	// var usageBeforeIterations = process.memoryUsage();
	console.log('Starting...');
	var start = new Date().valueOf();
	for (var i = 0; i < ITERATIONS; i++) {
		bench(linkify);
	}
	var end = new Date().valueOf();
	// var usageAfterIterations = process.memoryUsage();

	console.log('End.');
	console.log('Total time (ms):', end - start);
	console.log('Average (ms):', (end - start) / ITERATIONS);
	// console.log('Memory usage:');
	// console.log('   Before require:\n', usageInitial);
	// console.log('   After require:\n', usageLinkify);
	// console.log('   Before benchmark:\n', usageBeforeIterations);
	// console.log('   After benchmark:\n', usageAfterIterations);
});
