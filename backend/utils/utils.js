export function sanatizeRoom(input) {
  if (typeof input !== "string") return null;
  const cleanInput = input.trim();
  if (cleanInput.length < 1 || cleanInput.length > 64) return null;
  if (!/^[a-zA-Z0-9:_-]+$/.test(cleanInput)) return null;
  return cleanInput;
}

export function sanatizeContent(input){
  if (typeof input !== "string") return null;
  const cleanInput = input.trim();
  if (!cleanInput || cleanInput.length > 2000) return null;
  return cleanInput;
}