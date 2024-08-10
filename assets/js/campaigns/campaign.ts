export interface BlackIronCampaignSchema {
  campaigns: {
    key: string;
    value: BlackIronCampaignData;
  };
}

export interface BlackIronCampaignData {
  id: string;
  title: string;
  characters: string[];
}

export class BlackIronCampaign {
  constructor(
    public id: string,
    public data: BlackIronCampaignData,
  ) {}
}
