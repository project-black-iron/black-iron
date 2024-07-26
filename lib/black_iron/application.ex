defmodule BlackIron.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  @impl true
  def start(_type, _args) do
    children = [
      BlackIronWeb.Telemetry,
      BlackIron.Repo,
      {DNSCluster, query: Application.get_env(:black_iron, :dns_cluster_query) || :ignore},
      {Phoenix.PubSub, name: BlackIron.PubSub},
      # Start the Finch HTTP client for sending emails
      {Finch, name: BlackIron.Finch},
      # Start a worker by calling: BlackIron.Worker.start_link(arg)
      # {BlackIron.Worker, arg},
      # Start to serve requests, typically the last entry
      BlackIronWeb.Endpoint
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: BlackIron.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  @impl true
  def config_change(changed, _new, removed) do
    BlackIronWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
