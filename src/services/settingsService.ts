import { api } from "../plugins/axios";
import type { Settings } from "../types";

interface BackendSettings {
  theme?: string;
  language?: string;
  dashboard?: {
    defaultView?: string;
    refreshInterval?: number;
    showNotifications?: boolean;
  };
  notifications?: {
    email?: { enabled?: boolean };
    browser?: { enabled?: boolean };
    sms?: { enabled?: boolean };
  };
  accessibility?: {
    fontSize?: string;
  };
}

function backendToFrontend(b: BackendSettings | null, defaults: Settings): Settings {
  if (!b) return defaults;
  return {
    ...defaults,
    theme: (b.theme as "light" | "dark") || defaults.theme,
    language: (b.language as "vi" | "en") || defaults.language,
    fontSize: (b.accessibility?.fontSize as "small" | "medium" | "large") || defaults.fontSize,
    defaultView: (b.dashboard?.defaultView as "map" | "list" | "chart") || defaults.defaultView,
    refreshInterval: b.dashboard?.refreshInterval ?? defaults.refreshInterval,
    notifications: b.notifications?.email?.enabled ?? b.notifications?.browser?.enabled ?? defaults.notifications,
  };
}

function frontendToBackend(s: Partial<Settings>): Partial<BackendSettings> {
  const body: Partial<BackendSettings> = {};
  if (s.theme) body.theme = s.theme;
  if (s.language) body.language = s.language;
  if (s.fontSize) body.accessibility = { ...(body.accessibility || {}), fontSize: s.fontSize };
  if (s.defaultView) body.dashboard = { ...(body.dashboard || {}), defaultView: s.defaultView };
  if (s.refreshInterval != null) body.dashboard = { ...(body.dashboard || {}), refreshInterval: s.refreshInterval };
  if (s.notifications != null) {
    body.notifications = {
      email: { enabled: s.notifications },
      browser: { enabled: s.notifications },
    };
  }
  return body;
}

export const settingsService = {
  async getSettings(): Promise<Settings | null> {
    try {
      const res = await api.get<{ success: boolean; settings: BackendSettings }>("/settings");
      return backendToFrontend(res.data.settings, getDefaults());
    } catch {
      return null;
    }
  },

  async updateSettings(partial: Partial<Settings>): Promise<boolean> {
    try {
      const body = frontendToBackend(partial);
      await api.put("/settings", body);
      return true;
    } catch {
      return false;
    }
  },

  async resetSettings(): Promise<boolean> {
    try {
      await api.post("/settings/reset");
      return true;
    } catch {
      return false;
    }
  },
};

function getDefaults(): Settings {
  return {
    theme: "dark",
    language: "vi",
    dateFormat: "dd/mm/yyyy",
    mapStyle: "default",
    notifications: true,
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    autoRefresh: false,
    refreshInterval: 30000,
    defaultView: "map",
    fontSize: "medium",
    mapDefaultZoom: 13,
    mapAnimation: true,
    autoSave: false,
    showTooltips: true,
  };
}
