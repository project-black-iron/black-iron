# Script for populating the database. You can run it as:
#
#     mix run priv/repo/seeds.exs
#
# Inside the script, you can read and write to any of your
# repositories directly:
#
#     BlackIron.Repo.insert!(%BlackIron.SomeSchema{})
#
# We recommend using the bang functions (`insert!`, `update!`
# and so on) as they will fail if something goes wrong.

portrait_data_uri =
  "data:image/svg+xml,%3C%3Fxml%20version%3D%221.0%22%20encoding%3D%22utf-8%22%3F%3E%3C!--%20License%3A%20MIT.%20Made%20by%20artcoholic%3A%20https%3A%2F%2Fgithub.com%2Fartcoholic%2Fakar-icons%20--%3E%3Csvg%20width%3D%22800px%22%20height%3D%22800px%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Ccircle%20cx%3D%2212%22%20cy%3D%227%22%20r%3D%225%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%2F%3E%3Cpath%20d%3D%22M17%2014H17.3517C18.8646%2014%2020.1408%2015.1266%2020.3285%2016.6279L20.719%2019.7519C20.8682%2020.9456%2019.9374%2022%2018.7344%2022H5.26556C4.06257%2022%203.1318%2020.9456%203.28101%2019.7519L3.67151%2016.6279C3.85917%2015.1266%205.13538%2014%206.64835%2014H7%22%20stroke%3D%22%23000000%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%2F%3E%3C%2Fsvg%3E"

alias BlackIron.Accounts
alias BlackIron.Campaigns
alias BlackIron.PCs
alias BlackIron.Repo

if Application.fetch_env!(:black_iron, :env) == :dev do
  {:ok, user} =
    Accounts.register_user(%{
      handle: "sampleuser",
      email: "example@blackiron.quest",
      password: "foobarbazquux",
      password_confirmation: "foobarbazquux"
    })

  {:ok, _} = Repo.transaction(Accounts.confirm_user_multi(user))

  user = user |> Repo.reload()

  {:ok, campaign} =
    Campaigns.create_campaign(user, %{
      "data" => %{
        "name" => "Sample Campaign",
        "description" => "This is a sample campaign"
      }
    })

  {:ok, _pc} =
    PCs.create_pc(user, campaign, %{
      "data" => %{
        "name" => "Kiara Doe",
        "description" => "This is a description for Kiara",
        "player" => "Kat",
        "xp_added" => 0,
        "xp_spent" => 0,
        "pronouns" => "they/them",
        "alias" => "Lace",
        "portrait" => portrait_data_uri,
        "initiative" => "Out of combat",
        "stats" => %{
          "edge" => 3,
          "heart" => 2,
          "iron" => 2,
          "shadow" => 1,
          "wits" => 1
        },
        "meters" => %{
          "health" => 5,
          "spirit" => 5,
          "supply" => 5
        },
        "momentum" => %{
          "value" => 2,
          "reset" => 2,
          "max" => 10
        },
        "special_tracks" => %{
          "bonds" => 0,
          "quests" => 0,
          "discoveries" => 0
        },
        "impacts" => %{
          "misfortunes" => %{
            "wounded" => false,
            "shaken" => false,
            "unprepared" => false
          }
        },
        "assets" => []
      }
    })
end
