defmodule BlackIronWeb.CharactersController do
  use BlackIronWeb, :controller

  def index(conn, _params) do
    render(conn, :index)
  end

  def show(conn, params) do
    campaign =
      if params["campaignId"] != "__campaignId" do
        %{
          id: params["campaignId"],
          name: "Campaign #{params["campaignId"]}",
          description: "This is a description for Campaign #{params["campaignId"]}",
          alias_label: "Callsign"
        }
      end

    character =
      if campaign && params["characterId"] != "__characterId" do
        %{
          id: params["characterId"],
          name: "Character #{params["characterId"]}",
          description: "This is a description for Character #{params["characterId"]}",
          campaign_id: campaign.id,
          player: "Player #{params["characterId"]}",
          xp_added: 0,
          xp_spent: 0,
          pronouns: "they/them",
          alias: "Callsign #{params["characterId"]}",
          portrait: "https://localhost:4000/portraits/#{params["characterId"]}.png",
          initiative: "Out of combat",
          stats: [
            %{
              name: "edge",
              label: "Edge",
              value: 3
            },
            %{
              name: "heart",
              label: "Heart",
              value: 2
            },
            %{
              name: "iron",
              label: "Iron",
              value: 2
            },
            %{
              name: "shadow",
              label: "Shadow",
              value: 1
            },
            %{
              name: "wits",
              label: "Wits",
              value: 1
            }
          ],
          meters: [
            %{
              name: "health",
              label: "Health",
              value: 5,
              max: 5
            },
            %{
              name: "spirit",
              label: "Spirit",
              value: 5,
              max: 5
            },
            %{
              name: "supply",
              label: "Supply",
              value: 5,
              max: 5
            }
          ],
          momentum: %{
            value: 2,
            reset: 2,
            max: 10
          },
          special_tracks: [
            %{
              name: "bonds",
              label: "Bonds",
              ticks: 0
            },
            %{
              name: "quests",
              label: "Quests",
              ticks: 0
            },
            %{
              name: "discoveries",
              label: "Discoveries",
              ticks: 0
            }
          ],
          impacts: [
            %{
              name: "misfortunes",
              label: "Misfortunes",
              contents: [
                %{
                  name: "wounded",
                  label: "Wounded",
                  value: false
                },
                %{
                  name: "shaken",
                  label: "Shaken",
                  value: false
                },
                %{
                  name: "unprepared",
                  label: "Unprepared",
                  value: false
                }
              ]
            }
          ]
        }
      end

    render(conn, :show,
      campaignId: params["campaignId"],
      cslug: params["cslug"],
      campaign: campaign,
      character: character
    )
  end
end
