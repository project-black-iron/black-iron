defmodule BlackIronWeb.OfflineController do
  @moduledoc """
  This module handles a response that the service worker is supposed to render
  when the player is offline and tries to reach a route that isn't cached (or
  doesn't exist).
  """
  use BlackIronWeb, :controller

  def site(conn, _params) do
    conn
    |> render(:site)
  end

  @doc """
  Gets the list of static paths that a service worker should precache.
  """
  def static_paths(conn, _params) do
    static_paths = get_static_paths()

    conn
    |> render(:static_paths, paths: static_paths)
  end

  @doc """
  Gets the list of app-related dynamic paths that a service worker should
  precache.
  """
  def app_paths(conn, _params) do
    app_paths = get_app_paths()

    conn
    |> render(:app_paths, paths: app_paths)
  end

  defp get_static_paths do
    static_dir = Path.expand(Path.join(__DIR__, "../../../priv/static/"))
    static_len = String.length(static_dir)
    Path.wildcard(Path.join(static_dir, "**/*"))
    |> Enum.filter(&File.regular?/1)
    |> Enum.map(&String.slice(&1, static_len..String.length(&1)))
  end

  defp get_app_paths do
    Phoenix.Router.routes(BlackIronWeb.Router)
    |> Enum.filter(&(&1[:verb] == :get))
    |> Enum.map(&Phoenix.Router.route_info(BlackIronWeb.Router, "GET", &1[:path], ""))
    |> Enum.filter(
      &Enum.member?(&1[:pipe_through], :service_worker)
    )
    |> Enum.map(& &1[:route])
  end
end
