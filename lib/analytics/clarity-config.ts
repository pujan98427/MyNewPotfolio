const CLARITY_PROJECT_ID_PATTERN = /^[a-z0-9]+$/i;

/**
 * A Clarity project ID is a public browser identifier, not a secret. Returning
 * an empty string keeps the integration, consent UI, and CSP additions off.
 */
export function normalizeClarityProjectId(value: string | undefined) {
  const projectId = value?.trim() ?? "";
  return projectId.length <= 64 && CLARITY_PROJECT_ID_PATTERN.test(projectId)
    ? projectId
    : "";
}

export function isClarityEnabled(value: string | undefined) {
  return value?.trim().toLowerCase() === "true";
}
