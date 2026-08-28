/**
 * Convert number to French words for Tunisian Currency (Dinars and Millimes)
 * Example: 172.550 => "Cent soixante douze dinars et cinq cent cinquante millimes"
 */

const UNITS = [
  '',
  'un',
  'deux',
  'trois',
  'quatre',
  'cinq',
  'six',
  'sept',
  'huit',
  'neuf',
  'dix',
  'onze',
  'douze',
  'treize',
  'quatorze',
  'quinze',
  'seize',
  'dix-sept',
  'dix-huit',
  'dix-neuf',
];

const TENS = [
  '',
  'dix',
  'vingt',
  'trente',
  'quarante',
  'cinquante',
  'soixante',
  'soixante-dix',
  'quatre-vingt',
  'quatre-vingt-dix',
];

function convertLessThanThousand(n: number): string {
  if (n === 0) return '';

  let result = '';

  if (n >= 100) {
    const hundreds = Math.floor(n / 100);
    const rest = n % 100;
    if (hundreds === 1) {
      result += 'cent';
    } else {
      result += UNITS[hundreds] + ' cent';
      if (rest === 0) result += 's';
    }
    if (rest > 0) result += ' ';
    n = rest;
  }

  if (n === 0) return result.trim();

  if (n < 20) {
    result += UNITS[n];
  } else if (n < 70) {
    const ten = Math.floor(n / 10);
    const unit = n % 10;
    result += TENS[ten];
    if (unit === 1) {
      result += ' et un';
    } else if (unit > 1) {
      result += ' ' + UNITS[unit];
    }
  } else if (n < 80) {
    const unit = n - 60;
    result += 'soixante';
    if (unit === 11) {
      result += ' et onze';
    } else {
      result += ' ' + UNITS[unit];
    }
  } else if (n < 90) {
    const unit = n - 80;
    result += 'quatre-vingt';
    if (unit === 0) {
      result += 's';
    } else {
      result += ' ' + UNITS[unit];
    }
  } else {
    const unit = n - 80;
    result += 'quatre-vingt ' + UNITS[unit];
  }

  return result.trim();
}

function integerToFrenchWords(n: number): string {
  if (n === 0) return 'zéro';

  let result = '';

  if (n >= 1_000_000) {
    const millions = Math.floor(n / 1_000_000);
    if (millions === 1) {
      result += 'un million ';
    } else {
      result += convertLessThanThousand(millions) + ' millions ';
    }
    n %= 1_000_000;
  }

  if (n >= 1_000) {
    const thousands = Math.floor(n / 1_000);
    if (thousands === 1) {
      result += 'mille ';
    } else {
      result += convertLessThanThousand(thousands) + ' mille ';
    }
    n %= 1_000;
  }

  if (n > 0) {
    result += convertLessThanThousand(n);
  }

  return result.trim();
}

export function amountToTunisianWords(amount: number): string {
  if (isNaN(amount) || amount < 0) return 'Zéro dinar';

  const rounded = Math.round(amount * 1000) / 1000;
  const dinars = Math.floor(rounded);
  const millimes = Math.round((rounded - dinars) * 1000);

  let dinarStr = '';
  if (dinars === 0) {
    dinarStr = 'Zéro dinar';
  } else if (dinars === 1) {
    dinarStr = 'Un dinar';
  } else {
    const words = integerToFrenchWords(dinars);
    dinarStr = words.charAt(0).toUpperCase() + words.slice(1) + ' dinars';
  }

  if (millimes === 0) {
    return dinarStr;
  }

  let millimeStr = '';
  if (millimes === 1) {
    millimeStr = 'un millime';
  } else {
    millimeStr = integerToFrenchWords(millimes) + ' millimes';
  }

  return `${dinarStr} et ${millimeStr}`;
}
