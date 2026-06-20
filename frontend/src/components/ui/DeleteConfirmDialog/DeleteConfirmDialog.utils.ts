import type { Entity, EntityConfig } from "../../../types/entities";

export const getDisplayText = (item: Entity, config: EntityConfig<any>): string =>
  config.displayFields
    .map(field => item[field])
    .filter(Boolean)
    .join(" ");

export const getRecordWord = (count: number): string => {
    const lastDigit = count % 10;
    const lastTwoDigits = count % 100;
    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return "записей";
    if (lastDigit === 1) return "запись";
    if (lastDigit >= 2 && lastDigit <= 4) return "записи";
    return "записей";
};