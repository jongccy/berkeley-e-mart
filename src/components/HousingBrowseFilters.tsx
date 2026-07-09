"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { HOUSING_CATEGORY } from "@/lib/constants";
import {
  HOUSING_BATH_FILTER_OPTIONS,
  HOUSING_BED_FILTER_OPTIONS,
  HOUSING_SQFT_FILTER_OPTIONS,
  type HousingFilterParams,
} from "@/lib/housing-browse-filters";

type Props = {
  mode: "select" | "checkbox";
  initialHousingSelected: boolean;
  values: HousingFilterParams;
  fieldClass: string;
};

export function HousingBrowseFilters({
  mode,
  initialHousingSelected,
  values,
  fieldClass,
}: Props) {
  const panelId = useId();
  const [visible, setVisible] = useState(initialHousingSelected);

  const syncFromForm = useCallback(() => {
    const root = document.getElementById(panelId);
    const form = root?.closest("form");
    if (!form) return;

    if (mode === "select") {
      const select = form.querySelector<HTMLSelectElement>(
        'select[name="category"]'
      );
      setVisible(select?.value === HOUSING_CATEGORY);
      return;
    }

    const housingCheckbox = form.querySelector<HTMLInputElement>(
      `input[name="category"][value="${HOUSING_CATEGORY}"]`
    );
    setVisible(housingCheckbox?.checked ?? false);
  }, [mode, panelId]);

  useEffect(() => {
    const root = document.getElementById(panelId);
    const form = root?.closest("form");
    if (!form) return;

    form.addEventListener("change", syncFromForm);
    return () => form.removeEventListener("change", syncFromForm);
  }, [panelId, syncFromForm]);

  return (
    <div
      id={panelId}
      hidden={!visible}
      className="space-y-3 rounded-lg border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-950/50"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        Housing filters
      </p>
      <p className="text-xs text-zinc-500">All optional — leave as Not sure if you are still deciding.</p>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Beds
          </label>
          <select
            name="min_beds"
            defaultValue={values.min_beds ?? ""}
            className={fieldClass}
          >
            {HOUSING_BED_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "any"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Baths
          </label>
          <select
            name="min_baths"
            defaultValue={values.min_baths ?? ""}
            className={fieldClass}
          >
            {HOUSING_BATH_FILTER_OPTIONS.map((opt) => (
              <option key={opt.value || "any"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Sqft
        </label>
        <select
          name="min_sqft"
          defaultValue={values.min_sqft ?? ""}
          className={fieldClass}
        >
          {HOUSING_SQFT_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value || "any"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
