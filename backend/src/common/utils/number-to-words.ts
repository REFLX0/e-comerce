/**
 * Converts a number into French words, specifically tailored for Tunisian Dinars and Millimes.
 * Example: 172.550 -> "Cent soixante-douze dinars et cinq cent cinquante millimes"
 */

const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const tens = ["", "dix", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingts", "quatre-vingt-dix"];

function convertHundreds(num: number): string {
  if (num === 0) return "";
  if (num < 20) return units[num];
  
  if (num < 100) {
    const t = Math.floor(num / 10);
    const u = num % 10;
    
    if (t === 7 || t === 9) {
      if (u === 0) return tens[t];
      if (u === 1 && t === 7) return "soixante et onze";
      return tens[t - 1] + "-" + units[10 + u];
    }
    
    if (u === 0) return tens[t];
    if (u === 1) return tens[t] + " et un";
    
    // For quatre-vingts, drop the s if followed by a number
    if (t === 8) return "quatre-vingt-" + units[u];
    
    return tens[t] + "-" + units[u];
  }
  
  const h = Math.floor(num / 100);
  const rem = num % 100;
  let res = "";
  
  if (h === 1) {
    res = "cent";
  } else {
    res = units[h] + " cent" + (rem === 0 ? "s" : "");
  }
  
  if (rem > 0) {
    res += " " + convertHundreds(rem);
  }
  
  return res;
}

function convertGroup(num: number): string {
  if (num === 0) return "zéro";
  
  let res = "";
  const billions = Math.floor(num / 1000000000);
  num %= 1000000000;
  const millions = Math.floor(num / 1000000);
  num %= 1000000;
  const thousands = Math.floor(num / 1000);
  const remainder = num % 1000;
  
  if (billions > 0) {
    res += convertHundreds(billions) + " milliard" + (billions > 1 ? "s " : " ");
  }
  if (millions > 0) {
    res += convertHundreds(millions) + " million" + (millions > 1 ? "s " : " ");
  }
  if (thousands > 0) {
    if (thousands === 1) {
      res += "mille ";
    } else {
      res += convertHundreds(thousands) + " mille ";
    }
  }
  if (remainder > 0 || res === "") {
    if (res !== "" && res.endsWith(" ")) {
      res += convertHundreds(remainder);
    } else {
      res = convertHundreds(remainder);
    }
  }
  
  return res.trim();
}

export function numberToWordsDT(amount: number): string {
  if (amount < 0) return "Moins " + numberToWordsDT(Math.abs(amount));
  
  const integerPart = Math.floor(amount);
  const decimalPart = Math.round((amount - integerPart) * 1000); // Millimes are 3 decimals
  
  let text = "";
  
  if (integerPart === 0) {
    text = "Zéro dinar";
  } else if (integerPart === 1) {
    text = "Un dinar";
  } else {
    text = convertGroup(integerPart) + " dinars";
  }
  
  if (decimalPart > 0) {
    if (decimalPart === 1) {
      text += " et un millime";
    } else {
      text += " et " + convertGroup(decimalPart) + " millimes";
    }
  }
  
  // Capitalize first letter
  return text.charAt(0).toUpperCase() + text.slice(1);
}
