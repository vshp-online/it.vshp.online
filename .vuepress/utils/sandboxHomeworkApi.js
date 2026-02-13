const DEFAULT_SANDBOX_API_BASE = "https://sandbox.vshp.tech/api/v1";

function joinUrl(base, path) {
  const normalizedBase = String(base || DEFAULT_SANDBOX_API_BASE).replace(/\/+$/, "");
  const normalizedPath = String(path || "").replace(/^\/+/, "");
  return `${normalizedBase}/${normalizedPath}`;
}

async function parseJsonSafely(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function buildApiError(response, payload) {
  const message =
    payload?.error ||
    payload?.message ||
    `HTTP ${response.status}: ${response.statusText || "API request failed"}`;

  const error = new Error(message);
  error.status = response.status;
  error.code = payload?.code || "API_ERROR";
  error.payload = payload;
  return error;
}

export async function sandboxApiRequest(path, { token, method = "GET", body, signal } = {}) {
  if (!token) {
    const error = new Error("Токен авторизации отсутствует");
    error.status = 401;
    error.code = "AUTH_TOKEN_REQUIRED";
    throw error;
  }

  const response = await fetch(joinUrl(DEFAULT_SANDBOX_API_BASE, path), {
    method,
    signal,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await parseJsonSafely(response);

  if (!response.ok) {
    throw buildApiError(response, payload);
  }

  return payload;
}

export const sandboxHomeworkApi = {
  getMe({ token, signal } = {}) {
    return sandboxApiRequest("me", { token, signal });
  },
  getDisciplines({ token, signal } = {}) {
    return sandboxApiRequest("disciplines", { token, signal });
  },
  getHomeworkGroups(disciplineCode, { token, signal } = {}) {
    return sandboxApiRequest(`disciplines/${encodeURIComponent(disciplineCode)}/homework-groups`, {
      token,
      signal,
    });
  },
  getAssignments(groupCode, { token, signal } = {}) {
    return sandboxApiRequest(`homework-groups/${encodeURIComponent(groupCode)}/assignments`, {
      token,
      signal,
    });
  },
  getAssignment(assignmentCode, { token, signal } = {}) {
    return sandboxApiRequest(`assignments/${encodeURIComponent(assignmentCode)}`, { token, signal });
  },
  getDraft(assignmentCode, { token, signal } = {}) {
    return sandboxApiRequest(`assignments/${encodeURIComponent(assignmentCode)}/draft`, { token, signal });
  },
  saveDraft(assignmentCode, code, { token, signal } = {}) {
    return sandboxApiRequest(`assignments/${encodeURIComponent(assignmentCode)}/draft`, {
      token,
      signal,
      method: "PUT",
      body: { code },
    });
  },
  run(assignmentCode, code, { token, signal } = {}) {
    return sandboxApiRequest(`assignments/${encodeURIComponent(assignmentCode)}/run`, {
      token,
      signal,
      method: "POST",
      body: { code },
    });
  },
  submit(assignmentCode, code, { token, signal } = {}) {
    return sandboxApiRequest(`assignments/${encodeURIComponent(assignmentCode)}/submit`, {
      token,
      signal,
      method: "POST",
      body: { code },
    });
  },
  getRuns(assignmentCode, { token, signal, limit = 20 } = {}) {
    return sandboxApiRequest(`assignments/${encodeURIComponent(assignmentCode)}/runs?limit=${limit}`, {
      token,
      signal,
    });
  },
  getSubmissions(assignmentCode, { token, signal, limit = 20 } = {}) {
    return sandboxApiRequest(
      `assignments/${encodeURIComponent(assignmentCode)}/submissions?limit=${limit}`,
      {
        token,
        signal,
      },
    );
  },
  getAccountHomeworkHistory({ token, signal } = {}) {
    return sandboxApiRequest("account/homework-history", { token, signal });
  },
};
