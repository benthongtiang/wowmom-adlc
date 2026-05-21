'use strict';

const { GeocodingService } = require('../../../src/services');

describe('GeocodingService Unit Tests', () => {
  test('resolves "42 Babbage Way" to SF coordinates', async () => {
    const coords = await GeocodingService.geocode('42 Babbage Way');
    expect(coords).toEqual({ latitude: 37.7749, longitude: -122.4194 });
  });

  test('resolves "94102" to SF coordinates', async () => {
    const coords = await GeocodingService.geocode('94102');
    expect(coords).toEqual({ latitude: 37.7749, longitude: -122.4194 });
  });

  test('resolves "100 Peace Plaza" to coordinates', async () => {
    const coords = await GeocodingService.geocode('100 Peace Plaza');
    expect(coords).toEqual({ latitude: 37.7850, longitude: -122.4294 });
  });

  test('resolves other addresses to deterministic coordinates using string hashing', async () => {
    const addr = '555 Mission St';
    const coords1 = await GeocodingService.geocode(addr);
    const coords2 = await GeocodingService.geocode(addr);

    expect(coords1).toEqual(coords2);
    expect(typeof coords1.latitude).toBe('number');
    expect(typeof coords1.longitude).toBe('number');

    // Verify it differs from the hardcoded SF baseline or is jittered deterministically
    const otherAddr = '777 Valencia St';
    const otherCoords = await GeocodingService.geocode(otherAddr);
    expect(coords1).not.toEqual(otherCoords);
  });
});
