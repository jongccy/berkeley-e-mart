"use client";

import { useRef } from "react";
import { ProfileAvatar } from "@/components/ProfileAvatar";

type Props = {
  avatarUrl: string | null;
  action: (formData: FormData) => Promise<void>;
};

export function AvatarUpload({ avatarUrl, action }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form
      ref={formRef}
      action={action}
      className="flex flex-col items-center gap-2"
    >
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="rounded-full focus:outline-none focus:ring-2 focus:ring-[#003262]"
        aria-label="Change photo"
      >
        <ProfileAvatar avatarUrl={avatarUrl} />
      </button>
      <input
        ref={inputRef}
        name="avatar"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={() => formRef.current?.requestSubmit()}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="text-sm font-medium text-[#003262] underline dark:text-[#FDB515]"
      >
        Change Photo
      </button>
    </form>
  );
}
