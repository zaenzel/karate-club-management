import { HealthController } from './health.controller.js';

describe('HealthController', () => {
  it('melaporkan status ok', () => {
    expect(new HealthController().check()).toEqual({ status: 'ok' });
  });
});
