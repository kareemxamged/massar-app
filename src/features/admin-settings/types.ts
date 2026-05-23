export interface SocialLinks {
  facebook?:  string;
  twitter?:   string;
  instagram?: string;
  linkedin?:  string;
  youtube?:   string;
}

export interface SystemSettings {
  id:                            number;
  site_name:                     string;
  site_logo_url:                 string | null;
  favicon_url:                   string | null;
  maintenance_mode:              boolean;
  maintenance_message:           string | null;
  contact_email:                 string | null;
  support_phone:                 string | null;
  social_links:                  SocialLinks;
  enable_student_chat:           boolean;
  show_exam_results_immediately: boolean;
  broadcast_message:             string | null;
  updated_at:                    string;
}

export type SettingsPatch = Partial<Omit<SystemSettings, 'id' | 'updated_at'>>;
