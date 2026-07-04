"use client";

import { useActionState, useState } from "react";
import {
  reportListingFromForm,
  reportUserFromForm,
  type ReportFormState,
} from "@/app/actions/reports";
import { REPORT_REASONS } from "@/lib/report-reasons";

type ListingProps = {
  kind: "listing";
  listingId: string;
  label?: string;
  className?: string;
};

type UserProps = {
  kind: "user";
  reportedUserId: string;
  listingId?: string;
  conversationId?: string;
  label?: string;
  className?: string;
};

type Props = ListingProps | UserProps;

export function ReportButton(props: Props) {
  const { kind, label = "Report", className = "" } = props;
  const [open, setOpen] = useState(false);
  const action =
    kind === "listing" ? reportListingFromForm : reportUserFromForm;
  const [state, formAction, pending] = useActionState<ReportFormState, FormData>(
    action,
    {}
  );

  const title =
    kind === "listing" ? "Report this listing" : "Report this user";
  const description =
    kind === "listing"
      ? "Tell us what is wrong with this listing. Our team will review your report."
      : "Tell us what is wrong with this user. Our team will review your report.";

  const buttonClass =
    className ||
    "text-sm font-medium text-zinc-500 underline hover:text-red-600";

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={buttonClass}>
        {label}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg dark:bg-zinc-900">
            <h2 className="text-lg font-semibold">{title}</h2>
            <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
              {description}
            </p>

            {state.success ? (
              <p className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
                Thanks — your report was submitted.
              </p>
            ) : (
              <form action={formAction} className="mt-4 space-y-4">
                {kind === "listing" ? (
                  <input
                    type="hidden"
                    name="listing_id"
                    value={props.listingId}
                  />
                ) : (
                  <>
                    <input
                      type="hidden"
                      name="reported_user_id"
                      value={props.reportedUserId}
                    />
                    {props.listingId && (
                      <input
                        type="hidden"
                        name="listing_id"
                        value={props.listingId}
                      />
                    )}
                    {props.conversationId && (
                      <input
                        type="hidden"
                        name="conversation_id"
                        value={props.conversationId}
                      />
                    )}
                  </>
                )}

                <div>
                  <label
                    htmlFor={`report-reason-${kind}`}
                    className="mb-1 block text-sm font-medium"
                  >
                    Reason
                  </label>
                  <select
                    id={`report-reason-${kind}`}
                    name="reason"
                    required
                    defaultValue=""
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  >
                    <option value="" disabled>
                      Select a reason
                    </option>
                    {REPORT_REASONS.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor={`report-details-${kind}`}
                    className="mb-1 block text-sm font-medium"
                  >
                    Details (optional)
                  </label>
                  <textarea
                    id={`report-details-${kind}`}
                    name="details"
                    rows={3}
                    maxLength={1000}
                    placeholder="Add any helpful context..."
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </div>

                {state.error && (
                  <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
                    {state.error}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="flex-1 rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pending}
                    className="flex-1 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                  >
                    {pending ? "Submitting..." : "Submit report"}
                  </button>
                </div>
              </form>
            )}

            {state.success && (
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-medium dark:border-zinc-700"
              >
                Close
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
