import { useEffect, useMemo, useState } from "react";
import { parseDeskInput } from "../shared-ui";

export function useDeskCodes(id: string) {
  const [deskInput, setDeskInput] = useState("");
  const [selectedDesk, setSelectedDesk] = useState("");
  const deskStorageKey = `uu-desk-codes:${id}`;
  const deskCodes = useMemo(() => parseDeskInput(deskInput), [deskInput]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(deskStorageKey);
    if (saved) setDeskInput(saved);
  }, [deskStorageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (deskInput.trim()) window.localStorage.setItem(deskStorageKey, deskInput);
    else window.localStorage.removeItem(deskStorageKey);
  }, [deskInput, deskStorageKey]);

  useEffect(() => {
    if (!deskCodes.length) {
      setSelectedDesk("");
      return;
    }
    if (!selectedDesk || !deskCodes.includes(selectedDesk)) {
      setSelectedDesk(deskCodes[0]);
    }
  }, [deskCodes, selectedDesk]);

  return {
    deskInput,
    setDeskInput,
    deskCodes,
    selectedDesk,
    setSelectedDesk,
  };
}
