export interface Settings {
  theme: "light" | "dark";
  language: "vi" | "en";
  dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
  mapStyle: "default" | "satellite" | "terrain";
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultView: "map" | "list" | "chart";
  fontSize: "small" | "medium" | "large";
  mapDefaultZoom: number;
  mapAnimation: boolean;
  autoSave: boolean;
  showTooltips: boolean;
}

