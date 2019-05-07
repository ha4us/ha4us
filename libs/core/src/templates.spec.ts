import { test } from 'ava';
import {
  render,
  addTemplateHelpers,
  resetTemplateHelpers,
  compile,
} from './templates';

test('basic template', t => {
  t.is(render('hello ${user}!', { user: 'world' }), 'hello world!');
});

test('template with a simple helper', t => {
  t.is(
    render('hello ${$upper(user)}!', {
      user: 'world',
      upper: 'world',
    }),
    'hello WORLD!'
  );
});

test('html escape by default', t => {
  t.is(
    render('hello <b>${user}</b>!', {
      user: '<i>world</i>',
    }),
    'hello <b>&lt;i&gt;world&lt;/i&gt;</b>!'
  );
});
test('disable html escape with square brackets', t => {
  t.is(
    render('hello <b>%{user}</b>!', {
      user: '<i>world</i>',
    }),
    'hello <b><i>world</i></b>!'
  );
});

test('ternary operators', t => {
  t.is(render('${data?"Open":"Closed"}', { data: true }), 'Open');
  t.is(render('${data>2?"Greater 2!":"Bummer"}', { data: 3 }), 'Greater 2!');
  t.is(
    render('${(data<=2)?"LTE2":(data<4)?"Exact 3!":"GTE4"}', { data: 3 }),
    'Exact 3!'
  );
});
test('compile with own helpers', t => {
  function $test() {
    return 'hello world';
  }
  const tpl = compile('${$test()}', { $test });
  t.is(tpl(''), 'hello world');
});
test('add custom helpers', t => {
  function $test() {
    return 'hello world';
  }
  function $upper(input: string) {
    return input.toUpperCase();
  }
  addTemplateHelpers($test, $upper);

  t.is(render('${$upper($test())}'), 'HELLO WORLD');

  resetTemplateHelpers();

  t.throws(() => {
    render('${$upper($test())}');
  }, '$test is not defined');
});

test('currency helper', t => {
  t.is(render('${$currency(amount)}', { amount: 1.236 }), '1,24 €');
  t.is(render('${$currency(amount,"$")}', { amount: 1.236 }), '1,24 $');
});

test('date helper', t => {
  t.is(
    render('${$date(dateStr)} is not ${$date(date,"dd.MM.yy")}', {
      dateStr: '2018-11-05T18:34:23.333',
      date: new Date(0),
    }),
    '05.11.2018 18:34:23 is not 01.01.70'
  );
});

test('format helper', t => {
  t.is(
    render('Die Temperatur ist ${$format("%,1f",value)}°C !', {
      value: 23.1243,
    }),
    'Die Temperatur ist 23,1°C !'
  );
});

test('Javascript in template', t => {
  const template = `<% for (let i=1;i<10;i++) { print('A') } %>`;
  t.is(render(template, {}), 'AAAAAAAAA');
});
