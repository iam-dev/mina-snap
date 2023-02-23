export const formatAccountAddress = (address: string) => {
  const firstFiveCharacters = address.slice(0, 10);
  const lastFiveCharacters = address.slice(address.length - 10, address.length);
  return firstFiveCharacters + '...' + lastFiveCharacters;
};
