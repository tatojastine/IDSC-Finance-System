import { useEffect, useState } from "react";

const currency = new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" });
export const manilaDay = new Intl.DateTimeFormat("sv-SE", { timeZone: "Asia/Manila", dateStyle: "short" });
const manilaTime = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium", timeStyle: "short" });
export const money = (centavos) => currency.format(centavos / 100);
export const dateTime = (date) => manilaTime.format(new Date(date));

export function toCentavos(value, field = "Amount in pesos") {
  if (!/^\d{1,8}(?:\.\d{1,2})?$/.test(value)) throw new Error(field + " must use at most two decimal places.");
  const [whole, decimals = ""] = value.split(".");
  return Number(whole) * 100 + Number(decimals.padEnd(2, "0"));
}

export function useResource(load) {
  const [result, setResult] = useState({});
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const requestId = { current: true };
    load().then(
      (data) => { if (requestId.current) setResult({ data, load, revision }); },
      (error) => { if (requestId.current) setResult({ error: error.message, load, revision }); }
    );
    return () => { requestId.current = false; };
  }, [load, revision]);
  const ready = result.load === load && result.revision === revision;
  return {
    data: ready ? result.data : undefined, error: ready ? result.error : "",
    refresh: () => setRevision((value) => value + 1)
  };
}
