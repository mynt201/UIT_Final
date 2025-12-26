export interface Settings {
  theme: "light" | "dark";
  language: "vi" | "en";
  dateFormat: "dd/mm/yyyy" | "mm/dd/yyyy" | "yyyy-mm-dd";
  mapStyle: "default" | "satellite" | "terrain";
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  autoRefresh: boolean;
  refreshInterval: number;
  defaultView: "map" | "list" | "chart";
}

