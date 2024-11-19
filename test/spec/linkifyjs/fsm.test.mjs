import * as tk from 'linkifyjs/src/text.mjs';
import * as fsm from 'linkifyjs/src/fsm.mjs';
import { State } from 'linkifyjs/src/linkify.mjs';
import { expect } from 'chai';

describe('linkifyjs/fsm/State', () => {
	let Start, Num, Word;

	beforeEach(() => {
		State.groups = {};
		Start = new fsm.State();
		Start.tt('.', tk.DOT);
		Num = Start.tr(/[0-9]/, tk.NUM, { numeric: true });
		Num.tr(/[0-9]/, Num);
		Word = Start.tr(/[a-z]/i, tk.WORD, { ascii: true });
		Word.tr(/[a-z]/i, Word);
	});

	after(() => {
		State.groups = {};
	});

	it('Creates DOT transition on Start state', () => {
		expect(Object.keys(Start.j)).to.eql(['.']);
		expect(Start.j['.'].t).to.eql(tk.DOT);
	});

	it('Creates regexp number transitions on Start state', () => {
		expect(Start.jr.length).to.eql(2);
		expect(Start.jr[0][0].test('42')).to.be.ok;
		expect(Start.jr[0][1].t).to.eql(tk.NUM);
	});

	it('Creates regexp word transitions on start state', () => {
		expect(Start.jr.length).to.eql(2);
		expect(Start.jr[1][0].test('hello')).to.be.ok;
		expect(Start.jr[1][1].t).to.eql(tk.WORD);
	});

	it('Populates groups', () => {
		expect(State.groups).to.eql({
			numeric: [tk.NUM],
			ascii: [tk.WORD],
			asciinumeric: [tk.NUM, tk.WORD],
			alpha: [tk.WORD],
			alphanumeric: [tk.NUM, tk.WORD],
			domain: [tk.NUM, tk.WORD],
		});
	});

	describe('#has()', () => {
		it('Does not have # transition', () => {
			expect(Start.has('#')).to.not.be.ok;
		});

		it('Has . transition', () => {
			expect(Start.has('.')).to.be.ok;
		});

		it('Has exact . transition', () => {
			expect(Start.has('.', true)).to.be.ok;
		});

		it('Has x transition', () => {
			expect(Start.has('x')).to.be.ok;
		});

		it('Does not have exact # transition', () => {
			expect(Start.has('#', true)).to.not.be.ok;
		});
	});

	describe('Add schemes', () => {
		beforeEach(() => {
			Start.ts('http', 'http', { ascii: true, scheme: true });
			Start.ts('https', 'https', { ascii: true, scheme: true });
			Start.ts('view-source', 'view-source', { domain: true, scheme: true });
		});

		it('Adds tokens to ascii group', () => {
			expect(State.groups.ascii).not.contains('htt');
			expect(State.groups.ascii).contains('http');
			expect(State.groups.ascii).contains('https');
			expect(State.groups.ascii).not.contains('view-source');
		});

		it('Adds tokens to domain group', () => {
			expect(State.groups.domain).not.contains('htt');
			expect(State.groups.domain).contains('http');
			expect(State.groups.domain).contains('https');
			expect(State.groups.domain).contains('view-source');
		});

		it('Adds tokens to scheme group', () => {
			expect(State.groups.scheme).contains('http');
			expect(State.groups.scheme).contains('https');
			expect(State.groups.scheme).contains('view-source');
		});
	});
});
