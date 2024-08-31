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

alias BlackIron.Repo
alias BlackIron.Entities
alias BlackIron.Accounts

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
  
  {:ok, _campaign} = Entities.create_entity(BlackIron.Campaigns.Campaign, %{
    "data" => %{
      "__type__" => "campaign",
      "name" => "Sample Campaign",
      "description" => "This is a sample campaign",
      "memberships" => [%{"user_id" => user.pid, "role" => "owner"}]
    }
  })
end