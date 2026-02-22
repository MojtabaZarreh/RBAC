import dayjs from "dayjs";
import jalaliday from "jalaliday";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(jalaliday);
dayjs.extend(customParseFormat);

export function toPersianDate(dateString) {
  if (!dateString) return "";
  const date = dayjs(dateString).calendar("jalali"); 
  if (!date.isValid()) return "";
  return date.format("YYYY/MM/DD");
}

export function formatToISODate(persianDate) {
  if (!persianDate) return null;
  const date = dayjs(persianDate, "YYYY/MM/DD", { jalali: true });
  if (!date.isValid()) return null;

  return date.format("YYYY-MM-DD");
}
