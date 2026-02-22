export function sortByNearestExpiration(domains) {
  return [...domains].sort((a, b) => {
    const dateA = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
    const dateB = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
    return dateA - dateB; 
  });
}
