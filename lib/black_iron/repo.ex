defmodule BlackIron.Repo do
  use Ecto.Repo,
    otp_app: :black_iron,
    adapter: Ecto.Adapters.Postgres
end
