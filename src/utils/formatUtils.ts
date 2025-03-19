export const formatDateHTML = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const formatAmount = (value: string): string => {
  // get rid of non-digit non period character
  let cleaned = value.replace(/[^0-9.]/g, "");
  // remove extra periods, leaving only the first one
  const periodCount = (cleaned.match(/\./g) || []).length;
  if (periodCount > 1) {
    cleaned = cleaned.replace(/\./g, "");
    cleaned =
      cleaned.slice(0, cleaned.indexOf(".") + 1) +
      cleaned.slice(cleaned.indexOf(".") + 1);
  }
  const formatted = cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return formatted;
};
