export interface CampaignSchema {
  campaigns: {
    key: string;
    value: CampaignData;
  };
}

export interface CampaignData {
  id: string;
  name: string;
  slug: string;
  description: string;
  roles: string[];
}

export class Campaign implements CampaignData {
  id: string;
  name: string;
  slug: string;
  description: string;
  roles: string[];

  constructor(
    public data: CampaignData,
  ) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    this.description = data.description;
    this.roles = data.roles;
  }
}
