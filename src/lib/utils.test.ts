/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatRuntime,
  formatYear,
  formatRating,
  getMediaTitle,
  truncateText,
  normalizeSearchQuery,
  getImageUrl,
  formatTime
} from './utils';

test('formatTime formats seconds into MM:SS or HH:MM:SS', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(3599), '59:59');
  assert.equal(formatTime(3600), '1:00:00');
  assert.equal(formatTime(3665), '1:01:05');
  assert.equal(formatTime(7325), '2:02:05');
  assert.equal(formatTime(-1), '00:00');
  assert.equal(formatTime(NaN), '00:00');
});

test('formatRuntime handles various minute inputs', () => {
  assert.equal(formatRuntime(169), '2h 49m');
  assert.equal(formatRuntime(60), '1h');
  assert.equal(formatRuntime(45), '45m');
  assert.equal(formatRuntime(0), 'N/A');
  assert.equal(formatRuntime(undefined), 'N/A');
});

test('formatYear extracts 4-digit years correctly', () => {
  assert.equal(formatYear('2024-03-01'), '2024');
  assert.equal(formatYear('1999-12-31'), '1999');
  assert.equal(formatYear(''), '');
  assert.equal(formatYear(null), '');
  assert.equal(formatYear('invalid'), '');
});

test('formatRating formats floats to 1 decimal place', () => {
  assert.equal(formatRating(8.567), '8.6');
  assert.equal(formatRating(9), '9.0');
  assert.equal(formatRating(0), 'NR');
  assert.equal(formatRating(null), 'NR');
});

test('getMediaTitle handles movie vs tv name fallbacks', () => {
  assert.equal(getMediaTitle({ title: 'Dune: Part Two' }), 'Dune: Part Two');
  assert.equal(getMediaTitle({ name: 'Shogun' }), 'Shogun');
  assert.equal(getMediaTitle({ original_title: 'Original Title' }), 'Original Title');
  assert.equal(getMediaTitle({}), 'Untitled');
});

test('truncateText truncates safely', () => {
  assert.equal(truncateText('Hello world', 5), 'Hello...');
  assert.equal(truncateText('Short', 10), 'Short');
  assert.equal(truncateText('', 5), '');
});

test('normalizeSearchQuery trims and removes extra spaces', () => {
  assert.equal(normalizeSearchQuery('   Interstellar   2014  '), 'interstellar 2014');
});

test('getImageUrl generates correct TMDB image path', () => {
  assert.equal(getImageUrl('/d5NXSklXo0qyIYkgV94XAgMIckC.jpg', 'w500'), 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg');
  assert.equal(getImageUrl(null), '');
});
