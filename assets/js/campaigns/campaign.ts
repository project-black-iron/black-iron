export interface BlackIronCampaignSchema {
  campaigns: {
    key: string;
    value: BlackIronCampaignData;
  }
}

export interface BlackIronCampaignData {
  title: string;
  characters: string[];
}

export class BlackIronCampaign {

}
