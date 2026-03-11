"use client";

import { openPrivacySettings } from "@/src/privacy/consent";

export default function OpenPrivacySettingsButton() {
  return (
    <button
      type="button"
      className="hover:underline"
      onClick={() => openPrivacySettings()}
    >
      Cookie settings
    </button>
  );
}

