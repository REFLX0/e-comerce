export function toolWasCalled(response: any, toolName: string): boolean {
  if (!response?.clientActions) return false;
  
  // Checking for clientActions which the ChatService outputs instead of raw tool_calls
  // The ChatService internally handles tool_calls and returns clientActions for ADD_TO_CART
  if (toolName === 'add_to_cart') {
    return response.clientActions.some((action: any) => action.type === 'ADD_TO_CART');
  }

  // If we just want to ensure it answered with products from search (which it puts in markdown)
  if (toolName === 'search_products' || toolName === 'find_vehicle_parts') {
    return responseContainsMarkdownLink(response);
  }

  return false;
}

export function responseContainsAll(response: any, substrings: string[]): boolean {
  if (!response?.reply) return false;
  const reply = response.reply.toLowerCase();
  return substrings.every(sub => reply.includes(sub.toLowerCase()));
}

export function responseContainsMarkdownLink(response: any): boolean {
  if (!response?.reply) return false;
  const markdownLinkRegex = /\[.*\]\(.*\)/;
  return markdownLinkRegex.test(response.reply);
}

export function responseDoesNotContain(response: any, denylist: string[]): boolean {
  if (!response?.reply) return false;
  const reply = response.reply.toLowerCase();
  return !denylist.some(deny => reply.includes(deny.toLowerCase()));
}

export function clientActionShapeValid(response: any, expectedType: string): boolean {
  if (!response?.clientActions || !Array.isArray(response.clientActions)) return false;
  return response.clientActions.some((action: any) => action.type === expectedType);
}
