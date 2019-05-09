import test from 'ava';

import { treeify } from './treeify';

test('handle empty ', t => {
  const result = treeify([]);
  t.is(result.length, 0);
});

test('handle  only roots ', t => {
  const result = treeify(['a', 'b', 'c']);
  t.is(result.length, 3);
  t.is(result.filter(node => node.virtual).length, 0);

  // no parents
  t.is(result.map(node => node.parent).join(''), '');

  // no children
  t.is(result.map(node => node.children.join('')).join(''), '');

  t.log(result);
});

test('handle single neested', t => {
  const result = treeify(['a/b/c/d/e']);

  t.is(result.length, 5);
  t.is(
    result
      .filter(node => node.virtual)
      .map(node => node.path.join('/'))
      .join(','),
    'a/b/c/d,a/b/c,a/b,a'
  );
});

test('order of input doesnt matter', t => {
  const result = treeify(['a/b', 'a']);
  t.is(result.length, 2);

  const result2 = treeify(['a', 'a/b']);
  t.is(result2.length, 2);

  t.deepEqual(result[0], result2[1]);
  t.deepEqual(result[1], result2[0]);
});

test('Can treeify paths of realistic topics', t => {
  const paths = [
    'hm/Living Room/Lamp',
    'hm/Living Room/Socket',
    'hm',
    'hm/Kitchen',
    'hue/Living Room/Bulb',
    'hue!',
  ];

  const result = treeify(paths, data => data);

  t.is(result.length, 9);
  t.is(
    result
      .filter(node => node.virtual)
      .map(node => node.path.join('/'))
      .join(','),
    'hm/Living Room,hue/Living Room,hue'
  );
});
