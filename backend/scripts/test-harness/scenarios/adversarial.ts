import { Scenario } from '../types';

export const adversarialScenarios: Scenario[] = [
  {
    name: 'Adversarial - Extremely long input',
    messages: ['x'.repeat(4000)], // Large input
    assert: (response) => {
      // Should not crash, should return something string-like
      return typeof response?.reply === 'string' && response.reply.length > 0;
    }
  },
  {
    name: 'Adversarial - Mixed language',
    messages: ['chbik tu veux pas t3awenni in finding a part?'],
    assert: (response) => {
      // Should not crash, should stay on topic
      return typeof response?.reply === 'string';
    }
  },
  {
    name: 'Adversarial - Empty string',
    messages: [' '],
    assert: (response) => {
      return typeof response?.reply === 'string';
    }
  }
];
